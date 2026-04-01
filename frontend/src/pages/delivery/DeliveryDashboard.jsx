import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { assignmentAPI } from "../../services/apis/index";
import { useAuthStore } from "../../store/authStore";

export default function DeliveryDashboard() {
  const user = useAuthStore(s => s.user);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignmentAPI.getMy()
      .then(r => setAssignments(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active    = assignments.filter(a => !["DELIVERED","FAILED","REASSIGNED"].includes(a.status));
  const delivered = assignments.filter(a => a.status === "DELIVERED");
  const needsAction = assignments.filter(a => a.status === "ASSIGNED"); // waiting for acceptance

  const tiles = [
    { label: "Needs Acceptance", value: needsAction.length, icon: "⚠️", color: "bg-red-50 border-red-200 text-red-700",     link: "/delivery/orders" },
    { label: "In Progress",      value: active.filter(a => a.status !== "ASSIGNED").length, icon: "🚚", color: "bg-amber-50 border-amber-200 text-amber-700", link: "/delivery/orders" },
    { label: "Delivered",        value: delivered.length,   icon: "✅", color: "bg-green-50 border-green-200 text-green-700", link: "/delivery/orders" },
  ];

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Delivery Staff</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">
          Hello, {user?.name?.split(" ")[0] || "Partner"} 👋
        </h1>
        <p className="text-ink-400 text-sm mt-0.5">Your delivery dashboard</p>
      </div>

      {/* Tiles */}
      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-14 rounded-xl" /></div>)}</div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {tiles.map((t, i) => (
            <Link key={i} to={t.link} className={`card p-5 border-2 ${t.color} hover:-translate-y-0.5 transition-all block`}>
              <span className="text-3xl">{t.icon}</span>
              <p className="text-3xl font-display font-bold text-ink-900 mt-2">{t.value}</p>
              <p className="text-xs font-semibold mt-0.5">{t.label}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Action-needed banner */}
      {needsAction.length > 0 && (
        <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-red-800">⚠️ You have {needsAction.length} new assignment{needsAction.length !== 1 ? "s" : ""} waiting!</p>
            <p className="text-xs text-red-600 mt-0.5">Accept them to begin the delivery process.</p>
          </div>
          <Link to="/delivery/orders" className="flex-shrink-0 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all">
            View Now →
          </Link>
        </div>
      )}

      {/* Recent assignments */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="font-display font-bold text-ink-900">Active Deliveries</h2>
          <Link to="/delivery/orders" className="text-sm text-brand-600 font-semibold hover:text-brand-700">View all →</Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : active.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-ink-500 text-sm">No active deliveries. Check back soon!</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {active.map(a => {
              const order = a.orderId;
              return (
                <div key={a._id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="font-semibold text-ink-900 text-sm">
                      #{order?.orderNumber || order?._id?.slice(-8).toUpperCase() || "—"}
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {order?.deliveryAddress?.city || "—"} · {order?.buyerId?.name || "Customer"}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    a.status === "ASSIGNED"         ? "bg-amber-50 text-amber-700 border-amber-200" :
                    a.status === "ACCEPTED"         ? "bg-blue-50 text-blue-700 border-blue-200" :
                    a.status === "PICKED_UP"        ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                    a.status === "OUT_FOR_DELIVERY" ? "bg-orange-50 text-orange-700 border-orange-200" :
                    "bg-ink-50 text-ink-600 border-ink-200"
                  }`}>{a.status?.replace(/_/g, " ")}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        <Link to="/delivery/orders" className="card p-4 flex items-center gap-3 hover:border-brand-200 hover:shadow-sm transition-all group">
          <span className="text-2xl">📦</span>
          <div>
            <p className="text-sm font-semibold text-ink-800 group-hover:text-brand-700 transition-colors">My Orders</p>
            <p className="text-xs text-ink-400">Accept and update deliveries</p>
          </div>
        </Link>
        <Link to="/delivery/tracking" className="card p-4 flex items-center gap-3 hover:border-brand-200 hover:shadow-sm transition-all group">
          <span className="text-2xl">🗺️</span>
          <div>
            <p className="text-sm font-semibold text-ink-800 group-hover:text-brand-700 transition-colors">Live Tracking</p>
            <p className="text-xs text-ink-400">Step-by-step order tracker</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
