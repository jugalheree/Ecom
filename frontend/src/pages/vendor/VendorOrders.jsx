import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vendorAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

const ORDER_ACTIONS = [
  { action: "PACK",             label: "Mark Packed",         icon: "📦", color: "bg-indigo-500", nextStatus: "PACKED" },
  { action: "PICKUP",           label: "Picked Up",           icon: "🚛", color: "bg-blue-500",   nextStatus: "PICKED_UP" },
  { action: "SHIP",             label: "Mark Shipped",        icon: "🚚", color: "bg-purple-500", nextStatus: "SHIPPED" },
  { action: "OUT_FOR_DELIVERY", label: "Out for Delivery",    icon: "📍", color: "bg-orange-500", nextStatus: "OUT_FOR_DELIVERY" },
  { action: "DELIVER",          label: "Mark Delivered",      icon: "✅", color: "bg-green-500",  nextStatus: "DELIVERED" },
];

const ITEM_STATUS_FLOW = ["PENDING","PACKED","PICKED_UP","SHIPPED","OUT_FOR_DELIVERY","DELIVERED"];

function getNextAction(currentStatus) {
  const idx = ITEM_STATUS_FLOW.indexOf(currentStatus);
  if (idx === -1 || idx >= ITEM_STATUS_FLOW.length - 1) return null;
  return ORDER_ACTIONS.find((a) => a.nextStatus === ITEM_STATUS_FLOW[idx + 1]) || null;
}

const statusStyle = {
  PENDING:          "text-amber-700 bg-amber-50 border-amber-200",
  PACKED:           "text-indigo-700 bg-indigo-50 border-indigo-200",
  PICKED_UP:        "text-blue-700 bg-blue-50 border-blue-200",
  SHIPPED:          "text-purple-700 bg-purple-50 border-purple-200",
  OUT_FOR_DELIVERY: "text-orange-700 bg-orange-50 border-orange-200",
  DELIVERED:        "text-green-700 bg-green-50 border-green-200",
  CANCELLED:        "text-red-700 bg-red-50 border-red-200",
  RETURN_REQUESTED: "text-rose-700 bg-rose-50 border-rose-200",
};

