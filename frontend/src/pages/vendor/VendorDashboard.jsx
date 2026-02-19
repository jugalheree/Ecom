import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
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
    { title: "Total revenue", value: "₹48,500", icon: "💰", gradient: "from-emerald-500 to-emerald-600" },
    { title: "Total orders", value: "126", icon: "📦", gradient: "from-blue-500 to-blue-600" },
    { title: "Active products", value: "18", icon: "📋", gradient: "from-primary-500 to-primary-600" },
    { title: "Low stock items", value: "3", danger: true, icon: "⚠️", gradient: "from-amber-500 to-amber-600" },
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
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-4">
            Vendor dashboard
          </h1>
          <p className="text-xl text-stone-600">
            Monitor your business performance and store activity.
          </p>
        </div>

        

        {/* Full-width Main Content */}
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <Card key={i} className="p-6 border-2 border-stone-200 hover:border-primary-300 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {s.icon}
                </div>
                <p className="text-sm text-stone-600 font-medium uppercase tracking-wide mb-2">{s.title}</p>
                <p className={`text-3xl font-bold ${s.danger ? "text-amber-600" : "text-stone-900"}`}>
                  {s.value}
                </p>
              </Card>
            ))}
          </div>

          {/* Trust Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            <TrustCard title="Vendor rating" rating={4.6} reviews={128} badge="Trusted vendor" />
            <TrustCard title="Product satisfaction" rating={4.4} reviews={342} badge="High quality store" />
          </div>

          {/* Revenue Chart */}
          <Card className="p-8 border-2 border-stone-200">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-stone-900 mb-2">Revenue trend</h3>
              <p className="text-stone-600">Monthly revenue over the last 6 months</p>
            </div>
            <div className="mt-4">
              <RevenueChart data={REVENUE_DATA} />
            </div>
          </Card>

          {/* Orders Chart */}
          <Card className="p-8 border-2 border-stone-200">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-stone-900 mb-2">Orders overview</h3>
              <p className="text-stone-600">Order volume trend</p>
            </div>
            <div className="mt-4">
              <OrdersChart data={REVENUE_DATA} />
            </div>
          </Card>

          {/* Recent Orders */}
          <Card className="p-8 border-2 border-stone-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-stone-900 mb-2">Recent orders</h3>
                <p className="text-stone-600">Latest customer orders</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/vendor/trade")}>
                View all
              </Button>
            </div>

            <div className="space-y-4">
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex justify-between items-center p-4 border-2 border-stone-200 rounded-xl hover:border-primary-300 transition-all duration-300"
                >
                  <div>
                    <p className="font-semibold text-stone-900">
                      #{o.id} • {o.buyer}
                    </p>
                    <p className="text-sm text-stone-600 mt-1">₹{o.total}</p>
                  </div>

                  <span className={`text-xs px-4 py-2 rounded-full font-semibold border-2 ${statusStyles[o.status]}`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
