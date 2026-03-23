import { useEffect, useState } from "react";
import api from "../../services/api";
import BackendMissing from "../../components/ui/BackendMissing";

const statusBadge = (s) =>
  s === "DELIVERED" ? "badge-success" :
  s === "SHIPPED"   ? "badge-navy"    :
  s === "CANCELLED" ? "badge-danger"  :
  "badge-warn";

export default function VendorTrade() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendMissing, setBackendMissing] = useState(false);

  useEffect(() => {
    api.get("/api/orders/vendor")
      .then((res) => setOrders(res.data.data?.orders || []))
      .catch(() => setBackendMissing(true))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
    } catch {
      setBackendMissing(true);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">B2B Trade Orders</h1>
        <p className="text-ink-400 text-sm mt-0.5">Manage your vendor-to-vendor trade orders</p>
      </div>

      {backendMissing && (
        <BackendMissing
          method="GET"
          endpoint="/api/orders/vendor"
          todo="Add vendor B2B trade order list endpoint. Also needs PATCH /api/orders/:id/status to update order status"
        />
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-14 rounded-xl" /></div>)}</div>
      ) : orders.length === 0 && !backendMissing ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🔄</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No trade orders yet</h3>
          <p className="text-ink-500 text-sm mt-2">B2B trade orders from other vendors will appear here.</p>
        </div>
      ) : orders.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-ink-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Order ID</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden sm:table-cell">Buyer</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Amount</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Status</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-ink-900">#{o._id?.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-4 text-ink-600 hidden sm:table-cell">{o.buyer?.name || "—"}</td>
                  <td className="px-4 py-4 font-bold text-ink-900">₹{o.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-4"><span className={statusBadge(o.status)}>{o.status?.replace(/_/g," ")}</span></td>
                  <td className="px-4 py-4 text-right">
                    {o.status === "PENDING" && (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => updateStatus(o._id, "SHIPPED")} className="btn-primary text-xs py-1.5 px-3">Accept</button>
                        <button onClick={() => updateStatus(o._id, "CANCELLED")} className="btn-outline border-danger-200 text-danger-500 hover:bg-red-50 text-xs py-1.5 px-3">Decline</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