function OrderCard({ order, onAction, actionLoading }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const totalItems = order.items?.length || 0;
  const vendorItems = order.items || [];
  const isDeal = order.isDealOrder;

  return (
    <div className={`card overflow-hidden ${isDeal ? "border-2 border-orange-300 shadow-orange-100 shadow-md" : ""}`}>
      {/* Deal banner */}
      {isDeal && (
        <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
          <span className="text-sm">🤝</span>
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Vendor–Vendor Deal Order</span>
          <span className="ml-auto text-[10px] text-orange-500 font-semibold bg-orange-100 px-2 py-0.5 rounded-full">B2B</span>
        </div>
      )}
      {/* Order header */}
      <div
        className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-colors ${isDeal ? "hover:bg-orange-50" : "hover:bg-sand-50"}`}
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            <p className="text-xs text-ink-400 font-medium">Order</p>
            <p className="text-sm font-bold text-ink-900 font-mono">{order.orderNumber || order._id?.slice(-8)}</p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-ink-100" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-800 truncate">{order.buyerName || "Customer"}</p>
            <p className="text-xs text-ink-400">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle[order.orderStatus] || "text-ink-600 bg-ink-50 border-ink-200"}`}>
            {(order.orderStatus || "").replace(/_/g, " ")}
          </span>
          <span className="font-bold text-ink-900">₹{order.totalAmount?.toLocaleString()}</span>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/vendor/orders/${order._id}`); }}
            className="text-xs text-brand-600 hover:text-brand-800 font-semibold px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors"
          >Details →</button>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            className={`text-ink-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-ink-100">
          {/* Delivery address */}
          {order.deliveryAddress?.city && (
            <div className="px-5 py-3 bg-sand-50 border-b border-ink-100 flex items-start gap-2">
              <span className="text-sm flex-shrink-0">📍</span>
              <p className="text-xs text-ink-600">
                {[order.deliveryAddress.street, order.deliveryAddress.area, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.pincode].filter(Boolean).join(", ")}
              </p>
            </div>
          )}

          {vendorItems.map((item, i) => {
            const nextAction = getNextAction(item.status);
            const itemKey = item.productId?._id || item.productId;

            return (
              <div key={i} className="px-5 py-4 border-b border-ink-100 last:border-0">
                <div className="flex items-start gap-3">
                  {/* Product image */}
                  <div className="w-12 h-12 rounded-xl bg-sand-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.productId?.primaryImage
                      ? <img src={item.productId.primaryImage} alt="" className="w-full h-full object-cover rounded-xl" />
                      : <span className="text-xl">📦</span>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 line-clamp-1">
                      {item.productId?.title || item.title || "Product"}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-ink-500">Qty: {item.quantity}</span>
                      <span className="text-xs text-ink-500">₹{item.priceAtPurchase?.toLocaleString()}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusStyle[item.status] || "text-ink-500 bg-ink-50 border-ink-200"}`}>
                        {(item.status || "").replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  {nextAction && item.status !== "CANCELLED" && item.status !== "DELIVERED" && (
                    <button
                      onClick={() => onAction(order._id, itemKey, nextAction.action)}
                      disabled={actionLoading[`${order._id}-${itemKey}`]}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 ${nextAction.color}`}
                    >
                      {actionLoading[`${order._id}-${itemKey}`]
                        ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <span>{nextAction.icon}</span>
                      }
                      {nextAction.label}
                    </button>
                  )}

                  {item.status === "DELIVERED" && (
                    <span className="flex-shrink-0 flex items-center gap-1 text-xs text-green-600 font-semibold px-3 py-2">
                      ✓ Delivered
                    </span>
                  )}
                </div>

                {/* Timestamps */}
                <div className="mt-2 flex flex-wrap gap-3 pl-15">
                  {item.packedAt && <span className="text-[10px] text-ink-400">Packed: {new Date(item.packedAt).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}</span>}
                  {item.shippedAt && <span className="text-[10px] text-ink-400">Shipped: {new Date(item.shippedAt).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}</span>}
                  {item.deliveredAt && <span className="text-[10px] text-green-500">Delivered: {new Date(item.deliveredAt).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}</span>}
                </div>
              </div>
            );
          })}

          {/* Tracking timeline */}
          {order.deliveryTracking && order.deliveryTracking.length > 0 && (
            <div className="px-5 py-4 bg-sand-50 border-t border-ink-100">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">Delivery Timeline</p>
              <div className="space-y-2">
                {[...order.deliveryTracking].reverse().map((track, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? "bg-brand-500" : "bg-ink-300"}`} />
                    <div>
                      <p className="text-xs font-semibold text-ink-700">{(track.status || "").replace(/_/g, " ")}</p>
                      <p className="text-[10px] text-ink-400">{track.message}</p>
                      <p className="text-[10px] text-ink-300">{new Date(track.timestamp).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"})}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState("ALL");
  const showToast = useToastStore((s) => s.showToast);

  const load = (status) => {
    setLoading(true);
    const params = {};
    if (status && status !== "ALL") params.status = status;
    vendorAPI.getOrders(params)
      .then((r) => setOrders(r.data?.data?.orders || []))
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || "";
        // Don't show toast for "not approved yet" errors — vendor sees that elsewhere
        if (!msg.toLowerCase().includes("not approved") && !msg.toLowerCase().includes("vendor profile")) {
          showToast({ message: "Could not load orders", type: "error" });
        }
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleAction = async (orderId, productId, action) => {
    const key = `${orderId}-${productId}`;
    setActionLoading((s) => ({ ...s, [key]: true }));
    try {
      await vendorAPI.shipOrder(orderId, { productId, action });
      showToast({ message: `✓ Order updated!`, type: "success" });
      // Optimistically update item status
      setOrders((prev) =>
        prev.map((o) => {
          if (o._id !== orderId) return o;
          const actionDef = ORDER_ACTIONS.find((a) => a.action === action);
          return {
            ...o,
            items: o.items.map((item) => {
              const iid = item.productId?._id || item.productId;
              if (iid?.toString() !== productId?.toString()) return item;
              return { ...item, status: actionDef?.nextStatus || item.status };
            }),
          };
        })
      );
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to update order", type: "error" });
    } finally {
      setActionLoading((s) => ({ ...s, [key]: false }));
    }
  };

  const tabs = ["ALL","PENDING_PAYMENT","CONFIRMED","PROCESSING","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"];

  const summary = {
    total: orders.length,
    pending: orders.filter((o) => ["PENDING_PAYMENT","CONFIRMED","PROCESSING"].includes(o.orderStatus)).length,
    active: orders.filter((o) => ["PACKED","SHIPPED","OUT_FOR_DELIVERY"].includes(o.orderStatus)).length,
    delivered: orders.filter((o) => o.orderStatus === "DELIVERED").length,
  };

  const handlePickup = (returnId) =>
    act(() => markReturnPickedUp(returnId), "Marked as picked up!");

  const handleReceive = (returnId) =>
    act(() => markReturnReceived(returnId), "Marked as received!");

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Orders</h1>
        <p className="text-ink-400 text-sm mt-0.5">Manage and update delivery status for your orders</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders", value: summary.total, icon: "📋", color: "text-ink-900" },
          { label: "Pending",      value: summary.pending, icon: "⏳", color: "text-amber-600" },
          { label: "In Transit",   value: summary.active,  icon: "🚚", color: "text-blue-600" },
          { label: "Delivered",    value: summary.delivered, icon: "✅", color: "text-green-600" },
        ].map((s, i) => (
          <div key={i} className="card p-4 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-ink-400 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {["ALL","PENDING_PAYMENT","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"].map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              filter === tab ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:border-ink-400"
            }`}>
            {tab === "ALL" ? "All Orders" : tab.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="card p-5"><div className="skeleton h-16 rounded-xl" /></div>)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No orders found</h3>
          <p className="text-ink-500 text-sm mt-2">
            {filter === "ALL" ? "When buyers place orders, they'll appear here." : `No ${filter.replace(/_/g," ")} orders.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} onAction={handleAction} actionLoading={actionLoading} />
          ))}
        </div>
      )}
    </div>
  );
}