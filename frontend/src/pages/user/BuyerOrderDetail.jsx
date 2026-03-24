import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "../../store/orderStore";
import { useToastStore } from "../../store/toastStore";

const TERMINAL = ["CANCELLED", "DELIVERED", "COMPLETED", "REFUNDED", "RETURNED"];

const STATUS_COLORS = {
  PENDING_PAYMENT: "text-amber-700 bg-amber-50 border-amber-200",
  CONFIRMED:       "text-blue-700 bg-blue-50 border-blue-200",
  PROCESSING:      "text-indigo-700 bg-indigo-50 border-indigo-200",
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
  RETURNED:         "text-orange-700 bg-orange-50",
  REFUNDED:         "text-teal-700 bg-teal-50",
};

const PAYMENT_COLORS = {
  PENDING:  "text-amber-700 bg-amber-50 border-amber-200",
  PAID:     "text-emerald-700 bg-emerald-50 border-emerald-200",
  FAILED:   "text-red-700 bg-red-50 border-red-200",
  REFUNDED: "text-teal-700 bg-teal-50 border-teal-200",
};

const TIMELINE_ICONS = {
  ORDER_PLACED:      "🛒",
  PAYMENT_CONFIRMED: "✅",
  ITEM_SHIPPED:      "🚚",
  DELIVERED:         "📦",
  RETURN_REQUESTED:  "↩️",
  RETURN_APPROVED:   "✅",
  RETURN_PICKED_UP:  "🚛",
  RETURN_RECEIVED:   "🏠",
  REFUND_COMPLETED:  "💰",
};

const RETURN_REASONS = [
  "Defective / Damaged product",
  "Wrong item received",
  "Item not as described",
  "Changed my mind",
  "Duplicate order",
  "Other",
];

