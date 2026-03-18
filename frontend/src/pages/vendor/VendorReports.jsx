import BackendMissing from "../../components/ui/BackendMissing";

const REVENUE_DATA = [
  { month: "Aug", revenue: 285000 },
  { month: "Sep", revenue: 312000 },
  { month: "Oct", revenue: 298000 },
  { month: "Nov", revenue: 356000 },
  { month: "Dec", revenue: 412000 },
  { month: "Jan", revenue: 387000 },
];

const TOP_PRODUCTS = [
  { name: "Wireless Headphones", sold: 120, revenue: 298000 },
  { name: "Smart Watch",         sold: 85,  revenue: 424000 },
  { name: "Bluetooth Speaker",   sold: 63,  revenue: 125000 },
];

const SUMMARY = [
  { label: "Total Revenue",    value: "₹20.5L", change: "+12%", positive: true,  icon: "💰" },
  { label: "Total Orders",     value: "436",    change: "+8%",  positive: true,  icon: "📦" },
  { label: "Avg Order Value",  value: "₹4,703", change: "-2%",  positive: false, icon: "📊" },
];

export default function VendorReports() {
  const maxRevenue = Math.max(...REVENUE_DATA.map((d) => d.revenue));
  const maxProdRev = Math.max(...TOP_PRODUCTS.map((p) => p.revenue));
  const CHART_HEIGHT = 160; // px — fixed so bars render properly

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Sales Reports</h1>
        <p className="text-ink-400 text-sm mt-0.5">Performance overview (sample data — connect backend for live numbers)</p>
      </div>

      <BackendMissing
        method="GET"
        endpoint="/api/vendor/reports"
        todo="Return vendor revenue by month, top products by sales, and order counts so this dashboard shows real data"
      />

      {/* Summary tiles */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {SUMMARY.map((s, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-danger-500"}`}>
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-ink-900">{s.value}</p>
            <p className="text-xs text-ink-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* ── Revenue Bar Chart ── */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-ink-900 text-lg mb-6">Monthly Revenue</h2>

          {/* Fixed-height chart container */}
          <div className="flex items-end gap-3" style={{ height: `${CHART_HEIGHT}px` }}>
            {REVENUE_DATA.map((d, i) => {
              const barH = Math.round((d.revenue / maxRevenue) * CHART_HEIGHT);
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
                  <span className="text-[10px] text-ink-400 font-medium">
                    ₹{Math.round(d.revenue / 1000)}k
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-brand-600 hover:bg-brand-700 transition-colors cursor-pointer"
                    style={{ height: `${barH}px` }}
                  />
                  <span className="text-[10px] text-ink-400">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Top Products ── */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-ink-900 text-lg mb-6">Top Products</h2>
          <div className="space-y-5">
            {TOP_PRODUCTS.map((p, i) => {
              const pct = Math.round((p.revenue / maxProdRev) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-ink-900">{p.name}</span>
                    <span className="text-ink-500 text-xs">{p.sold} sold · ₹{(p.revenue / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-ink-900 text-lg mb-5">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { event: "Order #ORD-9A3F delivered",        time: "2 hours ago",  icon: "✅", color: "bg-emerald-50 text-emerald-700" },
            { event: "New order #ORD-7B2E placed",       time: "5 hours ago",  icon: "📦", color: "bg-brand-50 text-brand-700" },
            { event: "Product 'Smart Watch' approved",   time: "Yesterday",    icon: "🤖", color: "bg-navy-50 text-navy-700" },
            { event: "Return requested for #ORD-4C1A",   time: "2 days ago",   icon: "↩️", color: "bg-amber-50 text-amber-700" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-ink-50 last:border-0">
              <span className={`w-8 h-8 rounded-xl ${a.color} flex items-center justify-center text-sm flex-shrink-0`}>
                {a.icon}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-900">{a.event}</p>
              </div>
              <span className="text-xs text-ink-400 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
