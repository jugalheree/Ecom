import { User } from "../models/auth/User.model.js";
import { Vendor } from "../models/vender/Vender.model.js";

/**
 * Get all users (paginated, optional role filter)
 */
export async function getAllUsers(options = {}) {
  const { page = 1, limit = 20, role } = options;
  const skip = (page - 1) * limit;
  const filter = role ? { role } : {};
  const [users, total] = await Promise.all([
    User.find(filter).select("-password -refreshToken").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * Get all vendors (with user info)
 */
export async function getAllVendors(options = {}) {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;
  const filter = status ? { status } : {};
  const [vendors, total] = await Promise.all([
    Vendor.find(filter).populate("userId", "name email role").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Vendor.countDocuments(filter),
  ]);
  return { vendors, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * Platform analytics (counts + mock trend data)
 */
export async function getPlatformAnalytics() {
  const [userCount, vendorCount] = await Promise.all([
    User.countDocuments(),
    Vendor.countDocuments(),
  ]);
  const approvedVendors = await Vendor.countDocuments({ status: "APPROVED" });
  return {
    totalUsers: userCount,
    totalVendors: vendorCount,
    approvedVendors,
    pendingVendors: await Vendor.countDocuments({ status: "PENDING" }),
    totalOrders: 1248,
    ordersThisMonth: 186,
    revenueThisMonth: 284500,
  };
}

/**
 * List all orders (mock for now - can be replaced with Order model later)
 */
export async function getAllOrders(options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  const mockOrders = [
    { _id: "1", orderId: "ORD-1001", buyerName: "Rahul M.", amount: 3499, status: "DELIVERED", createdAt: new Date() },
    { _id: "2", orderId: "ORD-1002", buyerName: "Neha S.", amount: 4999, status: "SHIPPED", createdAt: new Date() },
    { _id: "3", orderId: "ORD-1003", buyerName: "Aman P.", amount: 1999, status: "PENDING", createdAt: new Date() },
    { _id: "4", orderId: "ORD-1004", buyerName: "Priya K.", amount: 8999, status: "DELIVERED", createdAt: new Date() },
    { _id: "5", orderId: "ORD-1005", buyerName: "Vikram R.", amount: 2499, status: "CANCELLED", createdAt: new Date() },
  ];
  const total = mockOrders.length;
  const orders = mockOrders.slice(skip, skip + limit);
  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * List claims (mock - can be replaced with Claim/Complaint model later)
 */
export async function getAllClaims(options = {}) {
  const { page = 1, limit = 20, status } = options;
  const mockClaims = [
    { _id: "c1", claimId: "CLM-201", userId: "u1", type: "REFUND", amount: 500, status: "PENDING", createdAt: new Date() },
    { _id: "c2", claimId: "CLM-202", userId: "u2", type: "DAMAGED", amount: 1200, status: "PENDING", createdAt: new Date() },
    { _id: "c3", claimId: "CLM-203", userId: "u3", type: "REFUND", amount: 350, status: "APPROVED", createdAt: new Date() },
  ];
  let list = status ? mockClaims.filter((c) => c.status === status) : mockClaims;
  const total = list.length;
  const skip = (page - 1) * limit;
  list = list.slice(skip, skip + limit);
  return { claims: list, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * Approve a claim (mock - updates in-memory; replace with real model when available)
 */
export async function approveClaim(claimId) {
  const claim = { _id: claimId, claimId, status: "APPROVED", approvedAt: new Date() };
  return claim;
}

/**
 * Reject a claim (mock)
 */
export async function rejectClaim(claimId, reason) {
  const claim = { _id: claimId, claimId, status: "REJECTED", rejectedAt: new Date(), reason: reason || "Rejected by admin" };
  return claim;
}
