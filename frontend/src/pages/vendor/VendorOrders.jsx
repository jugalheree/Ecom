import { useEffect, useState } from "react";
import { vendorAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

const statusBadge = (s) =>
  s === "DELIVERED"  ? "badge-success" :
  s === "CANCELLED"  ? "badge-danger"  :
  s === "SHIPPED"    ? "badge-navy"    :
  "badge-warn";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState({});
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    vendorAPI.getOrders()
      .then((r) => setOrders(r.data?.data?.orders || []))
      .catch(() => showToast({ message: "Failed to load orders", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const handleShip = async (orderId) => {
    const trackingNumber = prompt("Enter tracking number:");
    if (!trackingNumber) return;
    setShipping((s) => ({ ...s, [orderId]: true }));
    try {
      await vendorAPI.shipOrder(orderId, { trackingNumber });
      showToast({ message: "Order marked as shipped!", type: "success" });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: "SHIPPED" } : o));
    } catch { showToast({ message: "Failed to ship order", type: "error" }); }
    finally { setShipping((s) => ({ ...s, [orderId]: false })); }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Orders</h1>
        <p className="text-ink-400 text-sm mt-0.5">{orders.length} total orders</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-14 rounded-xl" /></div>)}</div>
      ) : orders.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No orders yet</h3>
          <p className="text-ink-500 text-sm mt-2">When buyers place orders, they'll appear here.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-ink-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Order ID</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Amount</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Status</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-ink-900">#{o._id?.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-4 text-ink-500 hidden sm:table-cell">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-4 py-4 font-bold text-ink-900">₹{o.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-4"><span className={statusBadge(o.status)}>{o.status?.replace(/_/g, " ")}</span></td>
                  <td className="px-4 py-4 text-right">
                    {(o.status === "CONFIRMED" || o.status === "PENDING") && (
                      <button onClick={() => handleShip(o._id)} disabled={shipping[o._id]}
                        className="btn-primary text-xs py-1.5 px-3">
                        {shipping[o._id] ? "Shipping..." : "Mark Shipped"}
                      </button>
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
