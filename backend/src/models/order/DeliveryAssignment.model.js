import mongoose from "mongoose";

/**
 * DeliveryAssignment — links an Order to a delivery employee
 * This is how Amazon/Flipkart assigns packages to delivery staff.
 * 
 * Flow:
 * Admin assigns order → ASSIGNED
 * Delivery guy accepts  → ACCEPTED
 * Picks up from vendor  → PICKED_UP  (vendor gets notified)
 * Out for delivery      → OUT_FOR_DELIVERY
 * Delivered             → DELIVERED
 * Failed attempt        → FAILED
 */
const deliveryAssignmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    status: {
      type: String,
      enum: ["ASSIGNED", "ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "REASSIGNED"],
      default: "ASSIGNED",
    },
    // Notes/updates from delivery person visible to vendor
    deliveryNotes: [
      {
        message: String,
        status: String,
        timestamp: { type: Date, default: Date.now },
        visibleToVendor: { type: Boolean, default: true },
        visibleToBuyer: { type: Boolean, default: true },
      },
    ],
    pickedUpAt:    Date,
    deliveredAt:   Date,
    failedAt:      Date,
    failReason:    String,
    attemptCount:  { type: Number, default: 0 },
    assignedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Snapshot of vendor staff name/phone so populate on User ref is not needed
    vendorStaffSnapshot: {
      name:  { type: String },
      phone: { type: String },
    },
  },
  { timestamps: true }
);

deliveryAssignmentSchema.index({ orderId: 1, deliveryPersonId: 1 });

export const DeliveryAssignment = mongoose.model("DeliveryAssignment", deliveryAssignmentSchema);