import { useEffect, useState } from "react";
import Loader from "../../components/ui/Loader";
import api from "../../services/api";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");

  useEffect(() => {
    setLoading(true);
    api.get("/api/admin/dashboard", { params: { range } })
      .then((res) => setData(res.data?.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return <div className="flex-1 flex items-center justify-center min-h-screen"><Loader size="lg" /></div>;

  const ov = data?.overview || {};
  const rev = data?.revenue || {};
  const ord = data?.orders || {};

  const stats = [
    { title: "Total Users",      value: ov.totalUsers ?? 0,                                    icon: "👥", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { title: "Total Vendors",    value: ov.totalVendors ?? 0,                                  icon: "🏪", color: "bg-brand-50 border-brand-200 text-brand-700" },
    { title: "Approved Vendors", value: ov.approvedVendors ?? 0,                               icon: "✅", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { title: "Pending Vendors",  value: ov.pendingVendors ?? 0,                                icon: "⏳", color: "bg-amber-50 border-amber-200 text-amber-700" },
    { title: "Active Products",  value: ov.activeProducts ?? 0,                               icon: "📦", color: "bg-ink-50 border-ink-200 text-ink-700" },
    { title: "Pending Products", value: ov.pendingProducts ?? 0,                              icon: "🔍", color: "bg-orange-50 border-orange-200 text-orange-700" },
    { title: "Total Orders",     value: ord.total ?? 0,                                        icon: "🛒", color: "bg-ink-50 border-ink-200 text-ink-700" },
    { title: "Period Revenue",   value: `₹${(rev.current ?? 0).toLocaleString()}`,             icon: "💰", color: "bg-green-50 border-green-200 text-green-700" },
    { title: "Total Revenue",    value: `₹${(rev.total ?? 0).toLocaleString()}`,               icon: "💎", color: "bg-purple-50 border-purple-200 text-purple-700" },
  ];

  const statusBreakdown = ord.statusBreakdown || [];

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="section-label">Admin</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Platform Dashboard</h1>
          <p className="text-ink-400 text-sm mt-0.5">Analytics and platform overview</p>
        </div>
        <select value={range} onChange={e => setRange(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-700 focus:outline-none focus:border-ink-900">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className={`card p-5 border-2 ${s.color}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{s.title}</p>
                <p className="text-2xl font-bold text-ink-900 mt-2">{s.value}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Order status breakdown */}
      {statusBreakdown.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-display font-bold text-ink-900 mb-4">Order Status Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {statusBreakdown.map((s) => (
              <div key={s._id} className="p-3 rounded-xl bg-sand-50 border border-ink-100 text-center">
                <p className="text-lg font-bold text-ink-900">{s.count}</p>
                <p className="text-xs text-ink-500 mt-0.5">{s._id?.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      {data?.recentOrders?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display font-bold text-ink-900 mb-4">Recent Orders</h2>
          <div className="space-y-2">
            {data.recentOrders.map((o) => (
              <div key={o._id} className="flex items-center justify-between p-3.5 rounded-xl bg-sand-50">
                <div>
                  <p className="text-sm font-semibold text-ink-900">Order #{o._id?.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink-900">₹{o.totalAmount?.toLocaleString()}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{o.orderStatus?.replace(/_/g, " ")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
