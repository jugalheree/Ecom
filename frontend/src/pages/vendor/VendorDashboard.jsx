import Card from "../../components/ui/Card";
import { useNavigate } from "react-router-dom";
import TrustCard from "../../components/trust/TrustCard";
import RevenueChart from "../../components/charts/RevenueChart";
import OrdersChart from "../../components/charts/OrdersChart";

const REVENUE_DATA = [
  { month: "Sep", revenue: 12400, orders: 32 },
  { month: "Oct", revenue: 15800, orders: 41 },
  { month: "Nov", revenue: 14200, orders: 38 },
  { month: "Dec", revenue: 18500, orders: 48 },
  { month: "Jan", revenue: 22100, orders: 52 },
  { month: "Feb", revenue: 24800, orders: 61 },
];

export default function VendorDashboard() {
  const navigate = useNavigate();
  const stats = [
    { title: "Total revenue", value: "₹48,500", change: "+12%", icon: "↗", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { title: "Total orders", value: "126", change: "+8%", icon: "↗", color: "text-blue-600 bg-blue-50 border-blue-100" },
    { title: "Active products", value: "18", change: "stable", icon: "—", color: "text-primary-600 bg-primary-50 border-primary-100" },
    { title: "Low stock items", value: "3", change: "action needed", icon: "!", color: "text-amber-600 bg-amber-50 border-amber-100" },
  ];
  const recentOrders = [
    { id: 201, buyer: "Rahul Mehta", total: 3499, status: "Pending" },
    { id: 202, buyer: "Neha Shah", total: 4999, status: "Shipped" },
    { id: 203, buyer: "Aman Patel", total: 1999, status: "Completed" },
  ];
  const statusStyles = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Shipped: "bg-primary-50 text-primary-700 border-primary-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="bg-white border-b border-ink-100 px-8 py-8">
        <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-1">Overview</p>
        <h1 className="text-3xl font-display font-bold text-ink-900">Vendor Dashboard</h1>
        <p className="text-ink-500 text-sm mt-1">Monitor your business performance and store activity.</p>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`bg-white rounded-2xl border-2 ${s.color} p-5 hover:shadow-md transition-all duration-200`}>
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-display font-bold uppercase tracking-widest text-ink-500">{s.title}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${s.color}`}>{s.change}</span>
              </div>
              <p className="text-3xl font-display font-bold text-ink-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Trust + Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <TrustCard title="Vendor rating" rating={4.6} reviews={128} badge="Trusted vendor" />
          <TrustCard title="Product satisfaction" rating={4.4} reviews={342} badge="High quality store" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 border border-ink-200">
            <h3 className="font-display font-bold text-ink-900 mb-1">Revenue trend</h3>
            <p className="text-xs text-ink-400 mb-4">Monthly revenue over the last 6 months</p>
            <RevenueChart data={REVENUE_DATA} />
          </Card>
          <Card className="p-6 border border-ink-200">
            <h3 className="font-display font-bold text-ink-900 mb-1">Orders overview</h3>
            <p className="text-xs text-ink-400 mb-4">Order volume trend</p>
            <OrdersChart data={REVENUE_DATA} />
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="p-6 border border-ink-200">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-display font-bold text-ink-900">Recent orders</h3>
              <p className="text-xs text-ink-400 mt-0.5">Latest customer orders</p>
            </div>
            <button onClick={() => navigate("/vendor/trade")} className="text-xs font-display font-semibold text-primary-600 hover:text-primary-700 border border-primary-200 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex justify-between items-center p-4 bg-ink-50 rounded-xl hover:bg-ink-100 transition-colors">
                <div>
                  <p className="font-display font-semibold text-ink-900 text-sm">#{o.id} · {o.buyer}</p>
                  <p className="text-xs text-ink-400 mt-0.5">₹{o.total.toLocaleString()}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-lg font-semibold border ${statusStyles[o.status]}`}>{o.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
