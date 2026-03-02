import { useEffect, useState } from "react";
import Loader from "../../components/ui/Loader";
import api from "../../services/api";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/admin/analytics")
      .then((res) => setAnalytics(res.data.data))
      .catch(() => setAnalytics({ totalUsers: 0, totalVendors: 0, approvedVendors: 0, pendingVendors: 0, totalOrders: 0, ordersThisMonth: 0, revenueThisMonth: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

  const stats = [
    { title: "Total users", value: analytics?.totalUsers ?? 0, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { title: "Total vendors", value: analytics?.totalVendors ?? 0, color: "text-primary-600 bg-primary-50 border-primary-100" },
    { title: "Approved vendors", value: analytics?.approvedVendors ?? 0, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { title: "Pending vendors", value: analytics?.pendingVendors ?? 0, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { title: "Orders this month", value: analytics?.ordersThisMonth ?? 0, color: "text-ink-600 bg-ink-50 border-ink-200" },
    { title: "Revenue this month", value: `₹${(analytics?.revenueThisMonth ?? 0).toLocaleString()}`, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="bg-white border-b border-ink-100 px-8 py-8">
        <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-1">Admin</p>
        <h1 className="text-3xl font-display font-bold text-ink-900">Platform Dashboard</h1>
        <p className="text-ink-500 text-sm mt-1">Analytics and platform overview.</p>
      </div>
      <div className="p-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`bg-white rounded-2xl border-2 ${s.color} p-6 hover:shadow-md transition-all duration-200`}>
              <p className="text-xs font-display font-bold uppercase tracking-widest text-ink-400 mb-3">{s.title}</p>
              <p className="text-3xl font-display font-bold text-ink-900">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
