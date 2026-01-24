import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function VendorDashboard() {
  const navigate = useNavigate();

  const stats = [
    { title: "Total revenue", value: "₹48,500" },
    { title: "Total orders", value: "126" },
    { title: "Active products", value: "18" },
    { title: "Low stock items", value: "3", danger: true },
  ];

  const recentOrders = [
    { id: 201, buyer: "Rahul Mehta", total: 3499, status: "Pending" },
    { id: 202, buyer: "Neha Shah", total: 4999, status: "Shipped" },
    { id: 203, buyer: "Aman Patel", total: 1999, status: "Completed" },
  ];

  return (
    <div className="p-8 grid lg:grid-cols-3 gap-8 bg-slate-50 min-h-screen">

      {/* LEFT SIDE */}
      <div className="lg:col-span-2 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Vendor dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Monitor your business performance and store activity.
          </p>
        </div>

        {/* STATS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <Card key={i} className="p-5 hover:shadow-md transition">
              <p className="text-sm text-slate-500">{s.title}</p>
              <p
                className={`text-2xl font-semibold mt-1 ${
                  s.danger ? "text-red-600" : ""
                }`}
              >
                {s.value}
              </p>
            </Card>
          ))}
        </div>

        {/* PERFORMANCE OVERVIEW */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg">Business overview</h3>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Your store is performing steadily. Orders are being processed and
            most products are in healthy stock. Keep inventory balanced and
            maintain fast response times to improve visibility and trust score.
          </p>

          <div className="mt-5 h-40 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 text-sm">
            Analytics & performance widgets will appear here
          </div>
        </Card>

        {/* RECENT ORDERS */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Recent orders</h3>
            <button
              onClick={() => navigate("/vendor/trade")}
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex justify-between items-center border-b last:border-b-0 pb-2 last:pb-0"
              >
                <div>
                  <p className="font-medium">
                    #{o.id} • {o.buyer}
                  </p>
                  <p className="text-sm text-slate-500">₹{o.total}</p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    o.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : o.status === "Shipped"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-6 sticky top h-fit">

        {/* TODAY SNAPSHOT */}
        <Card className="p-5">
          <h3 className="font-semibold text-lg">Today</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>New orders: 4</p>
            <p>Products sold: 11</p>
            <p>Revenue: ₹6,420</p>
          </div>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="p-5 border-2">
          <h3 className="font-semibold text-lg mb-4">Quick actions</h3>

          <div className="space-y-3">
            <Button className="w-full" onClick={() => navigate("/vendor/products")}>
              Add / manage products
            </Button>

            <Button variant="outline" className="w-full" onClick={() => navigate("/vendor/stock")}>
              Manage stock
            </Button>

            <Button variant="outline" className="w-full" onClick={() => navigate("/vendor/trade")}>
              Open trade panel
            </Button>

            <Button variant="outline" className="w-full" onClick={() => navigate("/vendor/reports")}>
              View reports
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
