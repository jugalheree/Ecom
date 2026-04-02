import { DeliveryAssignment } from "../models/order/DeliveryAssignment.model.js";
import { Order } from "../models/order/Order.model.js";
import { User } from "../models/auth/User.model.js";
import { Vendor } from "../models/vendor/Vendor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// ── Admin: Get all delivery staff ─────────────────────────────────────────
export const getDeliveryStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: "EMPLOYEE", isActive: true, isBlocked: false })
    .select("name email phone lastLoginAt")
    .lean();

  // Get active assignment counts per staff
  const counts = await DeliveryAssignment.aggregate([
    { $match: {
        status: { $in: ["ASSIGNED","ACCEPTED","PICKED_UP","OUT_FOR_DELIVERY"] },
        deliveryPersonId: { $ne: null },
    }},
    { $group: { _id: "$deliveryPersonId", active: { $sum: 1 } } },
  ]);
  const countMap = {};
  counts.forEach(c => { if (c._id != null) countMap[c._id.toString()] = c.active; });

  const result = staff.map(s => ({
    ...s,
    activeDeliveries: countMap[s._id.toString()] || 0,
  }));

  return res.status(200).json(new ApiResponse(200, result, "Delivery staff fetched"));
});

// ── Admin: Assign order to delivery person ───────────────────────────────
export const assignDelivery = asyncHandler(async (req, res) => {
  const { orderId, deliveryPersonId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(deliveryPersonId)) {
    throw new ApiError(400, "Invalid order or delivery person ID");
  }

  const [order, deliveryPerson] = await Promise.all([
    Order.findById(orderId),
    User.findOne({ _id: deliveryPersonId, role: "EMPLOYEE", isActive: true }),
  ]);

  if (!order) throw new ApiError(404, "Order not found");
  if (!deliveryPerson) throw new ApiError(404, "Delivery person not found");

  if (["DELIVERED","CANCELLED","REFUNDED"].includes(order.orderStatus)) {
    throw new ApiError(400, "Cannot assign a completed or cancelled order");
  }

  // Check if already assigned
  const existing = await DeliveryAssignment.findOne({
    orderId,
    status: { $nin: ["FAILED","REASSIGNED"] },
  });
  if (existing) {
    // Reassign — mark old as REASSIGNED
    existing.status = "REASSIGNED";
    await existing.save();
  }

  // Get vendor from first item
  const vendorId = order.items?.[0]?.vendorId;

  const assignment = await DeliveryAssignment.create({
    orderId,
    deliveryPersonId,
    vendorId,
    status: "ASSIGNED",
    assignedBy: req.user._id,
    deliveryNotes: [{
      message: `Order assigned to ${deliveryPerson.name} by admin`,
      status: "ASSIGNED",
      visibleToVendor: true,
      visibleToBuyer: false,
    }],
  });

  // Update order tracking
  order.deliveryTracking.push({
    status: "PROCESSING",
    message: `Delivery partner assigned: ${deliveryPerson.name}`,
    timestamp: new Date(),
  });
  await order.save();

  return res.status(201).json(new ApiResponse(201, assignment, "Order assigned to delivery person"));
});

// ── Delivery: Get my assigned orders ────────────────────────────────────
export const getMyAssignments = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = { deliveryPersonId: req.user._id };
  if (status) filter.status = status;
  else filter.status = { $nin: ["REASSIGNED"] };

  const assignments = await DeliveryAssignment.find(filter)
    .sort({ createdAt: -1 })
    .populate({
      path: "orderId",
      select: "orderNumber totalAmount orderStatus deliveryAddress deliveryTracking paymentStatus createdAt",
      populate: { path: "buyerId", select: "name phone" },
    })
    .lean();

  return res.status(200).json(new ApiResponse(200, assignments, "Assignments fetched"));
});

