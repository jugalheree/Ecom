import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vendorAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

const STATUS_COLORS = {
  PENDING:          "text-amber-700 bg-amber-50 border-amber-200",
  CONFIRMED:        "text-blue-700 bg-blue-50 border-blue-200",
  SHIPPED:          "text-purple-700 bg-purple-50 border-purple-200",
  DELIVERED:        "text-emerald-700 bg-emerald-50 border-emerald-200",
  CANCELLED:        "text-red-700 bg-red-50 border-red-200",
  RETURN_REQUESTED: "text-orange-700 bg-orange-50 border-orange-200",
  RETURNED:         "text-orange-700 bg-orange-50 border-orange-200",
};

export default function VendorOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState(false);

  useEffect(() => {
    // Fetch all vendor orders then find the one matching id
    vendorAPI.getOrders({ limit: 50 })
      .then((r) => {
        const orders = r.data?.data?.orders || [];
        const found = orders.find((o) => o._id === id);
        setOrder(found || null);
      })
      .catch(() => showToast({ message: "Failed to load order", type: "error" }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShip = async () => {
    const trackingNumber = prompt("Enter tracking number (optional):");
    setShipping(true);
    try {
      await vendorAPI.shipOrder(id, { trackingNumber });
      showToast({ message: "Order marked as shipped!", type: "success" });
      setOrder((o) => ({ ...o, orderStatus: "SHIPPED" }));
    } catch (err) {
      showToast({ message: err?.message || "Failed to ship order", type: "error" });
    } finally {
      setShipping(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-ink-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-ink-400">Loading order...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">📭</div>
        <p className="font-semibold text-ink-700">Order not found</p>
        <button onClick={() => navigate("/vendor/orders")} className="mt-4 text-sm text-brand-600 hover:underline">
          ← Back to orders
        </button>
      </div>
    </div>
  );

  const canShip = order.orderStatus === "CONFIRMED" || order.orderStatus === "PROCESSING";

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/vendor/orders")}
          className="text-xs text-ink-400 hover:text-ink-700 flex items-center gap-1 mb-6 transition-colors">
          ← Back to orders
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <p className="section-label">Vendor</p>
            <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">
              Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
            </h1>
            <p className="text-ink-400 text-sm mt-0.5">
              {order.createdAt && new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${STATUS_COLORS[order.orderStatus] || "text-ink-600 bg-ink-100 border-ink-200"}`}>
              {order.orderStatus?.replace(/_/g, " ")}
            </span>
            {canShip && (
              <button onClick={handleShip} disabled={shipping} className="btn-primary text-sm px-4 py-2">
                {shipping ? "Shipping..." : "Mark Shipped"}
              </button>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="card overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-ink-100">
            <h2 className="font-display font-bold text-ink-900">Order Items</h2>
          </div>
          <div className="divide-y divide-ink-100">
            {order.items?.map((item, i) => {
              const product = item.productId;
              const title = typeof product === "object" ? (product.title || product.name) : "Product";
              const itemStatus = item.status || "PENDING";
              return (
                <div key={i} className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sand-100 flex items-center justify-center text-xl flex-shrink-0">📦</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 truncate">{title}</p>
                    <p className="text-xs text-ink-400 mt-0.5">Qty: {item.quantity}</p>
                    <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg ${STATUS_COLORS[itemStatus] || "text-ink-500 bg-ink-50 border-ink-200"}`}>
                      {itemStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-ink-900">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</p>
                    <p className="text-xs text-ink-400 mt-0.5">₹{item.priceAtPurchase} each</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="card p-5">
          <h2 className="font-display font-bold text-ink-900 mb-4">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500">Order Status</span>
              <span className="font-medium text-ink-900">{order.orderStatus?.replace(/_/g, " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Payment Status</span>
              <span className="font-medium text-ink-900">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Payment Method</span>
              <span className="font-medium text-ink-900">{order.paymentMethod}</span>
            </div>
            <div className="border-t border-ink-100 my-2" />
            <div className="flex justify-between font-display font-bold text-ink-900 text-lg">
              <span>Total</span>
              <span>₹{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
