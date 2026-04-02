import { useEffect, useState } from "react";
import { assignmentAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

const STATUS_CONFIG = {
  ASSIGNED:         { label: "Assigned — Accept to begin", color: "bg-amber-50 text-amber-700 border-amber-200",   next: [{ action: "ACCEPTED",         label: "✅ Accept Order",     color: "bg-blue-600" }] },
  ACCEPTED:         { label: "Accepted — Go pick up",       color: "bg-blue-50 text-blue-700 border-blue-200",     next: [{ action: "PICKED_UP",         label: "📦 Mark Picked Up",  color: "bg-indigo-600" }] },
  PICKED_UP:        { label: "Picked Up",                    color: "bg-indigo-50 text-indigo-700 border-indigo-200",next: [{ action: "OUT_FOR_DELIVERY",  label: "🚚 Out for Delivery",color: "bg-orange-500" }] },
  OUT_FOR_DELIVERY: { label: "Out for Delivery",             color: "bg-orange-50 text-orange-700 border-orange-200",next: [
    { action: "DELIVERED",      label: "✅ Delivered",         color: "bg-green-600" },
    { action: "FAILED",         label: "❌ Failed Attempt",    color: "bg-red-500" },
  ]},
  DELIVERED:        { label: "Delivered ✓",                  color: "bg-green-50 text-green-700 border-green-200",   next: [] },
  FAILED:           { label: "Failed",                        color: "bg-red-50 text-red-700 border-red-200",         next: [] },
};

export default function DeliveryOrders() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [filter, setFilter] = useState("active");
  const showToast = useToastStore(s => s.showToast);

  const load = () => {
    setLoading(true);
    const params = filter === "active"
      ? { status: undefined } // get all non-reassigned
      : { status: filter };
    assignmentAPI.getMy(params)
      .then(r => setAssignments(r.data?.data || []))
      .catch(() => showToast({ message: "Failed to load assignments", type: "error" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleAction = async (assignmentId, action) => {
    setUpdating(s => ({ ...s, [assignmentId]: true }));
    let note = "";
    if (action === "FAILED") {
      note = prompt("Reason for failed delivery (e.g. customer not home):") || "Delivery attempt failed";
    }
    try {
      await assignmentAPI.updateStatus(assignmentId, { status: action, message: note || undefined, failReason: action === "FAILED" ? note : undefined });
      showToast({ message: `Status updated: ${action.replace(/_/g, " ")}`, type: "success" });
      setAssignments(prev => prev.map(a =>
        a._id === assignmentId ? { ...a, status: action } : a
      ));
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to update", type: "error" });
    } finally {
      setUpdating(s => ({ ...s, [assignmentId]: false }));
    }
  };

  const active = assignments.filter(a => !["DELIVERED","FAILED","REASSIGNED"].includes(a.status));
  const done   = assignments.filter(a => ["DELIVERED","FAILED"].includes(a.status));
  const display = filter === "active" ? active : filter === "done" ? done : assignments;

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Delivery</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">My Deliveries</h1>
        <p className="text-ink-400 text-sm mt-0.5">Orders assigned to you</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Pending",   value: active.length,  color: "text-amber-600", icon: "📋" },
          { label: "Delivered", value: done.filter(a => a.status === "DELIVERED").length, color: "text-green-600", icon: "✅" },
          { label: "Failed",    value: done.filter(a => a.status === "FAILED").length,    color: "text-red-500",   icon: "❌" },
        ].map((s, i) => (
          <div key={i} className="card p-3.5 flex items-center gap-2.5">
            <span className="text-xl">{s.icon}</span>
            <div>
              <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-ink-400 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[["active","Active"], ["done","Completed"], ["all","All"]].map(([v, label]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === v ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:border-ink-400"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-20 rounded-xl" /></div>)}</div>
      ) : display.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📬</div>
          <p className="font-display font-bold text-ink-900 text-lg">
            {filter === "active" ? "No active deliveries" : "No deliveries here"}
          </p>
          <p className="text-ink-500 text-sm mt-2">
            {filter === "active" ? "You're all caught up! New assignments will appear here." : "Nothing to show for this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {display.map(a => {
            const order = a.orderId;
            const cfg = STATUS_CONFIG[a.status] || { label: a.status, color: "bg-ink-50 text-ink-600 border-ink-200", next: [] };
            const isUpdating = updating[a._id];

            return (
              <div key={a._id} className={`card overflow-hidden ${a.status === "ASSIGNED" ? "border-l-4 border-l-amber-400" : a.status === "DELIVERED" ? "border-l-4 border-l-green-400" : ""}`}>
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-mono text-sm font-bold text-ink-700">
                          #{order?.orderNumber || order?._id?.slice(-8).toUpperCase() || "—"}
                        </p>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Customer */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs">👤</span>
                        <p className="text-sm font-semibold text-ink-800">{order?.buyerId?.name || "Customer"}</p>
                        {order?.buyerId?.phone && (
                          <a href={`tel:${order.buyerId.phone}`}
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 ml-1">
                            📞 {order.buyerId.phone}
                          </a>
                        )}
                      </div>

                      {/* Address */}
                      {order?.deliveryAddress?.city && (
                        <div className="flex items-start gap-1.5 mt-1">
                          <span className="text-xs mt-0.5">📍</span>
                          <p className="text-xs text-ink-600 leading-snug">
                            {[order.deliveryAddress.street, order.deliveryAddress.area, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.pincode].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-ink-900">₹{order?.totalAmount?.toLocaleString()}</p>
                      <p className="text-xs text-ink-400">{order?.items?.length || 0} item{(order?.items?.length || 0) !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* Latest note */}
                  {a.deliveryNotes?.length > 0 && (
                    <div className="mb-3 p-2.5 bg-sand-50 rounded-xl border border-ink-100">
                      <p className="text-[11px] text-ink-500">
                        💬 {a.deliveryNotes.slice(-1)[0].message}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  {cfg.next.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {cfg.next.map(btn => (
                        <button key={btn.action}
                          onClick={() => handleAction(a._id, btn.action)}
                          disabled={isUpdating}
                          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${btn.color}`}>
                          {isUpdating
                            ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            : null}
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
