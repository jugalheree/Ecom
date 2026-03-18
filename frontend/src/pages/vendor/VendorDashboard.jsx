import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { vendorAPI, orderAPI } from "../../services/apis/index";

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      vendorAPI.products().then((r) => { const d = r.data?.data; setProducts(Array.isArray(d) ? d : d?.products || []); }),
      vendorAPI.getOrders().then((r) => setOrders(r.data?.data?.orders || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const tiles = [
    { label: "Total Products", value: products.length, icon: "📦", link: "/vendor/products", color: "bg-navy-50 border-navy-200 text-navy-700" },
    { label: "Active Orders",  value: orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length, icon: "🛒", link: "/vendor/orders", color: "bg-brand-50 border-brand-200 text-brand-700" },
    { label: "Delivered",      value: orders.filter((o) => o.status === "DELIVERED").length, icon: "✅", link: "/vendor/orders", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { label: "Returns",        value: orders.filter((o) => o.status === "RETURN_REQUESTED").length, icon: "↩️", link: "/vendor/orders", color: "bg-amber-50 border-amber-200 text-amber-700" },
  ];

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Dashboard</h1>
        <p className="text-ink-400 text-sm mt-0.5">Your store overview</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tiles.map((t, i) => (
          <Link key={i} to={t.link} className={`card p-5 border-2 ${t.color} hover:shadow-card-hover hover:-translate-y-0.5 transition-all block`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{t.label}</p>
                <p className="text-2xl font-bold text-ink-900 mt-2">{t.value}</p>
              </div>
              <span className="text-2xl">{t.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-ink-900 text-lg">Recent Orders</h2>
          <Link to="/vendor/orders" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-ink-500 text-sm">No orders yet. Your orders will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <div key={o._id} className="flex items-center justify-between p-3.5 rounded-xl bg-sand-50 hover:bg-sand-100 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-ink-900">Order #{o._id?.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-ink-400 mt-0.5">₹{o.totalAmount?.toLocaleString()} · {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
                <span className={`badge text-[10px] ${o.status === "DELIVERED" ? "badge-success" : o.status === "CANCELLED" ? "badge-danger" : "badge-warn"}`}>
                  {o.status?.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
