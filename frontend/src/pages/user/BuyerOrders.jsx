import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { orderAPI } from "../../services/apis/index";

const ORDER_STATUS_STEPS = [
  "PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "PACKED",
  "PICKED_UP", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED",
];

const STATUS_META = {
  PENDING_PAYMENT:  { label: "Pending Payment", color: "text-amber-700 bg-amber-50 border-amber-200",   icon: "⏳" },
  CONFIRMED:        { label: "Confirmed",        color: "text-blue-700 bg-blue-50 border-blue-200",      icon: "✅" },
  PROCESSING:       { label: "Processing",       color: "text-indigo-700 bg-indigo-50 border-indigo-200", icon: "⚙️" },
  PACKED:           { label: "Packed",           color: "text-purple-700 bg-purple-50 border-purple-200", icon: "📦" },
  PICKED_UP:        { label: "Picked Up",        color: "text-blue-700 bg-blue-50 border-blue-200",      icon: "🚛" },
  SHIPPED:          { label: "Shipped",          color: "text-violet-700 bg-violet-50 border-violet-200", icon: "🚚" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-orange-700 bg-orange-50 border-orange-200", icon: "📍" },
  DELIVERED:        { label: "Delivered",        color: "text-green-700 bg-green-50 border-green-200",   icon: "✅" },
  COMPLETED:        { label: "Completed",        color: "text-green-700 bg-green-50 border-green-200",   icon: "🎉" },
  CANCELLED:        { label: "Cancelled",        color: "text-red-700 bg-red-50 border-red-200",         icon: "❌" },
  RETURN_REQUESTED: { label: "Return Requested", color: "text-rose-700 bg-rose-50 border-rose-200",      icon: "↩️" },
  RETURNED:         { label: "Returned",         color: "text-orange-700 bg-orange-50 border-orange-200", icon: "📬" },
  REFUNDED:         { label: "Refunded",         color: "text-teal-700 bg-teal-50 border-teal-200",      icon: "💰" },
};

function OrderProgressBar({ status }) {
  const idx = ORDER_STATUS_STEPS.indexOf(status);
  if (idx === -1) return null;
  const pct = Math.round(((idx + 1) / ORDER_STATUS_STEPS.length) * 100);
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] text-ink-400 mb-1">
        <span>Order placed</span>
        <span className={pct === 100 ? "text-green-600 font-semibold" : ""}>
          {pct === 100 ? "🎉 Delivered!" : `${pct}% complete`}
        </span>
      </div>
      <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-green-500" : "bg-brand-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function BuyerOrders() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (!user) { navigate("/login?redirect=/orders"); return; }
    setLoading(true);
    setError("");
    orderAPI.getMyOrders()
      .then((res) => setOrders(res.data?.data?.orders || []))
      .catch(() => setError("Unable to load orders. Please check your connection."))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.orderStatus === filter);

  const summary = {
    total: orders.length,
    active: orders.filter((o) => !["DELIVERED","COMPLETED","CANCELLED","RETURNED","REFUNDED"].includes(o.orderStatus)).length,
    delivered: orders.filter((o) => ["DELIVERED","COMPLETED"].includes(o.orderStatus)).length,
    cancelled: orders.filter((o) => o.orderStatus === "CANCELLED").length,
  };

  if (loading) return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-3xl space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="card p-6">
            <div className="skeleton h-5 w-1/3 rounded mb-3" />
            <div className="skeleton h-4 w-2/3 rounded mb-2" />
            <div className="skeleton h-2 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center">
      <div className="text-center card p-10 max-w-sm mx-4">
        <div className="text-4xl mb-3">📭</div>
        <p className="font-semibold text-ink-700 mb-1">Couldn't load orders</p>
        <p className="text-sm text-ink-400 mb-5">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary px-6 py-2.5 text-sm">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <p className="section-label">Account</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">My Orders</h1>
          <p className="text-ink-500 text-sm mt-1">Track and manage your purchases</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total",     value: summary.total,     icon: "📋" },
            { label: "Active",    value: summary.active,    icon: "🚚" },
            { label: "Delivered", value: summary.delivered, icon: "✅" },
            { label: "Cancelled", value: summary.cancelled, icon: "❌" },
          ].map((s, i) => (
            <div key={i} className="card p-3 text-center">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-xl font-display font-bold text-ink-900">{s.value}</p>
              <p className="text-[11px] text-ink-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {["ALL","PENDING_PAYMENT","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"].map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                filter === tab ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:border-ink-400"
              }`}>
              {tab === "ALL" ? "All Orders" : (STATUS_META[tab]?.label || tab.replace(/_/g," "))}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-sand-100 rounded-full flex items-center justify-center text-4xl mb-4">📦</div>
            <h3 className="font-display font-semibold text-ink-900 text-lg">No orders found</h3>
            <p className="text-ink-500 text-sm mt-2 mb-6">
              {filter === "ALL" ? "When you place an order, it will appear here." : `No ${STATUS_META[filter]?.label || filter} orders.`}
            </p>
            <Link to="/market"><button className="btn-primary px-8 py-3">Browse Marketplace →</button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const meta = STATUS_META[order.orderStatus] || { label: order.orderStatus, color: "text-ink-600 bg-ink-50 border-ink-200", icon: "•" };
              const firstItem = order.items?.[0];
              const itemCount = order.items?.length || 0;
              const isActive = !["DELIVERED","COMPLETED","CANCELLED","RETURNED","REFUNDED"].includes(order.orderStatus);

              return (
                <Link key={order._id} to={`/orders/${order._id}`}
                  className="card p-5 block hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-start gap-4">
                    {/* Icon / Image */}
                    <div className="w-14 h-14 rounded-xl bg-sand-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                      {firstItem?.productImages?.[0]?.imageUrl
                        ? <img src={firstItem.productImages[0].imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                        : <span>{meta.icon}</span>
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-ink-900 text-sm">
                            Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-ink-400 mt-0.5">
                            {itemCount} item{itemCount !== 1 ? "s" : ""} · ₹{order.totalAmount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-ink-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
                            {meta.label}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-300 flex-shrink-0">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      </div>

                      {/* Estimated delivery */}
                      {order.estimatedDeliveryDate && isActive && (
                        <p className="text-xs text-brand-600 font-semibold mt-1.5">
                          📅 Est. delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      )}

                      {/* Progress bar for active orders */}
                      {isActive && <OrderProgressBar status={order.orderStatus} />}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}