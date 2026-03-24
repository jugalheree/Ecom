import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../../services/apis/index";

const statusStyles = {
  PENDING:     "badge-warn",
  CONFIRMED:   "badge-navy",
  SHIPPED:     "badge-navy",
  DELIVERED:   "badge-success",
  CANCELLED:   "badge-danger",
  RETURN_REQUESTED: "badge-warn",
};

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    orderAPI.getMyOrders()
      .then((res) => setOrders(res.data?.data?.orders || []))
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app space-y-4">
        {[1,2,3].map(i => <div key={i} className="card p-6"><div className="skeleton h-5 w-1/3 rounded mb-3" /><div className="skeleton h-4 w-2/3 rounded" /></div>)}
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center">
      <div className="text-center"><p className="text-danger-500 font-medium">{error}</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-3xl">
        <div className="mb-8">
          <p className="section-label">Account</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">My Orders</h1>
          <p className="text-ink-500 text-sm mt-1">Track and manage your purchases</p>
        </div>

        {orders.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-sand-100 rounded-full flex items-center justify-center text-4xl mb-4">📦</div>
            <h3 className="font-display font-semibold text-ink-900 text-lg">No orders yet</h3>
            <p className="text-ink-500 text-sm mt-2 mb-6">When you place an order, it will appear here.</p>
            <Link to="/market"><button className="btn-primary px-8 py-3">Browse Marketplace →</button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`}
                className="card p-5 flex items-center justify-between gap-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 block">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-sand-100 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900 text-sm">Order #{order._id?.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""} · ₹{order.totalAmount?.toLocaleString()}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={statusStyles[order.orderStatus] || "badge"}>{order.orderStatus?.replace(/_/g, " ")}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-300"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}