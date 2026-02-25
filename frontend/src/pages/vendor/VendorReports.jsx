import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import RevenueChart from "../../components/charts/RevenueChart";
import TopProductsChart from "../../components/charts/TopProductsChart";

const REVENUE_DATA = [
  { month: "Aug", revenue: 285000 },
  { month: "Sep", revenue: 312000 },
  { month: "Oct", revenue: 298000 },
  { month: "Nov", revenue: 356000 },
  { month: "Dec", revenue: 412000 },
  { month: "Jan", revenue: 387000 },
];

export default function VendorReports() {
  const navigate = useNavigate();

  const topProducts = [
    { name: "Wireless Headphones", sold: 120, revenue: 298000 },
    { name: "Smart Watch", sold: 85, revenue: 424000 },
    { name: "Bluetooth Speaker", sold: 63, revenue: 125000 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-4">
            Reports & analytics
          </h1>
          <p className="text-xl text-stone-600">
            Track business performance, sales and growth.
          </p>
        </div>

        <div className="space-y-8">

          {/* KPI Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Stat title="Total revenue" value="₹12,48,500" />
            <Stat title="Orders completed" value="342" />
            <Stat title="Products sold" value="1,128" />
            <Stat title="Refunds" value="6" danger />
          </div>

          {/* Revenue Chart */}
          <Card className="p-8 border-2 border-stone-200">
            <h3 className="text-2xl font-semibold text-stone-900 mb-2">
              Revenue analytics
            </h3>
            <p className="text-stone-600 mb-4">
              Monthly revenue trend
            </p>

            <RevenueChart data={REVENUE_DATA} />
          </Card>

          {/* Top Products Chart */}
          <Card className="p-8 border-2 border-stone-200">
            <h3 className="text-2xl font-semibold text-stone-900 mb-2">
              Top products by revenue
            </h3>
            <p className="text-stone-600 mb-4">
              Revenue contribution per product
            </p>

            <TopProductsChart
              data={topProducts.map((p) => ({
                name:
                  p.name.length > 12
                    ? p.name.slice(0, 12) + "…"
                    : p.name,
                revenue: p.revenue,
              }))}
            />
          </Card>

          {/* Top Products List */}
          <Card className="p-8 border-2 border-stone-200">
            <h3 className="text-2xl font-semibold text-stone-900 mb-6">
              Top performing products
            </h3>

            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b border-stone-200 pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-stone-900">
                      {p.name}
                    </p>
                    <p className="text-sm text-stone-500">
                      {p.sold} units sold
                    </p>
                  </div>

                  <p className="font-semibold text-primary-600">
                    ₹{p.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Sales Insights */}
          <Card className="p-8 border-2 border-stone-200">
            <h3 className="text-2xl font-semibold text-stone-900 mb-4">
              Sales insights
            </h3>

            <ul className="text-stone-600 space-y-2 list-disc pl-6">
              <li>Smart Watch category performing above average.</li>
              <li>Wireless accessories driving 42% of revenue.</li>
              <li>Low stock may affect next week’s sales.</li>
              <li>Refund rate below 2% — excellent performance.</li>
            </ul>
          </Card>

        </div>
      </div>
    </div>
  );
}

/* Stat Card */
function Stat({ title, value, danger }) {
  return (
    <Card className="p-6 border-2 border-stone-200">
      <p className="text-sm text-stone-500 uppercase tracking-wide">
        {title}
      </p>
      <p
        className={`text-3xl font-bold mt-2 ${
          danger ? "text-amber-600" : "text-stone-900"
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