// ── Delivery: Update status + send note to vendor ────────────────────────
export const updateAssignmentStatus = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { status, message } = req.body;

  const VALID_TRANSITIONS = {
    ASSIGNED:         ["ACCEPTED"],
    ACCEPTED:         ["PICKED_UP"],
    PICKED_UP:        ["OUT_FOR_DELIVERY"],
    OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
  };

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) throw new ApiError(400, "Invalid assignment ID");

  const assignment = await DeliveryAssignment.findOne({
    _id: assignmentId,
    deliveryPersonId: req.user._id,
  }).populate("orderId");

  if (!assignment) throw new ApiError(404, "Assignment not found");

  const allowed = VALID_TRANSITIONS[assignment.status];
  if (!allowed || !allowed.includes(status)) {
    throw new ApiError(400, `Cannot transition from ${assignment.status} to ${status}`);
  }

  assignment.status = status;

  const note = message || {
    ACCEPTED:         "Delivery partner accepted the order",
    PICKED_UP:        `Package picked up from vendor at ${new Date().toLocaleTimeString("en-IN")}`,
    OUT_FOR_DELIVERY: "Out for delivery — arriving soon",
    DELIVERED:        "Order delivered successfully",
    FAILED:           req.body.failReason || "Delivery attempt failed",
  }[status];

  // Track timestamps
  if (status === "PICKED_UP")        assignment.pickedUpAt  = new Date();
  if (status === "DELIVERED")        assignment.deliveredAt = new Date();
  if (status === "FAILED") {
    assignment.failedAt    = new Date();
    assignment.failReason  = req.body.failReason || "Delivery failed";
    assignment.attemptCount += 1;
  }

  // Add note (visible to vendor for PICKED_UP+)
  assignment.deliveryNotes.push({
    message:         note,
    status,
    visibleToVendor: ["PICKED_UP","OUT_FOR_DELIVERY","DELIVERED","FAILED"].includes(status),
    visibleToBuyer:  true,
    timestamp:       new Date(),
  });

  // Update the order tracking too
  const order = assignment.orderId;
  if (order) {
    const trackStatusMap = {
      PICKED_UP:        "PICKED_UP",
      OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
      DELIVERED:        "DELIVERED",
    };
    if (trackStatusMap[status]) {
      order.orderStatus = trackStatusMap[status];
      order.deliveryTracking.push({
        status:    trackStatusMap[status],
        message:   note,
        timestamp: new Date(),
      });
      if (status === "DELIVERED") {
        order.items.forEach(item => {
          if (item.status !== "CANCELLED") {
            item.status      = "DELIVERED";
            item.deliveredAt = new Date();
          }
        });
      }
      await order.save();
    }
  }

  await assignment.save();
  return res.status(200).json(new ApiResponse(200, assignment, "Status updated"));
});

// ── Vendor: See delivery notes for their orders ──────────────────────────
export const getVendorDeliveryUpdates = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!vendor) throw new ApiError(404, "Vendor not found");

  const assignments = await DeliveryAssignment.find({ vendorId: vendor._id })
    .sort({ updatedAt: -1 })
    .limit(20)
    .populate({ path: "orderId", select: "orderNumber totalAmount orderStatus deliveryAddress" })
    .populate({ path: "deliveryPersonId", select: "name phone" })
    .lean();

  // Filter notes visible to vendor
  const result = assignments.map(a => ({
    ...a,
    deliveryNotes: a.deliveryNotes.filter(n => n.visibleToVendor),
  }));

  return res.status(200).json(new ApiResponse(200, result, "Delivery updates fetched"));
});

// ── Admin: Get all assignments ────────────────────────────────────────────
export const getAllAssignments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const assignments = await DeliveryAssignment.find(filter)
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .populate({ path: "orderId", select: "orderNumber totalAmount orderStatus deliveryAddress" })
    .populate({ path: "deliveryPersonId", select: "name phone" })
    .lean();

  const total = await DeliveryAssignment.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      assignments,
      pagination: { total, currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    }, "Assignments fetched")
  );
});
