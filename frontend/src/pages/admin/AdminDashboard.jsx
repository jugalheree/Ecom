import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import api from "../../services/api";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/admin/analytics")
      .then((res) => setAnalytics(res.data.data))
      .catch(() => setAnalytics({
        totalUsers: 0,
        totalVendors: 0,
        approvedVendors: 0,
        pendingVendors: 0,
        totalOrders: 0,
        ordersThisMonth: 0,
        revenueThisMonth: 0,
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const stats = [
    { title: "Total users", value: analytics?.totalUsers ?? 0, icon: "👥", gradient: "from-blue-500 to-blue-600" },
    { title: "Total vendors", value: analytics?.totalVendors ?? 0, icon: "🏪", gradient: "from-primary-500 to-primary-600" },
    { title: "Approved vendors", value: analytics?.approvedVendors ?? 0, icon: "✅", gradient: "from-emerald-500 to-emerald-600" },
    { title: "Pending vendors", value: analytics?.pendingVendors ?? 0, icon: "⏳", gradient: "from-amber-500 to-amber-600" },
    { title: "Orders this month", value: analytics?.ordersThisMonth ?? 0, icon: "📦", gradient: "from-stone-600 to-stone-700" },
    { title: "Revenue this month", value: `₹${(analytics?.revenueThisMonth ?? 0).toLocaleString()}`, icon: "💰", gradient: "from-emerald-600 to-teal-600" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-4">
            Admin dashboard
          </h1>
          <p className="text-xl text-stone-600">
            Platform analytics and overview.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <Card key={i} className="p-6 border-2 border-stone-200 hover:border-primary-300 transition-all duration-300 group">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {s.icon}
              </div>
              <p className="text-sm text-stone-600 font-medium uppercase tracking-wide mb-2">{s.title}</p>
              <p className="text-3xl font-bold text-stone-900">{s.value}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
