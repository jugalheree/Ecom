import { useEffect, useState } from "react";
import Loader from "../../components/ui/Loader";
import api from "../../services/api";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

  // Build last-6-month revenue + order chart data from recentOrders
  const monthlyChartData = (() => {
    const now = new Date();
    const map = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      map[key] = { month: key, revenue: 0, orders: 0 };
    }
    (data?.recentOrders || []).forEach((o) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      if (map[key]) {
        map[key].revenue += o.totalAmount || 0;
        map[key].orders += 1;
      }
    });
    return Object.values(map);
  })();

  // Status breakdown bar data
  const statusChartData = statusBreakdown.map((s) => ({
    name: (s._id || "").replace(/_/g, " "),
    count: s.count,
  }));

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

      {/* Revenue + Orders area chart */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <h2 className="font-display font-bold text-ink-900 mb-1">Revenue (6 months)</h2>
          <p className="text-xs text-ink-400 mb-4">Based on recent orders in view</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8e8e9a" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8e8e9a" }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e5ea", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#6c5ce7" strokeWidth={2}
                fill="url(#revGrad)" dot={{ fill: "#6c5ce7", r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-bold text-ink-900 mb-1">Orders by Status</h2>
          <p className="text-xs text-ink-400 mb-4">Current order pipeline</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8e8e9a" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8e8e9a" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, "Orders"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e5ea", fontSize: 12 }} />
              <Bar dataKey="count" fill="#131318" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly orders volume chart */}
      <div className="card p-5 mb-6">
        <h2 className="font-display font-bold text-ink-900 mb-1">Order Volume (6 months)</h2>
        <p className="text-xs text-ink-400 mb-4">Number of orders placed per month</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={monthlyChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8e8e9a" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#8e8e9a" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip formatter={(v) => [v, "Orders"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e5ea", fontSize: 12 }} />
            <Bar dataKey="orders" fill="#ff7d07" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

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
