import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function VendorReports() {
  const navigate = useNavigate();

  const topProducts = [
    { name: "Wireless Headphones", sold: 120, revenue: 298000 },
    { name: "Smart Watch", sold: 85, revenue: 424000 },
    { name: "Bluetooth Speaker", sold: 63, revenue: 125000 },
  ];

  return (
    <div className="p-8 grid lg:grid-cols-3 gap-8">
      {/* LEFT SIDE */}
      <div className="lg:col-span-2 space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
          <p className="text-slate-600 mt-1">
            Track business performance, sales and growth.
          </p>
        </div>

        {/* KPI CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Stat title="Total revenue" value="₹12,48,500" />
          <Stat title="Orders completed" value="342" />
          <Stat title="Products sold" value="1,128" />
          <Stat title="Refunds" value="6" danger />
        </div>

        {/* PERFORMANCE OVERVIEW */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg">Performance overview</h3>
          <p className="text-slate-600 text-sm mt-1">
            Monthly sales & growth analytics (chart system placeholder)
          </p>

          <div className="mt-6 h-56 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
            Charts will appear here (Revenue, orders, growth)
          </div>
        </Card>

        {/* TOP PRODUCTS */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">
            Top performing products
          </h3>

          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b last:border-b-0 pb-3 last:pb-0"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-slate-500">{p.sold} units sold</p>
                </div>

                <p className="font-semibold text-green-600">
                  ₹{p.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* SALES INSIGHTS */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg">Sales insights</h3>

          <ul className="mt-3 text-sm text-slate-600 space-y-2 list-disc pl-5">
            <li>Smart Watch category performing above average.</li>
            <li>Wireless accessories driving 42% of revenue.</li>
            <li>Low stock may affect next week’s sales.</li>
            <li>Refund rate below 2% — excellent performance.</li>
          </ul>
        </Card>
      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-6">
        {/* QUICK ACTIONS */}
        <Card className="p-5 sticky top">
          <h3 className="font-semibold text-lg mb-4">Quick actions</h3>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => navigate("/vendor/dashboard")}
            >
              Vendor dashboard
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/vendor/products")}
            >
              Manage products
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/vendor/stock")}
            >
              Stock system
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/vendor/trade")}
            >
              Trade panel
            </Button>
          </div>
        </Card>

        {/* BUSINESS SUMMARY */}
        <Card className="p-5">
          <h3 className="font-semibold text-lg">Business summary</h3>

          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Average order value: ₹3,650</p>
            <p>Customer satisfaction: 4.6 ★</p>
            <p>On-time delivery rate: 96%</p>
          </div>
        </Card>

        {/* REPORT TOOLS */}
        <Card className="p-5 border border-blue-200 bg-blue-50">
          <h3 className="font-semibold text-blue-700">Report tools</h3>
          <p className="text-sm text-blue-700 mt-1">
            Export reports, analyze growth and track profitability.
          </p>

          <Button variant="outline" className="w-full mt-3">
            Download report (PDF)
          </Button>
        </Card>
      </div>
    </div>
  );
}

/* SMALL COMPONENT */
function Stat({ title, value, danger }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p
        className={`text-2xl font-semibold mt-1 ${
          danger ? "text-red-600" : ""
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
