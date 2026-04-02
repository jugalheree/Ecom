import { useEffect, useState, useCallback } from "react";
import { adminAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";
import api from "../../services/api";

const STATUS_STYLE = {
  PENDING_PAYMENT:  "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED:        "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING:       "bg-indigo-50 text-indigo-700 border-indigo-200",
  PACKED:           "bg-violet-50 text-violet-700 border-violet-200",
  SHIPPED:          "bg-purple-50 text-purple-700 border-purple-200",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700 border-orange-200",
  DELIVERED:        "bg-green-50 text-green-700 border-green-200",
  COMPLETED:        "bg-green-50 text-green-700 border-green-200",
  CANCELLED:        "bg-red-50 text-red-700 border-red-200",
  RETURN_REQUESTED: "bg-rose-50 text-rose-700 border-rose-200",
  RETURNED:         "bg-orange-50 text-orange-700 border-orange-200",
  REFUNDED:         "bg-teal-50 text-teal-700 border-teal-200",
};

// ── Order Detail Modal ─────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-ink-100">
          <div>
            <h2 className="text-xl font-display font-bold text-ink-900">Order #{order.orderNumber || order._id?.slice(-10)}</h2>
            <p className="text-sm text-ink-500 mt-0.5">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_STYLE[order.orderStatus] || "bg-ink-50 text-ink-600 border-ink-200"}`}>
              {(order.orderStatus || "").replace(/_/g, " ")}
            </span>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-ink-50 text-ink-400 hover:text-ink-700 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Buyer Info */}
          <div>
            <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-3">Buyer</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Name", value: order.buyerId?.name || "—" },
                { label: "Contact", value: order.buyerId?.email || order.buyerId?.phone || "—" },
                { label: "Payment", value: order.paymentMethod || "—" },
                { label: "Total", value: `₹${order.totalAmount?.toLocaleString() || "—"}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-sand-50 rounded-xl p-3">
                  <p className="text-xs text-ink-400 font-medium mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-ink-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div>
              <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-3">Delivery Address</h3>
              <div className="bg-sand-50 rounded-xl p-4 flex items-start gap-3">
                <span className="text-lg flex-shrink-0">📍</span>
                <p className="text-sm text-ink-700">
                  {[
                    order.deliveryAddress.buildingNameOrNumber,
                    order.deliveryAddress.street,
                    order.deliveryAddress.area,
                    order.deliveryAddress.city,
                    order.deliveryAddress.state,
                    order.deliveryAddress.pincode,
                  ].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Order Items */}
          {order.items?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-3">Items ({order.items.length})</h3>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-sand-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center text-sm flex-shrink-0">📦</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink-800 truncate">{item.productId?.title || item.title || "Product"}</p>
                        <p className="text-xs text-ink-400">{item.vendorId?.shopName || ""}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-bold text-ink-900">₹{item.totalPrice?.toLocaleString() || (item.price * item.quantity)?.toLocaleString()}</p>
                      <p className="text-xs text-ink-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coupon */}
          {order.couponCode && (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm">🎟️</span>
                <span className="text-sm font-semibold text-green-700">Coupon: {order.couponCode}</span>
              </div>
              <span className="text-sm font-bold text-green-700">-₹{order.couponDiscount?.toLocaleString() || "—"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const showToast = useToastStore((s) => s.showToast);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (status) params.status = status;
    if (search) params.search = search;
    adminAPI.getAllOrders(params)
      .then((r) => {
        setOrders(r.data?.data?.orders || []);
        setTotalPages(r.data?.data?.pagination?.totalPages || 1);
        setTotal(r.data?.data?.pagination?.total || 0);
      })
      .catch(() => showToast({ message: "Failed to load orders", type: "error" }))
      .finally(() => setLoading(false));
  }, [page, status, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => { setPage(1); load(); };

  const STATUSES = ["","PENDING_PAYMENT","CONFIRMED","PROCESSING","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED","RETURN_REQUESTED","RETURNED","REFUNDED"];

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Admin</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">All Orders</h1>
        <p className="text-ink-400 text-sm mt-0.5">{total.toLocaleString()} orders found · click any row to view details</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Search order number..."
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-400" />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-400">
          {STATUSES.map(s => <option key={s} value={s}>{s === "" ? "All Statuses" : s.replace(/_/g," ")}</option>)}
        </select>
        <button onClick={handleSearch} className="btn-primary px-4 py-2 text-sm">Search</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="card p-5"><div className="skeleton h-12 rounded-xl" /></div>)}</div>
      ) : orders.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="font-display font-bold text-ink-900 text-lg">No orders found</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-sand-50 border-b border-ink-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Order</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden sm:table-cell">Buyer</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Amount</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Date</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map((o) => (
                  <tr key={o._id}
                    onClick={() => setSelectedOrder(o)}
                    className="hover:bg-brand-50 transition-colors cursor-pointer group">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-bold text-ink-700 group-hover:text-brand-700 transition-colors">{o.orderNumber || o._id?.slice(-10)}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{o.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <p className="text-sm font-medium text-ink-800">{o.buyerId?.name || "—"}</p>
                      <p className="text-xs text-ink-400">{o.buyerId?.email || o.buyerId?.phone || ""}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[o.orderStatus] || "bg-ink-50 text-ink-600 border-ink-200"}`}>
                        {(o.orderStatus || "").replace(/_/g," ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-ink-900">₹{o.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-4 text-ink-400 hidden md:table-cell text-xs">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-4 text-ink-500 hidden md:table-cell">{o.items?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-outline py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-ink-600 font-medium px-3">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-outline py-2 px-4 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
