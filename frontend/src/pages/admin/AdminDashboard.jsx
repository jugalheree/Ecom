import { useEffect, useState } from "react";
import Loader from "../../components/ui/Loader";
import api from "../../services/api";
import { platformAPI } from "../../services/apis/index";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

function PlatformConfigPanel() {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [commission, setCommission] = useState("");
  const [festival, setFestival] = useState({ name: "", percent: "", endsAt: "", active: false });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    platformAPI.getConfig().then(r => {
      const d = r.data?.data;
      setConfig(d);
      setCommission(String(d?.commissionPercent ?? 5));
      setFestival({
        name: d?.festivalName || "",
        percent: String(d?.festivalDiscountPercent ?? 0),
        endsAt: d?.festivalEndsAt ? d.festivalEndsAt.slice(0, 10) : "",
        active: d?.festivalDiscountActive || false,
      });
    }).catch(() => {});
  }, []);

  const saveCommission = async () => {
    setSaving(true); setMsg("");
    try {
      await platformAPI.updateCommission({ commissionPercent: Number(commission) });
      setMsg("Commission updated ✓");
    } catch (e) { setMsg(e?.message || "Error"); }
    finally { setSaving(false); }
  };

  const saveFestival = async () => {
    setSaving(true); setMsg("");
    try {
      await platformAPI.updateFestival({
        festivalName: festival.name,
        festivalDiscountPercent: Number(festival.percent),
        festivalEndsAt: festival.endsAt || null,
        festivalDiscountActive: festival.active,
      });
      setMsg(festival.active ? `Festival discount activated ✓` : "Festival discount deactivated ✓");
    } catch (e) { setMsg(e?.message || "Error"); }
    finally { setSaving(false); }
  };

  if (!config) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
      {/* Commission */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-xl">💸</div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Platform Commission</h3>
            <p className="text-xs text-ink-400">Applied to every vendor sale</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="number" min="0" max="50" step="0.5" value={commission}
            onChange={e => setCommission(e.target.value)}
            className="w-24 px-3 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-900 focus:outline-none focus:border-brand-500"
          />
          <span className="text-ink-500 text-sm font-semibold">%</span>
          <button onClick={saveCommission} disabled={saving}
            className="btn-primary text-xs px-4 py-2 ml-2">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        <p className="text-xs text-ink-400 mt-2">Current: <strong>{config.commissionPercent}%</strong></p>
      </div>

      {/* Festival Discount */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">🎉</div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Festival Discount</h3>
            <p className="text-xs text-ink-400">Applied platform-wide on top of vendor discounts</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input type="text" placeholder="Festival name (e.g. Diwali Sale)" value={festival.name}
              onChange={e => setFestival(f => ({ ...f, name: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-500"
            />
            <input type="number" min="0" max="50" placeholder="%" value={festival.percent}
              onChange={e => setFestival(f => ({ ...f, percent: e.target.value }))}
              className="w-16 px-3 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <input type="date" value={festival.endsAt}
              onChange={e => setFestival(f => ({ ...f, endsAt: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-500"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setFestival(f => ({ ...f, active: !f.active }))}
                className={`w-11 h-6 rounded-full transition-colors relative ${festival.active ? "bg-brand-500" : "bg-ink-200"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${festival.active ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-xs font-semibold text-ink-600">{festival.active ? "Active" : "Off"}</span>
            </label>
          </div>
          <button onClick={saveFestival} disabled={saving}
            className="btn-primary text-xs px-4 py-2 w-full">
            {saving ? "Saving..." : festival.active ? "Activate Festival Discount" : "Deactivate"}
          </button>
        </div>
      </div>
      {msg && <p className="col-span-2 text-xs text-center font-semibold text-brand-600">{msg}</p>}
    </div>
  );
}

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

      {/* Commission & Festival Discount Controls */}
      <PlatformConfigPanel />

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
