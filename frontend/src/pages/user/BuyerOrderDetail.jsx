import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "../../store/orderStore";
import { useToastStore } from "../../store/toastStore";

const STATUS_COLORS = {
  PENDING_PAYMENT: "text-amber-700 bg-amber-50 border-amber-200",
  CONFIRMED:       "text-blue-700 bg-blue-50 border-blue-200",
  PROCESSING:      "text-indigo-700 bg-indigo-50 border-indigo-200",
  SHIPPED:         "text-purple-700 bg-purple-50 border-purple-200",
  DELIVERED:       "text-emerald-700 bg-emerald-50 border-emerald-200",
  CANCELLED:       "text-red-700 bg-red-50 border-red-200",
};

const PAYMENT_COLORS = {
  PENDING: "text-amber-700 bg-amber-50 border-amber-200",
  PAID:    "text-emerald-700 bg-emerald-50 border-emerald-200",
  FAILED:  "text-red-700 bg-red-50 border-red-200",
};

export default function BuyerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrder, loading, payOrder, fetchOrderDetails } = useOrderStore();
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    fetchOrderDetails(id).then((res) => {
      if (!res.success) showToast({ message: res.message || "Failed to load order", type: "error" });
    });
  }, [id]);

  const handlePay = async () => {
    const orderId = currentOrder?.order?.orderId || id;
    const result = await payOrder(orderId);
    if (result.success) {
      showToast({ message: "Payment successful!", type: "success" });
      fetchOrderDetails(id);
    } else {
      showToast({ message: result.message || "Payment failed", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 mt-[72px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ink-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-display font-semibold uppercase tracking-widest text-ink-400">Loading order</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) return null;

  const { order, advancedOrder } = currentOrder;

  return (
    <div className="min-h-screen bg-ink-50 mt-[72px]">
      <div className="bg-white border-b border-ink-100">
        <div className="container-app py-8">
          <button onClick={() => navigate("/orders")} className="text-xs text-ink-400 hover:text-ink-700 flex items-center gap-1 mb-4 transition-colors">
            ← Back to orders
          </button>
          <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-2">Order Detail</p>
          <h1 className="text-3xl font-display font-bold text-ink-900">
            Order #{order.orderNumber || order.orderId?.toString().slice(-8).toUpperCase()}
          </h1>
          <p className="text-ink-400 text-sm mt-1">
            {order.createdAt && new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
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
                  const title = typeof product === "object" ? product.title : "Product";
                  const vendor = item.vendorId;
                  const shopName = typeof vendor === "object" ? vendor.shopName : null;
                  const primaryImg = item.productImages?.find((img) => img.isPrimary) || item.productImages?.[0];
                  return (
                    <div key={i} className="flex gap-4 items-center p-6">
                      <div className="w-16 h-16 rounded-xl bg-ink-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                        {primaryImg?.imageUrl ? (
                          <img src={primaryImg.imageUrl} alt={title} className="w-full h-full object-cover" />
                        ) : "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-ink-900 truncate">{title}</p>
                        {shopName && <p className="text-xs text-ink-400 mt-0.5">by {shopName}</p>}
                        <p className="text-xs text-ink-400 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display font-bold text-ink-900">
                          Rs.{(item.priceAtPurchase * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-xs text-ink-400 mt-0.5">Rs.{item.priceAtPurchase} each</p>
                      </div>
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
                    <span className="font-medium text-ink-900">{new Date(order.returnWindowEndsAt).toLocaleDateString()}</span>
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
    </div>
  );
}
