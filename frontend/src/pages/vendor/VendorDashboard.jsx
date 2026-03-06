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
    { title: "Total Revenue", value: "₹48,500", change: "+12%", positive: true, icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    )},
    { title: "Total Orders", value: "126", change: "+8%", positive: true, icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    )},
    { title: "Active Products", value: "18", change: "stable", positive: null, icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
    )},
    { title: "Low Stock", value: "3", change: "action needed", positive: false, icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    )},
  ];
  const recentOrders = [
    { id: 201, buyer: "Rahul Mehta", total: 3499, status: "Pending" },
    { id: 202, buyer: "Neha Shah", total: 4999, status: "Shipped" },
    { id: 203, buyer: "Aman Patel", total: 1999, status: "Completed" },
  ];
  const statusStyles = {
    Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    Shipped: "bg-primary-500/10 text-primary-400 border border-primary-500/20",
    Completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Page header */}
      <div className="bg-white border-b border-ink-100 px-8 py-7">
        <p className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-primary-600 mb-1">Overview</p>
        <h1 className="text-2xl font-display font-bold text-ink-900">Vendor Dashboard</h1>
        <p className="text-ink-400 text-sm mt-0.5">Monitor your business performance and store activity.</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-ink-100 p-5 hover:shadow-md hover:border-ink-200 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-ink-50 border border-ink-100 flex items-center justify-center text-ink-500">
                  {s.icon}
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                  s.positive === true ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : s.positive === false ? "bg-red-50 text-red-500 border border-red-100"
                  : "bg-ink-50 text-ink-400 border border-ink-100"
                }`}>{s.change}</span>
              </div>
              <p className="text-[11px] font-display font-bold uppercase tracking-widest text-ink-400 mb-1">{s.title}</p>
              <p className="text-2xl font-display font-bold text-ink-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Trust cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <TrustCard title="Vendor rating" rating={4.6} reviews={128} badge="Trusted vendor" />
          <TrustCard title="Product satisfaction" rating={4.4} reviews={342} badge="High quality store" />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-ink-100 p-5">
            <h3 className="font-display font-bold text-ink-900 text-sm mb-0.5">Revenue Trend</h3>
            <p className="text-[11px] text-ink-400 mb-4">Monthly revenue over the last 6 months</p>
            <RevenueChart data={REVENUE_DATA} />
          </div>
          <div className="bg-white rounded-2xl border border-ink-100 p-5">
            <h3 className="font-display font-bold text-ink-900 text-sm mb-0.5">Orders Overview</h3>
            <p className="text-[11px] text-ink-400 mb-4">Order volume trend</p>
            <OrdersChart data={REVENUE_DATA} />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-ink-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-display font-bold text-ink-900 text-sm">Recent Orders</h3>
              <p className="text-[11px] text-ink-400 mt-0.5">Latest customer orders</p>
            </div>
            <button onClick={() => navigate("/vendor/trade")}
              className="text-[11px] font-display font-semibold text-primary-600 hover:text-primary-700 border border-primary-100 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex justify-between items-center p-3.5 bg-ink-50 rounded-xl hover:bg-ink-100 transition-colors">
                <div>
                  <p className="font-display font-semibold text-ink-900 text-sm">#{o.id} · {o.buyer}</p>
                  <p className="text-[11px] text-ink-400 mt-0.5">₹{o.total.toLocaleString()}</p>
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold ${statusStyles[o.status]}`}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
