import { useEffect, useState } from "react";
import Loader from "../../components/ui/Loader";
import BackendMissing from "../../components/ui/BackendMissing";
import api from "../../services/api";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendMissing, setBackendMissing] = useState(false);

  useEffect(() => {
    api.get("/api/admin/analytics")
      .then((res) => setAnalytics(res.data.data))
      .catch(() => {
        setBackendMissing(true);
        setAnalytics({ totalUsers: 0, totalVendors: 0, approvedVendors: 0, pendingVendors: 0, totalOrders: 0, ordersThisMonth: 0, revenueThisMonth: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex-1 flex items-center justify-center min-h-screen"><Loader size="lg" /></div>;

  const stats = [
    { title: "Total Users",         value: analytics?.totalUsers ?? 0,                               icon: "👥", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { title: "Total Vendors",       value: analytics?.totalVendors ?? 0,                             icon: "🏪", color: "bg-brand-50 border-brand-200 text-brand-700" },
    { title: "Approved Vendors",    value: analytics?.approvedVendors ?? 0,                          icon: "✅", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { title: "Pending Vendors",     value: analytics?.pendingVendors ?? 0,                           icon: "⏳", color: "bg-amber-50 border-amber-200 text-amber-700" },
    { title: "Orders This Month",   value: analytics?.ordersThisMonth ?? 0,                          icon: "📦", color: "bg-ink-50 border-ink-200 text-ink-700" },
    { title: "Revenue This Month",  value: `₹${(analytics?.revenueThisMonth ?? 0).toLocaleString()}`, icon: "💰", color: "bg-green-50 border-green-200 text-green-700" },
  ];

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Admin</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Platform Dashboard</h1>
        <p className="text-ink-400 text-sm mt-0.5">Analytics and platform overview</p>
      </div>

      {backendMissing && (
        <BackendMissing
          method="GET" endpoint="/api/admin/analytics"
          todo="Create analytics controller returning totalUsers, totalVendors, approvedVendors, pendingVendors, totalOrders, ordersThisMonth, revenueThisMonth"
        />
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
}