export default function BuyerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentOrder, timeline, loading,
    payOrder, fetchOrderDetails, fetchOrderTimeline,
    confirmDelivery, cancelOrder, requestReturn,
  } = useOrderStore();
  const showToast = useToastStore((s) => s.showToast);

  const [cancelModal, setCancelModal] = useState(false);
  const [returnModal, setReturnModal] = useState(null); // item
  const [returnForm, setReturnForm] = useState({ reason: "", description: "", quantity: 1, images: [] });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails(id).then((res) => {
      if (!res.success) showToast({ message: res.message || "Failed to load order", type: "error" });
    });
    fetchOrderTimeline(id);
  }, [id]);

  const handlePay = async () => {
    const orderId = currentOrder?.order?.orderId || id;
    const result = await payOrder(orderId);
    if (result.success) {
      showToast({ message: "Payment successful!", type: "success" });
      fetchOrderDetails(id);
      fetchOrderTimeline(id);
    } else {
      showToast({ message: result.message || "Payment failed", type: "error" });
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    const result = await cancelOrder(currentOrder?.order?.orderId || id);
    setActionLoading(false);
    setCancelModal(false);
    if (result.success) showToast({ message: "Order cancelled", type: "success" });
    else showToast({ message: result.message || "Could not cancel order", type: "error" });
  };

  const handleConfirmDelivery = async (productId) => {
    setActionLoading(true);
    const result = await confirmDelivery(currentOrder?.order?.orderId || id, productId);
    setActionLoading(false);
    if (result.success) showToast({ message: "Delivery confirmed!", type: "success" });
    else showToast({ message: result.message || "Failed to confirm delivery", type: "error" });
  };

  const handleRequestReturn = async () => {
    if (!returnForm.reason) {
      showToast({ message: "Please select a return reason", type: "error" });
      return;
    }
    const productId = typeof returnModal.productId === "object"
      ? returnModal.productId._id
      : returnModal.productId;

    const fd = new FormData();
    fd.append("productId", productId);
    fd.append("reason", returnForm.reason);
    fd.append("description", returnForm.description);
    fd.append("quantity", returnForm.quantity);
    returnForm.images.forEach((f) => fd.append("images", f));

    setActionLoading(true);
    const result = await requestReturn(currentOrder?.order?.orderId || id, fd);
    setActionLoading(false);
    if (result.success) {
      showToast({ message: "Return request submitted!", type: "success" });
      setReturnModal(null);
      setReturnForm({ reason: "", description: "", quantity: 1, images: [] });
      fetchOrderTimeline(id);
    } else {
      showToast({ message: result.message || "Failed to submit return", type: "error" });
    }
  };

  if (loading && !currentOrder) {
    return (
      <div className="min-h-screen bg-ink-50 mt-[72px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ink-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-display font-semibold uppercase tracking-widest text-ink-400">Loading order</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) return null;

  const { order, advancedOrder } = currentOrder;
  const returnWindowActive = order.returnWindowEndsAt && new Date(order.returnWindowEndsAt) > new Date();
  const canCancel = !TERMINAL.includes(order.orderStatus) &&
    !order.items?.some((i) => i.status === "SHIPPED" || i.status === "DELIVERED");

  return (
    <div className="min-h-screen bg-ink-50 mt-[72px]">
      {/* Header */}
      <div className="bg-white border-b border-ink-100">
        <div className="container-app py-8">
          <button onClick={() => navigate("/orders")} className="text-xs text-ink-400 hover:text-ink-700 flex items-center gap-1 mb-4 transition-colors">
            ← Back to orders
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-widest text-brand-600 mb-2">Order Detail</p>
              <h1 className="text-3xl font-display font-bold text-ink-900">
                Order #{order.orderNumber || order.orderId?.toString().slice(-8).toUpperCase()}
              </h1>
              <p className="text-ink-400 text-sm mt-1">
                {order.createdAt && new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {canCancel && (
              <button
                onClick={() => setCancelModal(true)}
                className="text-sm font-display font-semibold text-red-600 border border-red-200 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition active:scale-[0.97]"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-ink-100">
                <h2 className="font-display font-bold text-ink-900">Order Items</h2>
              </div>
              <div className="divide-y divide-ink-100">
                {order.items?.map((item, i) => {
                  const product = item.productId;
                  const productId = typeof product === "object" ? product._id : product;
                  const title = typeof product === "object" ? product.title : "Product";
                  const vendor = item.vendorId;
                  const shopName = typeof vendor === "object" ? vendor.shopName : null;
                  const primaryImg = item.productImages?.find((img) => img.isPrimary) || item.productImages?.[0];
                  const itemStatus = item.status || "PENDING";
                  const canConfirm = itemStatus === "SHIPPED";
                  const canReturn = order.orderStatus === "DELIVERED" && itemStatus === "DELIVERED" && returnWindowActive;

                  return (
                    <div key={i} className="p-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl bg-ink-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                          {primaryImg?.imageUrl
                            ? <img src={primaryImg.imageUrl} alt={title} className="w-full h-full object-cover" />
                            : "📦"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-ink-900 truncate">{title}</p>
                          {shopName && <p className="text-xs text-ink-400 mt-0.5">by {shopName}</p>}
                          <p className="text-xs text-ink-400 mt-1">Qty: {item.quantity}</p>
                          <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg ${ITEM_STATUS_COLORS[itemStatus] || "text-ink-500 bg-ink-50"}`}>
                            {itemStatus.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-display font-bold text-ink-900">
                            Rs.{(item.priceAtPurchase * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-ink-400 mt-0.5">Rs.{item.priceAtPurchase} each</p>
                        </div>
                      </div>
                      {(canConfirm || canReturn) && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-ink-100">
                          {canConfirm && (
                            <button
                              onClick={() => handleConfirmDelivery(productId)}
                              disabled={actionLoading}
                              className="text-xs font-display font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50 active:scale-[0.97]"
                            >
                              Confirm Delivery
                            </button>
                          )}
                          {canReturn && (
                            <button
                              onClick={() => { setReturnModal(item); setReturnForm({ reason: "", description: "", quantity: item.quantity, images: [] }); }}
                              className="text-xs font-display font-semibold bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition active:scale-[0.97]"
                            >
                              Request Return
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advanced Order Info */}
            {advancedOrder && (
              <div className="bg-white rounded-2xl border border-ink-200 p-6">
                <h2 className="font-display font-bold text-ink-900 mb-4">Schedule</h2>
                <div className="space-y-2 text-sm">
                  {advancedOrder.scheduledDate && (
                    <div className="flex justify-between">
                      <span className="text-ink-500">Scheduled for</span>
                      <span className="font-medium text-ink-900">{new Date(advancedOrder.scheduledDate).toLocaleString()}</span>
                    </div>
                  )}
                  {advancedOrder.isRecurring && (
                    <div className="flex justify-between">
                      <span className="text-ink-500">Recurring every</span>
                      <span className="font-medium text-ink-900">{advancedOrder.recurringIntervalDays} days</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="bg-white rounded-2xl border border-ink-200 p-6">
                <h2 className="font-display font-bold text-ink-900 mb-5">Order Timeline</h2>
                <div className="space-y-4">
                  {timeline.map((event, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center text-sm flex-shrink-0">
                        {TIMELINE_ICONS[event.status] || "•"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ink-900">{event.message}</p>
                        <p className="text-xs text-ink-400 mt-0.5">
                          {event.time && new Date(event.time).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-ink-200 p-6">
              <h2 className="font-display font-bold text-ink-900 mb-4">Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-500">Order status</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${STATUS_COLORS[order.orderStatus] || "text-ink-600 bg-ink-100 border-ink-200"}`}>
                    {order.orderStatus?.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Payment</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${PAYMENT_COLORS[order.paymentStatus] || "text-ink-600 bg-ink-100 border-ink-200"}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Method</span>
                  <span className="font-medium text-ink-900">{order.paymentMethod}</span>
                </div>
                {order.returnWindowEndsAt && (
                  <div className="flex justify-between">
                    <span className="text-ink-500">Return window</span>
                    <span className={`font-medium text-sm ${returnWindowActive ? "text-emerald-700" : "text-red-500"}`}>
                      {returnWindowActive
                        ? `Until ${new Date(order.returnWindowEndsAt).toLocaleDateString()}`
                        : "Expired"}
                    </span>
                  </div>
                )}
              </div>
              <div className="border-t border-ink-100 my-4" />
              <div className="flex justify-between font-display font-bold text-ink-900 text-lg">
                <span>Total</span>
                <span>Rs.{order.totalAmount?.toLocaleString()}</span>
              </div>

              {order.orderStatus === "PENDING_PAYMENT" && order.paymentStatus === "PENDING" && (
                <button
                  onClick={handlePay}
                  className="w-full mt-5 bg-ink-900 text-white font-display font-semibold py-3 rounded-xl hover:bg-ink-800 transition-all active:scale-[0.98]"
                >
                  Pay Now →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirm Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-ink-100">
            <h3 className="font-display font-bold text-ink-900 text-lg mb-2">Cancel Order?</h3>
            <p className="text-ink-500 text-sm mb-6">This action cannot be undone. Stock will be restored.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(false)}
                className="flex-1 border border-ink-200 py-2.5 rounded-xl font-display font-semibold text-sm text-ink-700 hover:bg-ink-50 transition active:scale-[0.97]">
                Keep Order
              </button>
              <button onClick={handleCancel} disabled={actionLoading}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-red-700 transition disabled:opacity-50 active:scale-[0.97]">
                {actionLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-ink-100 my-auto">
            <h3 className="font-display font-bold text-ink-900 text-lg mb-1">Request Return</h3>
            <p className="text-ink-500 text-sm mb-5">
              {typeof returnModal.productId === "object" ? returnModal.productId.title : "Item"}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-widest text-ink-500 mb-1.5">Reason *</label>
                <select value={returnForm.reason} onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-ink-200 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 bg-white">
                  <option value="">Select a reason</option>
                  {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-widest text-ink-500 mb-1.5">Quantity</label>
                <input
                  type="number" min="1" max={returnModal.quantity} value={returnForm.quantity}
                  onChange={(e) => setReturnForm({ ...returnForm, quantity: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-ink-200 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-widest text-ink-500 mb-1.5">Description (optional)</label>
                <textarea
                  rows="3" value={returnForm.description}
                  onChange={(e) => setReturnForm({ ...returnForm, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  className="w-full px-4 py-3 border-2 border-ink-200 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-widest text-ink-500 mb-1.5">Photos (optional)</label>
                <input
                  type="file" accept="image/*" multiple
                  onChange={(e) => setReturnForm({ ...returnForm, images: Array.from(e.target.files) })}
                  className="w-full text-sm text-ink-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-ink-100 file:text-ink-700 hover:file:bg-ink-200 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setReturnModal(null)}
                className="flex-1 border border-ink-200 py-2.5 rounded-xl font-display font-semibold text-sm text-ink-700 hover:bg-ink-50 transition active:scale-[0.97]">
                Cancel
              </button>
              <button onClick={handleRequestReturn} disabled={actionLoading}
                className="flex-1 bg-orange-600 text-white py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-orange-700 transition disabled:opacity-50 active:scale-[0.97]">
                {actionLoading ? "Submitting..." : "Submit Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}