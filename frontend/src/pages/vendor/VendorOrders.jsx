import { useEffect, useState } from "react";
import { useOrderStore } from "../../store/orderStore";
import { useToastStore } from "../../store/toastStore";

const ORDER_STATUS_COLORS = {
  PENDING_PAYMENT: "text-amber-700 bg-amber-50 border-amber-200",
  CONFIRMED:       "text-blue-700 bg-blue-50 border-blue-200",
  SHIPPED:         "text-purple-700 bg-purple-50 border-purple-200",
  DELIVERED:       "text-emerald-700 bg-emerald-50 border-emerald-200",
  CANCELLED:       "text-red-700 bg-red-50 border-red-200",
  RETURNED:        "text-orange-700 bg-orange-50 border-orange-200",
  REFUNDED:        "text-teal-700 bg-teal-50 border-teal-200",
};

const ITEM_STATUS_COLORS = {
  PENDING:          "text-amber-700 bg-amber-50",
  CONFIRMED:        "text-blue-700 bg-blue-50",
  SHIPPED:          "text-purple-700 bg-purple-50",
  DELIVERED:        "text-emerald-700 bg-emerald-50",
  CANCELLED:        "text-red-700 bg-red-50",
  RETURN_REQUESTED: "text-orange-700 bg-orange-50",
  RETURN_APPROVED:  "text-orange-700 bg-orange-50",
  RETURN_PICKED_UP: "text-orange-700 bg-orange-50",
  RETURNED:         "text-orange-700 bg-orange-50",
  REFUNDED:         "text-teal-700 bg-teal-50",
};

