import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { vendorAPI, orderAPI } from "../../services/apis/index";

const MOCK_RATING = { avg: 4.6, total: 71, tier: "Gold Seller", breakdown: [52, 12, 4, 2, 1] };

function MiniStars({ value, size = 12 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(value) ? "#ff7d07" : "#d9d9de"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

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
    { label: "Active Orders",  value: orders.filter((o) => o.orderStatus !== "DELIVERED" && o.orderStatus !== "CANCELLED").length, icon: "🛒", link: "/vendor/orders", color: "bg-brand-50 border-brand-200 text-brand-700" },
    { label: "Delivered",      value: orders.filter((o) => o.orderStatus === "DELIVERED").length, icon: "✅", link: "/vendor/orders", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { label: "Returns",        value: orders.filter((o) => o.orderStatus === "RETURN_REQUESTED").length, icon: "↩️", link: "/vendor/orders", color: "bg-amber-50 border-amber-200 text-amber-700" },
  ];

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Dashboard</h1>
        <p className="text-ink-400 text-sm mt-0.5">Your store overview</p>
      </div>

      {/* ── Ratings Hero Card ── */}
      <Link to="/vendor/ratings" className="block mb-6 card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
        style={{ background: "linear-gradient(135deg,#131318,#2a2a35)", border: "none" }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: "rgba(255,125,7,0.15)", border: "1px solid rgba(255,125,7,0.25)" }}>
              ⭐
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-1">Your Store Rating</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white font-display">{MOCK_RATING.avg}</span>
                <div>
                  <MiniStars value={MOCK_RATING.avg} size={14} />
                  <p className="text-xs text-ink-400 mt-0.5">{MOCK_RATING.total} reviews</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl mb-2"
              style={{ background: "rgba(255,125,7,0.15)", border: "1px solid rgba(255,125,7,0.3)" }}>
              <span>🥇</span>
              <span className="text-sm font-bold text-brand-400">{MOCK_RATING.tier}</span>
            </div>
            <p className="text-xs text-ink-500">View all reviews →</p>
          </div>
        </div>
      </Link>

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

      {/* Quick links row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Vendor Marketplace", link: "/vendor/marketplace", icon: "🏪", desc: "Buy & sell surplus" },
          { label: "My Ratings", link: "/vendor/ratings", icon: "⭐", desc: "Reviews & feedback" },
          { label: "Stock Manager", link: "/vendor/stock", icon: "📊", desc: "Inventory overview" },
          { label: "Reports", link: "/vendor/reports", icon: "📈", desc: "Sales analytics" },
        ].map((l, i) => (
          <Link key={i} to={l.link}
            className="flex flex-col gap-1 p-4 rounded-xl bg-white border border-ink-100 hover:border-brand-200 hover:shadow-sm transition-all group">
            <span className="text-xl">{l.icon}</span>
            <span className="text-sm font-semibold text-ink-700 group-hover:text-brand-700 transition-colors">{l.label}</span>
            <span className="text-xs text-ink-400">{l.desc}</span>
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
                <span className={`badge text-[10px] ${o.orderStatus === "DELIVERED" ? "badge-success" : o.orderStatus === "CANCELLED" ? "badge-danger" : "badge-warn"}`}>
                  {o.orderStatus?.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}