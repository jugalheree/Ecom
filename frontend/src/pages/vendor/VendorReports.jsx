import { useEffect, useState } from "react";
import { vendorAPI } from "../../services/apis/index";

export default function VendorReports() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      vendorAPI.getOrders({ limit: 100 }).then(r => setOrders(r.data?.data?.orders || [])),
      vendorAPI.products({ limit: 100 }).then(r => { const d = r.data?.data; setProducts(Array.isArray(d) ? d : d?.products || []); }),
    ]).finally(() => setLoading(false));
  }, []);

  // Compute stats from real data
  const totalRevenue = orders.filter(o => o.orderStatus === "DELIVERED" || o.orderStatus === "COMPLETED")
    .reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const delivered = orders.filter(o => o.orderStatus === "DELIVERED" || o.orderStatus === "COMPLETED").length;
  const cancelled = orders.filter(o => o.orderStatus === "CANCELLED").length;
  const avgOrderValue = totalOrders > 0 ? Math.round(orders.reduce((s,o) => s + (o.totalAmount||0), 0) / totalOrders) : 0;

  // Monthly revenue (last 6 months)
  const monthlyData = (() => {
    const map = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      map[key] = 0;
    }
    orders.forEach(o => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      if (map[key] !== undefined) map[key] += o.totalAmount || 0;
    });
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
  })();

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

  // Top products by sales
  const topProducts = [...products]
    .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
    .slice(0, 5);
  const maxSold = Math.max(...topProducts.map(p => p.totalSold || 0), 1);

  const SUMMARY = [
    { label: "Total Revenue",    value: `₹${totalRevenue.toLocaleString()}`, icon: "💰", color: "text-green-700" },
    { label: "Total Orders",     value: totalOrders,                          icon: "📦", color: "text-blue-700" },
    { label: "Delivered",        value: delivered,                            icon: "✅", color: "text-emerald-700" },
    { label: "Cancelled",        value: cancelled,                            icon: "❌", color: "text-red-700" },
    { label: "Avg Order Value",  value: `₹${avgOrderValue.toLocaleString()}`, icon: "📊", color: "text-indigo-700" },
    { label: "Products Listed",  value: products.length,                      icon: "🛍️", color: "text-brand-700" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6"><div className="skeleton h-8 w-40 rounded" /><div className="skeleton h-4 w-24 rounded mt-2" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">{[1,2,3,4,5,6].map(i => <div key={i} className="card p-5"><div className="skeleton h-14 rounded-xl" /></div>)}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Reports & Analytics</h1>
        <p className="text-ink-400 text-sm mt-0.5">Real-time data from your store</p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {SUMMARY.map((s, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-ink-400 font-medium">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-ink-900 mb-5">Monthly Revenue</h2>
          {monthlyData.every(d => d.revenue === 0) ? (
            <div className="h-40 flex items-center justify-center text-ink-400 text-sm">No revenue data yet</div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {monthlyData.map(({ month, revenue }) => {
                const pct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-ink-500 font-medium">
                      {revenue > 0 ? `₹${(revenue/1000).toFixed(0)}k` : ""}
                    </span>
                    <div className="w-full bg-ink-100 rounded-t-lg overflow-hidden" style={{ height: "100px" }}>
                      <div
                        className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg transition-all duration-700"
                        style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-ink-400">{month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-ink-900 mb-5">Top Products by Sales</h2>
          {topProducts.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-ink-400 text-sm">No product data yet</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const pct = maxSold > 0 ? ((p.totalSold || 0) / maxSold) * 100 : 0;
                return (
                  <div key={p._id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-ink-700 font-medium truncate max-w-[180px]">{p.title}</span>
                      <span className="text-ink-500 text-xs ml-2 flex-shrink-0">{p.totalSold || 0} sold · ₹{(p.revenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-display font-bold text-ink-900 mb-5">Order Status Breakdown</h2>
          {totalOrders === 0 ? (
            <div className="h-20 flex items-center justify-center text-ink-400 text-sm">No orders yet</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Pending",    count: orders.filter(o => ["PENDING_PAYMENT","CONFIRMED","PROCESSING"].includes(o.orderStatus)).length, color: "bg-amber-400" },
                { label: "In Transit", count: orders.filter(o => ["PACKED","SHIPPED","OUT_FOR_DELIVERY"].includes(o.orderStatus)).length, color: "bg-blue-400" },
                { label: "Delivered",  count: delivered, color: "bg-green-400" },
                { label: "Cancelled",  count: cancelled, color: "bg-red-400" },
              ].map((s, i) => (
                <div key={i} className="text-center p-4 bg-sand-50 rounded-xl">
                  <div className={`w-3 h-3 rounded-full ${s.color} mx-auto mb-2`} />
                  <p className="text-2xl font-display font-bold text-ink-900">{s.count}</p>
                  <p className="text-xs text-ink-400 font-medium mt-0.5">{s.label}</p>
                  <p className="text-xs text-ink-300">{totalOrders > 0 ? Math.round((s.count/totalOrders)*100) : 0}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
