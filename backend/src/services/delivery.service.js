/**
 * Mock delivery assignments keyed by delivery user id.
 * Replace with DeliveryAssignment model when available.
 */
const mockAssignmentsByDeliveryUser = new Map();

function getMockAssignments(deliveryUserId) {
  const id = String(deliveryUserId);
  if (!mockAssignmentsByDeliveryUser.has(id)) {
    mockAssignmentsByDeliveryUser.set(id, [
      { _id: "d1", orderId: "ORD-1001", address: "123 Main St, City", status: "ASSIGNED", customerName: "Rahul M.", phone: "9876543210" },
      { _id: "d2", orderId: "ORD-1002", address: "456 Park Ave, City", status: "PICKED_UP", customerName: "Neha S.", phone: "9876543211" },
      { _id: "d3", orderId: "ORD-1003", address: "789 Oak Rd, City", status: "OUT_FOR_DELIVERY", customerName: "Aman P.", phone: "9876543212" },
    ]);
  }
  return mockAssignmentsByDeliveryUser.get(id);
}

/**
 * Get deliveries assigned to this delivery user
 */
export async function getAssignedDeliveries(deliveryUserId) {
  const assignments = getMockAssignments(deliveryUserId);
  return assignments.map((a) => ({ ...a }));
}

/**
 * Update delivery status (ASSIGNED | PICKED_UP | OUT_FOR_DELIVERY | DELIVERED)
 */
export async function updateDeliveryStatus(deliveryUserId, assignmentId, status) {
  const assignments = getMockAssignments(deliveryUserId);
  const a = assignments.find((x) => String(x._id) === String(assignmentId));
  if (!a) return null;
  a.status = status;
  if (status === "DELIVERED") a.deliveredAt = new Date();
  return a;
}

/**
 * Mark as delivered (convenience for status = DELIVERED)
 */
export async function markDelivered(deliveryUserId, assignmentId) {
  return updateDeliveryStatus(deliveryUserId, assignmentId, "DELIVERED");
}

/**
 * Upload proof of delivery (mock - returns success with mock url)
 */
export async function uploadProofOfDelivery(deliveryUserId, assignmentId, fileRef) {
  const assignments = getMockAssignments(deliveryUserId);
  const a = assignments.find((x) => String(x._id) === String(assignmentId));
  if (!a) return null;
  a.proofUrl = fileRef?.url || "https://mock-cdn.example.com/proof/" + assignmentId + ".jpg";
  a.proofUploadedAt = new Date();
  return a;
}
