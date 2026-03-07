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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-ink-50"><Loader /></div>;

  const stats = [
    { title: "Total Users", value: analytics?.totalUsers ?? 0, icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ), accent: "text-blue-500 bg-blue-50 border-blue-100" },
    { title: "Total Vendors", value: analytics?.totalVendors ?? 0, icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    ), accent: "text-primary-600 bg-primary-50 border-primary-100" },
    { title: "Approved Vendors", value: analytics?.approvedVendors ?? 0, icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    ), accent: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { title: "Pending Vendors", value: analytics?.pendingVendors ?? 0, icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ), accent: "text-amber-600 bg-amber-50 border-amber-100" },
    { title: "Orders This Month", value: analytics?.ordersThisMonth ?? 0, icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    ), accent: "text-ink-600 bg-ink-50 border-ink-200" },
    { title: "Revenue This Month", value: `₹${(analytics?.revenueThisMonth ?? 0).toLocaleString()}`, icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ), accent: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="bg-white border-b border-ink-100 px-8 py-7">
        <p className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-amber-600 mb-1">Admin</p>
        <h1 className="text-2xl font-display font-bold text-ink-900">Platform Dashboard</h1>
        <p className="text-ink-400 text-sm mt-0.5">Analytics and platform overview.</p>
      </div>
      <div className="p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-ink-100 p-5 hover:shadow-md hover:border-ink-200 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${s.accent}`}>
                  {s.icon}
                </div>
              </div>
              <p className="text-[11px] font-display font-bold uppercase tracking-widest text-ink-400 mb-1">{s.title}</p>
              <p className="text-2xl font-display font-bold text-ink-900">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
