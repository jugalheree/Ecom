import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { vendorAPI, assignmentAPI, ratingAPI } from "../../services/apis/index";

function Stars({ value, size = 13 }) {
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
  const [rating, setRating] = useState({ avgRating: 0, totalRatings: 0 });
  const [deliveryUpdates, setDeliveryUpdates] = useState([]);
  const [vendorScore, setVendorScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      vendorAPI.products({ limit: 10 }).then(r => {
        const d = r.data?.data;
        setProducts(Array.isArray(d) ? d : d?.products || []);
      }),
      vendorAPI.getOrders({ limit: 20 }).then(r => setOrders(r.data?.data?.orders || [])),
      // Use /api/vendor/me to get vendorId reliably
      vendorAPI.getProfile().then(r => {
        const vid = r.data?.data?._id;
        setVendorScore(r.data?.data?.vendorScore || 0);
        if (vid) {
          ratingAPI.getVendorRatings(vid, { limit: 1 }).then(r2 => {
            setRating(r2.data?.data?.stats || { avgRating: 0, totalRatings: 0 });
          }).catch(() => {});
        }
      }),
      assignmentAPI.getVendorUpdates().then(r => {
        setDeliveryUpdates(r.data?.data?.slice(0, 5) || []);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const tier = rating.avgRating >= 4.5 ? { label: "Gold Seller", icon: "🥇", color: "text-amber-400" }
    : rating.avgRating >= 4.0 ? { label: "Silver Seller", icon: "🥈", color: "text-slate-400" }
    : rating.avgRating >= 3.0 ? { label: "Bronze Seller", icon: "🥉", color: "text-amber-600" }
    : { label: "New Seller", icon: "🆕", color: "text-ink-400" };

  const tiles = [
    { label: "Products",      value: products.length, icon: "📦", link: "/vendor/products", color: "bg-navy-50 border-navy-200 text-navy-700" },
    { label: "Active Orders", value: orders.filter(o => !["DELIVERED","CANCELLED","COMPLETED"].includes(o.orderStatus)).length, icon: "🛒", link: "/vendor/orders", color: "bg-brand-50 border-brand-200 text-brand-700" },
    { label: "Delivered",     value: orders.filter(o => o.orderStatus === "DELIVERED").length, icon: "✅", link: "/vendor/orders", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { label: "Returns",       value: orders.filter(o => o.orderStatus === "RETURN_REQUESTED").length, icon: "↩️", link: "/vendor/orders", color: "bg-amber-50 border-amber-200 text-amber-700" },
  ];

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Dashboard</h1>
        <p className="text-ink-400 text-sm mt-0.5">Your store at a glance</p>
      </div>

      {/* Rating Hero — Real Data */}
      <Link to="/vendor/ratings" className="block mb-6 card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
        style={{ background: "linear-gradient(135deg,#131318,#2a2a35)", border: "none" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: "rgba(255,125,7,0.15)", border: "1px solid rgba(255,125,7,0.25)" }}>⭐</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-1">Your Store Rating</p>
              {loading ? (
                <div className="skeleton h-8 w-32 rounded" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white font-display">
                    {rating.avgRating > 0 ? Number(rating.avgRating).toFixed(1) : "—"}
                  </span>
                  <div>
                    <Stars value={rating.avgRating} size={14} />
                    <p className="text-xs text-ink-400 mt-0.5">
                      {rating.totalRatings > 0 ? `${rating.totalRatings} review${rating.totalRatings !== 1 ? "s" : ""}` : "No reviews yet"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl mb-2"
              style={{ background: "rgba(255,125,7,0.15)", border: "1px solid rgba(255,125,7,0.3)" }}>
              <span>{tier.icon}</span>
              <span className={`text-sm font-bold ${tier.color}`}>{tier.label}</span>
            </div>
            <p className="text-xs text-ink-500">View all reviews →</p>
          </div>
        </div>
      </Link>

      {/* Stat Tiles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {tiles.map((t, i) => (
          <Link key={i} to={t.link}
            className={`card p-5 border-2 ${t.color} hover:shadow-card-hover hover:-translate-y-0.5 transition-all block`}>
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

      {/* Delivery Updates — Real */}
      {deliveryUpdates.length > 0 && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-ink-900">🚚 Delivery Updates</h2>
            <span className="text-xs text-ink-400">Live from delivery staff</span>
          </div>
          <div className="space-y-3">
            {deliveryUpdates.map((a, i) => {
              const latestNote = a.deliveryNotes?.filter(n => n.visibleToVendor).slice(-1)[0];
              return (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-sand-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${
                    a.status === "DELIVERED" ? "bg-green-100" :
                    a.status === "PICKED_UP" ? "bg-blue-100" :
                    a.status === "OUT_FOR_DELIVERY" ? "bg-orange-100" : "bg-ink-100"
                  }`}>
                    {a.status === "DELIVERED" ? "✅" : a.status === "PICKED_UP" ? "📦" : a.status === "OUT_FOR_DELIVERY" ? "🚚" : "📋"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-800">
                      Order #{a.orderId?.orderNumber || a.orderId?._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {latestNote?.message || `Status: ${a.status?.replace(/_/g, " ")}`}
                    </p>
                    <p className="text-[10px] text-ink-400 mt-0.5">
                      by {a.deliveryPersonId?.name || "Delivery staff"} · {a.updatedAt ? new Date(a.updatedAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : ""}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    a.status === "DELIVERED" ? "bg-green-50 text-green-700" :
                    a.status === "PICKED_UP" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                  }`}>{a.status?.replace(/_/g, " ")}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Vendor Marketplace", link: "/vendor/marketplace", icon: "🏪", desc: "Buy & sell surplus" },
          { label: "My Ratings",         link: "/vendor/ratings",     icon: "⭐", desc: "Reviews & feedback" },
          { label: "Stock Manager",      link: "/vendor/stock",       icon: "📊", desc: "Inventory overview" },
          { label: "Reports",            link: "/vendor/reports",     icon: "📈", desc: "Sales analytics" },
        ].map((l, i) => (
          <Link key={i} to={l.link}
            className="flex flex-col gap-1 p-4 rounded-xl bg-white border border-ink-100 hover:border-brand-200 hover:shadow-sm transition-all group">
            <span className="text-xl">{l.icon}</span>
            <span className="text-sm font-semibold text-ink-700 group-hover:text-brand-700 transition-colors">{l.label}</span>
            <span className="text-xs text-ink-400">{l.desc}</span>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
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
            {orders.slice(0, 5).map(o => (
              <div key={o._id} className="flex items-center justify-between p-3.5 rounded-xl bg-sand-50 hover:bg-sand-100 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-ink-900">#{o.orderNumber || o._id?.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-ink-400 mt-0.5">₹{o.totalAmount?.toLocaleString()} · {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  o.orderStatus === "DELIVERED" ? "bg-green-50 text-green-700 border-green-200" :
                  o.orderStatus === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                }`}>{o.orderStatus?.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