export default function VendorOrders() {
  const {
    vendorOrders, vendorPagination, loading,
    fetchVendorOrders, shipOrderItem, reviewReturn,
    markReturnPickedUp, markReturnReceived,
  } = useOrderStore();
  const showToast = useToastStore((s) => s.showToast);

  const [page, setPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectRemark, setRejectRemark] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = (p = page) => fetchVendorOrders({ page: p, limit: 10 });

  useEffect(() => {
    load(page).then((res) => {
      if (!res.success) showToast({ message: res.message || "Failed to load orders", type: "error" });
    });
  }, [page]);

  const act = async (fn, successMsg) => {
    setActionLoading(true);
    const result = await fn();
    setActionLoading(false);
    if (result.success) showToast({ message: successMsg, type: "success" });
    else showToast({ message: result.message || "Action failed", type: "error" });
  };

  const handleShip = (orderId, productId) =>
    act(() => shipOrderItem(orderId, productId), "Item marked as shipped!");

  const handleApproveReturn = (returnId) =>
    act(() => reviewReturn(returnId, "APPROVE", ""), "Return approved!");

  const handleRejectReturn = async () => {
    if (!rejectRemark.trim()) {
      showToast({ message: "Remark is required for rejection", type: "error" });
      return;
    }
    setActionLoading(true);
    const result = await reviewReturn(rejectModal.returnId, "REJECT", rejectRemark);
    setActionLoading(false);
    if (result.success) {
      showToast({ message: "Return rejected", type: "info" });
      setRejectModal(null);
      setRejectRemark("");
    } else {
      showToast({ message: result.message || "Action failed", type: "error" });
    }
  };

  const handlePickup = (returnId) =>
    act(() => markReturnPickedUp(returnId), "Marked as picked up!");

  const handleReceive = (returnId) =>
    act(() => markReturnReceived(returnId), "Marked as received!");

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <div className="bg-white border-b border-ink-100 px-8 py-7">
        <p className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-primary-600 mb-1">Vendor Console</p>
        <h1 className="text-2xl font-display font-bold text-ink-900">Orders</h1>
        <p className="text-ink-400 text-sm mt-0.5">
          {!loading && `${vendorPagination.total} order${vendorPagination.total !== 1 ? "s" : ""} total`}
        </p>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex items-center gap-3 p-8 text-ink-400 text-sm">
            <div className="w-5 h-5 border-2 border-ink-200 border-t-primary-500 rounded-full animate-spin" />
            Loading orders...
          </div>
        ) : vendorOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-ink-100">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-display font-bold text-ink-900 mb-2">No orders yet</h2>
            <p className="text-ink-500 text-sm">Orders containing your products will appear here.</p>
          </div>
        ) : (
          <>
            {vendorOrders.map((order) => {
              const isExpanded = expandedOrder === order._id;
              return (
                <div key={order._id} className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
                  {/* Order header row */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-ink-50 transition text-left"
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <p className="text-xs text-ink-400 font-medium">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="font-display font-bold text-ink-900 text-sm mt-0.5">
                          Order #{order.orderNumber || order._id?.toString().slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${ORDER_STATUS_COLORS[order.orderStatus] || "text-ink-600 bg-ink-50 border-ink-200"}`}>
                        {order.orderStatus?.replace(/_/g, " ")}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${order.paymentStatus === "PAID" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-display font-bold text-ink-900">
                        Rs.{order.totalAmount?.toLocaleString()}
                      </p>
                      <svg
                        className={`w-4 h-4 text-ink-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded items */}
                  {isExpanded && (
                    <div className="border-t border-ink-100 divide-y divide-ink-50">
                      {order.items?.map((item, i) => {
                        const product = order.productDetails?.find(
                          (p) => p._id?.toString() === item.productId?.toString()
                        );
                        const title = product?.title || `Product (${item.productId?.toString().slice(-6)})`;
                        const itemStatus = item.status || "PENDING";
                        const isPaid = order.paymentStatus === "PAID";
                        const canShip = isPaid && (itemStatus === "PENDING" || itemStatus === "CONFIRMED");
                        const canApproveReturn = itemStatus === "RETURN_REQUESTED";
                        const canPickup = itemStatus === "RETURN_APPROVED";
                        const canReceive = itemStatus === "RETURN_PICKED_UP";
                        const returnId = item.returnId || item._id;

                        return (
                          <div key={i} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-ink-900 text-sm truncate">{title}</p>
                              <p className="text-xs text-ink-400 mt-0.5">Qty: {item.quantity} · Rs.{item.priceAtPurchase?.toLocaleString()}</p>
                              <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg ${ITEM_STATUS_COLORS[itemStatus] || "text-ink-500 bg-ink-50"}`}>
                                {itemStatus.replace(/_/g, " ")}
                              </span>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {canShip && (
                                <button
                                  onClick={() => handleShip(order._id, item.productId?.toString())}
                                  disabled={actionLoading}
                                  className="text-xs font-display font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition disabled:opacity-50 active:scale-[0.97]"
                                >
                                  Mark Shipped
                                </button>
                              )}
                              {canApproveReturn && (
                                <>
                                  <button
                                    onClick={() => handleApproveReturn(returnId)}
                                    disabled={actionLoading}
                                    className="text-xs font-display font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50 active:scale-[0.97]"
                                  >
                                    Approve Return
                                  </button>
                                  <button
                                    onClick={() => setRejectModal({ returnId })}
                                    disabled={actionLoading}
                                    className="text-xs font-display font-semibold bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition disabled:opacity-50 active:scale-[0.97]"
                                  >
                                    Reject Return
                                  </button>
                                </>
                              )}
                              {canPickup && (
                                <button
                                  onClick={() => handlePickup(returnId)}
                                  disabled={actionLoading}
                                  className="text-xs font-display font-semibold bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition disabled:opacity-50 active:scale-[0.97]"
                                >
                                  Mark Picked Up
                                </button>
                              )}
                              {canReceive && (
                                <button
                                  onClick={() => handleReceive(returnId)}
                                  disabled={actionLoading}
                                  className="text-xs font-display font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 active:scale-[0.97]"
                                >
                                  Mark Received
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {vendorPagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-2">
                {Array.from({ length: vendorPagination.totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-9 h-9 rounded-xl text-sm font-display font-semibold transition ${
                      pg === page ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-ink-50"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Return Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-ink-100">
            <h3 className="font-display font-bold text-ink-900 text-lg mb-2">Reject Return Request</h3>
            <p className="text-ink-500 text-sm mb-4">Provide a reason for rejection. This will be visible to the buyer.</p>
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              rows="4"
              placeholder="Enter rejection reason..."
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 resize-none"
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setRejectModal(null); setRejectRemark(""); }}
                className="flex-1 border border-ink-200 py-2.5 rounded-xl font-display font-semibold text-sm text-ink-700 hover:bg-ink-50 transition active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectReturn}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-red-700 transition disabled:opacity-50 active:scale-[0.97]"
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
