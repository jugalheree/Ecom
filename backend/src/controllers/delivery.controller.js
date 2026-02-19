import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as deliveryService from "../services/delivery.service.js";

export const getAssignedDeliveries = asyncHandler(async (req, res) => {
  const deliveryUserId = req.user._id;
  const assignments = await deliveryService.getAssignedDeliveries(deliveryUserId);
  return res.status(200).json(new ApiResponse(200, { deliveries: assignments }, "Deliveries fetched"));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const deliveryUserId = req.user._id;
  const { assignmentId } = req.params;
  const { status } = req.body;
  const updated = await deliveryService.updateDeliveryStatus(deliveryUserId, assignmentId, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Assignment not found" });
  }
  return res.status(200).json(new ApiResponse(200, updated, "Status updated"));
});

export const markDelivered = asyncHandler(async (req, res) => {
  const deliveryUserId = req.user._id;
  const { assignmentId } = req.params;
  const updated = await deliveryService.markDelivered(deliveryUserId, assignmentId);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Assignment not found" });
  }
  return res.status(200).json(new ApiResponse(200, updated, "Marked as delivered"));
});

export const uploadProof = asyncHandler(async (req, res) => {
  const deliveryUserId = req.user._id;
  const { assignmentId } = req.params;
  const fileRef = req.file ? { url: req.file.path } : req.body;
  const updated = await deliveryService.uploadProofOfDelivery(deliveryUserId, assignmentId, fileRef);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Assignment not found" });
  }
  return res.status(200).json(new ApiResponse(200, updated, "Proof of delivery uploaded"));
});
