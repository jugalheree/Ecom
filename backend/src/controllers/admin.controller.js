import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as adminService from "../services/admin.service.js";

export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, role } = req.query;
  const result = await adminService.getAllUsers({ page: parseInt(page, 10), limit: parseInt(limit, 10), role });
  return res.status(200).json(new ApiResponse(200, result, "Users fetched"));
});

export const getVendors = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await adminService.getAllVendors({ page: parseInt(page, 10), limit: parseInt(limit, 10), status });
  return res.status(200).json(new ApiResponse(200, result, "Vendors fetched"));
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getPlatformAnalytics();
  return res.status(200).json(new ApiResponse(200, analytics, "Analytics fetched"));
});

export const getOrders = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await adminService.getAllOrders({ page: parseInt(page, 10), limit: parseInt(limit, 10) });
  return res.status(200).json(new ApiResponse(200, result, "Orders fetched"));
});

export const getClaims = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await adminService.getAllClaims({ page: parseInt(page, 10), limit: parseInt(limit, 10), status });
  return res.status(200).json(new ApiResponse(200, result, "Claims fetched"));
});

export const approveClaim = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const claim = await adminService.approveClaim(claimId);
  return res.status(200).json(new ApiResponse(200, claim, "Claim approved"));
});

export const rejectClaim = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const { reason } = req.body || {};
  const claim = await adminService.rejectClaim(claimId, reason);
  return res.status(200).json(new ApiResponse(200, claim, "Claim rejected"));
});
