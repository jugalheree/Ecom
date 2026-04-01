import { useEffect, useState, useCallback } from "react";
import { vendorAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

const ACTION_FLOW = [
  { action: "PACK",             label: "Mark Packed",       icon: "📦", nextStatus: "PACKED",          color: "bg-indigo-600" },
  { action: "PICKUP",           label: "Mark Picked Up",    icon: "🚛", nextStatus: "PICKED_UP",        color: "bg-blue-600" },
  { action: "SHIP",             label: "Mark Shipped",      icon: "🚚", nextStatus: "SHIPPED",          color: "bg-purple-600" },
  { action: "OUT_FOR_DELIVERY", label: "Out for Delivery",  icon: "📍", nextStatus: "OUT_FOR_DELIVERY", color: "bg-orange-500" },
  { action: "DELIVER",          label: "Mark Delivered",    icon: "✅", nextStatus: "DELIVERED",        color: "bg-green-600" },
];
const STATUS_FLOW = ["PENDING","CONFIRMED","PROCESSING","PACKED","PICKED_UP","SHIPPED","OUT_FOR_DELIVERY","DELIVERED"];

function getNextAction(itemStatus) {
  const idx = STATUS_FLOW.indexOf(itemStatus);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return ACTION_FLOW.find(a => a.nextStatus === STATUS_FLOW[idx + 1]) || null;
}

const STATUS_BADGE = {
  PENDING:          "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED:        "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING:       "bg-indigo-50 text-indigo-700 border-indigo-200",
  PACKED:           "bg-indigo-50 text-indigo-700 border-indigo-200",
  PICKED_UP:        "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED:          "bg-purple-50 text-purple-700 border-purple-200",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700 border-orange-200",
  DELIVERED:        "bg-green-50 text-green-700 border-green-200",
  CANCELLED:        "bg-red-50 text-red-700 border-red-200",
};

function AssignModal({ order, staff, onAssign, onClose }) {
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const showToast = useToastStore(s => s.showToast);
  const activeStaff = staff.filter(s => s.isActive);

  const handleAssign = async () => {
    if (!selected) { showToast({ message: "Select a staff member", type: "error" }); return; }
    setSaving(true);
    try { await onAssign(order._id, selected); onClose(); }
    catch { /* parent shows error */ }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-ink-100">
          <div>
            <h3 className="font-display font-bold text-ink-900">Assign Delivery Staff</h3>
            <p className="text-xs text-ink-500 mt-0.5">Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()} · ₹{order.totalAmount?.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-ink-50 text-ink-400 text-lg">✕</button>
        </div>

        {order.deliveryAddress?.city && (
          <div className="mx-5 mt-4 p-3 bg-sand-50 rounded-xl border border-ink-100 flex items-start gap-2">
            <span className="text-sm">📍</span>
            <div>
              <p className="text-xs font-semibold text-ink-700">{order.deliveryAddress.name}</p>
              <p className="text-xs text-ink-500">{[order.deliveryAddress.street, order.deliveryAddress.area, order.deliveryAddress.city, order.deliveryAddress.pincode].filter(Boolean).join(", ")}</p>
              {order.deliveryAddress.phone && <p className="text-xs text-ink-500 mt-0.5">📞 {order.deliveryAddress.phone}</p>}
            </div>
          </div>
        )}

        <div className="p-5 space-y-2 max-h-60 overflow-y-auto">
          {activeStaff.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-ink-500">No active delivery staff.</p>
              <p className="text-xs text-ink-400 mt-1">Go to the Delivery Staff tab to add members.</p>
            </div>
          ) : activeStaff.map(s => (
            <label key={s._id}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selected === s._id ? "border-brand-500 bg-brand-50" : "border-ink-200 hover:border-ink-300"}`}>
              <input type="radio" name="staff" value={s._id} checked={selected === s._id} onChange={() => setSelected(s._id)} className="sr-only" />
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold flex-shrink-0">{s.name?.[0]?.toUpperCase()}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-900">{s.name}</p>
                <p className="text-xs text-ink-400">{s.phone}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${(s.activeDeliveries || 0) === 0 ? "bg-green-50 text-green-700" : (s.activeDeliveries || 0) < 3 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"}`}>
                {s.activeDeliveries || 0} active
              </span>
            </label>
          ))}
        </div>

        <div className="flex gap-3 p-5 border-t border-ink-100">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-ink-200 text-sm font-semibold text-ink-600 hover:border-ink-400">Cancel</button>
          <button onClick={handleAssign} disabled={saving || !selected || activeStaff.length === 0} className="flex-1 btn-primary py-3 text-sm disabled:opacity-50">
            {saving ? "Assigning…" : "Assign →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddStaffModal({ onAdded, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const showToast = useToastStore(s => s.showToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { showToast({ message: "Name and phone required", type: "error" }); return; }
    if (!/^\d{10}$/.test(form.phone)) { showToast({ message: "Enter valid 10-digit phone", type: "error" }); return; }
    setSaving(true);
    try {
      await vendorAPI.addDeliveryStaff(form);
      showToast({ message: "Staff member added!", type: "success" });
      onAdded(); onClose();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to add staff", type: "error" });
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-ink-900 text-lg">Add Delivery Staff</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-ink-50 text-ink-400 text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Full Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Ramesh Kumar" className="input-base" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Phone Number *</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile number" className="input-base" type="tel" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-ink-200 text-sm font-semibold text-ink-600 hover:border-ink-400">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 text-sm disabled:opacity-50">{saving ? "Adding…" : "Add Staff"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderCard({ order, staff, assignedStaffMap, onAssign, onAction, actionLoading }) {
  const [expanded, setExpanded] = useState(false);
  const assignedStaff = assignedStaffMap[order._id];

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-sand-50 transition-colors gap-3" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex-shrink-0">
            <p className="text-[10px] text-ink-400 font-medium uppercase tracking-wide">Order</p>
            <p className="text-sm font-bold text-ink-900 font-mono">#{order.orderNumber || order._id?.slice(-8).toUpperCase()}</p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-ink-100 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-800 truncate">{order.buyerName || "Customer"}</p>
            {order.deliveryAddress?.city && (
              <p className="text-xs text-ink-400 truncate">📍 {[order.deliveryAddress.area, order.deliveryAddress.city].filter(Boolean).join(", ")}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGE[order.orderStatus] || "bg-ink-50 text-ink-600 border-ink-200"}`}>
            {order.orderStatus?.replace(/_/g, " ")}
          </span>
          <span className="font-bold text-ink-900 text-sm">₹{order.totalAmount?.toLocaleString()}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-ink-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-ink-100">
          {order.deliveryAddress?.city && (
            <div className="px-5 py-3 bg-sand-50 border-b border-ink-100 flex items-start gap-2">
              <span className="text-sm flex-shrink-0">📍</span>
              <div>
                <p className="text-xs font-semibold text-ink-700">{order.deliveryAddress.name}</p>
                <p className="text-xs text-ink-500">{[order.deliveryAddress.street, order.deliveryAddress.area, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.pincode].filter(Boolean).join(", ")}</p>
                {order.deliveryAddress.phone && <p className="text-xs text-ink-500 mt-0.5">📞 {order.deliveryAddress.phone}</p>}
              </div>
            </div>
          )}

          <div className="px-5 py-3 border-b border-ink-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">👤</span>
              {assignedStaff ? (
                <span className="text-sm text-ink-700 font-medium">
                  Assigned to <strong>{assignedStaff.name}</strong>
                  {assignedStaff.phone && <span className="text-ink-400 font-normal"> · {assignedStaff.phone}</span>}
                </span>
              ) : (
                <span className="text-sm text-ink-400">No staff assigned yet</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {assignedStaff?.assignmentStatus && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  assignedStaff.assignmentStatus === "DELIVERED" ? "bg-green-50 text-green-700 border-green-200" :
                  assignedStaff.assignmentStatus === "OUT_FOR_DELIVERY" ? "bg-orange-50 text-orange-700 border-orange-200" :
                  assignedStaff.assignmentStatus === "PICKED_UP" ? "bg-blue-50 text-blue-700 border-blue-200" :
                  assignedStaff.assignmentStatus === "ACCEPTED" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {assignedStaff.assignmentStatus.replace(/_/g," ")}
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onAssign(order); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${assignedStaff ? "border-ink-200 text-ink-600 hover:border-ink-400 bg-white" : "border-brand-400 text-brand-700 bg-brand-50 hover:bg-brand-100"}`}>
                {assignedStaff ? "Reassign" : "Assign Staff"}
              </button>
            </div>
          </div>

          {order.items?.map((item, i) => {
            const productId = item.productId?._id || item.productId;
            const title = item.productId?.title || `Item ${i + 1}`;
            const key = `${order._id}-${productId}`;
            const next = getNextAction(item.status || "CONFIRMED");

            return (
              <div key={i} className="px-5 py-4 border-b border-ink-100 last:border-0">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center flex-shrink-0 text-xl overflow-hidden">
                      {item.productId?.primaryImage ? <img src={item.productId.primaryImage} alt="" className="w-full h-full object-cover rounded-xl" /> : "📦"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">{title}</p>
                      <p className="text-xs text-ink-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[item.status] || "bg-ink-50 text-ink-600 border-ink-200"}`}>
                      {(item.status || "PENDING").replace(/_/g, " ")}
                    </span>
                    {next && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onAction(order._id, productId, next.action); }}
                        disabled={!!actionLoading[key]}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all disabled:opacity-50 ${next.color}`}>
                        {actionLoading[key] ? "…" : `${next.icon} ${next.label}`}
                      </button>
                    )}
                    {item.status === "DELIVERED" && (
                      <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">✅ Done</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function VendorDelivery() {
  const showToast = useToastStore(s => s.showToast);
  const [tab, setTab] = useState("active");
  const [staff, setStaff] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null);
  const [addStaffModal, setAddStaffModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [assignedStaffMap, setAssignedStaffMap] = useState({});
  const [deliveryAssignments, setDeliveryAssignments] = useState([]);

  const loadStaff = useCallback(() =>
    vendorAPI.getDeliveryStaff().then(r => setStaff(r.data?.data || [])).catch(() => {}), []);

  const loadOrders = useCallback(async () => {
    try {
      const res = await vendorAPI.getOrders({ limit: 100 });
      const all = res.data?.data?.orders || [];
      setOrders(all.filter(o => !["CANCELLED", "REFUNDED"].includes(o.orderStatus)));
    } catch { /* silent */ }
  }, []);

  const loadAssignments = useCallback(async () => {
    try {
      const res = await vendorAPI.getDeliveryAssignments();
      const assignments = res.data?.data || [];
      setDeliveryAssignments(assignments);
      const map = {};
      assignments.forEach(a => {
        if (a.status === "REASSIGNED") return;
        const ordId = a.orderId?._id || a.orderId;
        if (!ordId) return;
        const person = a.deliveryPersonId;
        map[ordId] = {
          staffId: person?._id || person,
          name: person?.name || a.vendorStaffSnapshot?.name || "Staff",
          phone: person?.phone || a.vendorStaffSnapshot?.phone || "",
          assignmentStatus: a.status,
        };
      });
      setAssignedStaffMap(map);
    } catch { /* silent */ }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([loadStaff(), loadOrders(), loadAssignments()]);
    setLoading(false);
  }, [loadStaff, loadOrders, loadAssignments]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (orderId, productId, action) => {
    const key = `${orderId}-${productId}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      await vendorAPI.shipOrder(orderId, { productId, action });
      showToast({ message: "Status updated!", type: "success" });
      await loadOrders();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to update status", type: "error" });
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleAssign = async (orderId, staffId) => {
    try {
      await vendorAPI.assignDelivery({ orderId, staffId });
      const person = staff.find(s => s._id === staffId);
      setAssignedStaffMap(prev => ({ ...prev, [orderId]: { staffId, name: person?.name, phone: person?.phone, assignmentStatus: "ASSIGNED" } }));
      // Refresh staff to update activeDeliveries count
      await loadStaff();
      showToast({ message: `Assigned to ${person?.name || "staff"}!`, type: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Assignment failed", type: "error" });
      throw err;
    }
  };

  const activeOrders = orders.filter(o =>
    ["CONFIRMED","PROCESSING","PACKED","PICKED_UP","SHIPPED","OUT_FOR_DELIVERY"].includes(o.orderStatus)
  );
  const needsAssignment = activeOrders.filter(o =>
    !assignedStaffMap[o._id] && ["CONFIRMED","PROCESSING","PACKED"].includes(o.orderStatus)
  );
  const inTransit = activeOrders.filter(o => ["SHIPPED","OUT_FOR_DELIVERY"].includes(o.orderStatus));
  const deliveredOrders = orders.filter(o => o.orderStatus === "DELIVERED");
  const tabOrders = tab === "active" ? activeOrders : deliveredOrders;

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Delivery Management</h1>
        <p className="text-ink-400 text-sm mt-0.5">Manage your delivery team and track order fulfillment</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Delivery Staff", value: staff.filter(s => s.isActive).length, icon: "👤", color: "text-brand-600" },
          { label: "Needs Assignment", value: needsAssignment.length, icon: "⚠️", color: "text-red-600" },
          { label: "In Transit", value: inTransit.length, icon: "🚚", color: "text-blue-600" },
          { label: "Delivered", value: deliveredOrders.length, icon: "✅", color: "text-green-600" },
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

      <div className="flex gap-2 mb-5 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {[
            ["active",      "Active Orders",    activeOrders.length],
            ["delivered",   "Delivered",        deliveredOrders.length],
            ["assignments", "Assignments",       deliveryAssignments.filter(a=>a.status!=="REASSIGNED").length],
            ["staff",       "Delivery Staff",   staff.length],
          ].map(([t, label, count]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${tab === t ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:border-ink-400"}`}>
              {label}
              {count > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t ? "bg-white/20 text-white" : "bg-ink-100 text-ink-600"}`}>{count}</span>}
              {t === "active" && needsAssignment.length > 0 && tab !== "active" && <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />}
            </button>
          ))}
        </div>
        {tab === "staff" && (
          <button onClick={() => setAddStaffModal(true)} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Staff
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-16 rounded-xl" /></div>)}</div>
      ) : tab === "assignments" ? (
        <div className="space-y-3">
          {deliveryAssignments.filter(a => a.status !== "REASSIGNED").length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="font-display font-bold text-ink-900 text-lg">No assignments yet</p>
              <p className="text-ink-500 text-sm mt-2">Assign staff to orders from the Active Orders tab.</p>
            </div>
          ) : deliveryAssignments.filter(a => a.status !== "REASSIGNED").map(a => {
            const order = a.orderId;
            const person = a.deliveryPersonId;
            const staffName = person?.name || a.vendorStaffSnapshot?.name || "Staff";
            const staffPhone = person?.phone || a.vendorStaffSnapshot?.phone || "";
            const statusColors = {
              ASSIGNED: "bg-amber-50 text-amber-700 border-amber-200",
              ACCEPTED: "bg-blue-50 text-blue-700 border-blue-200",
              PICKED_UP: "bg-indigo-50 text-indigo-700 border-indigo-200",
              OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700 border-orange-200",
              DELIVERED: "bg-green-50 text-green-700 border-green-200",
              FAILED: "bg-red-50 text-red-700 border-red-200",
            };
            return (
              <div key={a._id} className="card p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <p className="font-mono text-sm font-bold text-ink-800">
                        #{order?.orderNumber || (typeof order === "string" ? order.slice(-8).toUpperCase() : "—")}
                      </p>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors[a.status] || "bg-ink-50 text-ink-600 border-ink-200"}`}>
                        {a.status?.replace(/_/g," ")}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>👤</span>
                        <div>
                          <p className="font-semibold text-ink-700">{staffName}</p>
                          {staffPhone && <p className="text-ink-400">{staffPhone}</p>}
                        </div>
                      </div>
                      {order?.deliveryAddress?.city && (
                        <div className="flex items-start gap-1.5">
                          <span className="mt-0.5">📍</span>
                          <p className="text-ink-500 leading-snug">
                            {[order.deliveryAddress.area, order.deliveryAddress.city].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Delivery notes */}
                    {a.deliveryNotes?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {a.deliveryNotes.slice(-3).map((note, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] text-ink-500">
                            <span className="text-ink-300 flex-shrink-0">💬</span>
                            <p>{note.message}</p>
                            <span className="text-ink-300 ml-auto whitespace-nowrap">{note.timestamp ? new Date(note.timestamp).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"}) : ""}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-ink-900">₹{order?.totalAmount?.toLocaleString()}</p>
                    <p className="text-[10px] text-ink-400">{new Date(a.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : tab === "staff" ? (
        <div>
          {staff.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-5xl mb-4">👤</div>
              <p className="font-display font-bold text-ink-900 text-lg">No delivery staff yet</p>
              <p className="text-ink-500 text-sm mt-2 mb-6">Add your team members to start assigning orders.</p>
              <button onClick={() => setAddStaffModal(true)} className="btn-primary px-6 py-3 text-sm">+ Add First Staff Member</button>
            </div>
          ) : (
            <div className="space-y-3">
              {staff.map(s => (
                <div key={s._id} className={`card p-5 ${!s.isActive ? "opacity-60" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {s.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-ink-900">{s.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.isActive ? "bg-green-50 text-green-700" : "bg-ink-100 text-ink-500"}`}>{s.isActive ? "Active" : "Inactive"}</span>
                        {(s.activeDeliveries || 0) > 0 && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">{s.activeDeliveries} active</span>}
                      </div>
                      <p className="text-sm text-ink-500 mt-0.5">{s.phone}</p>
                      <p className="text-xs text-ink-400">{s.totalDeliveries || 0} total deliveries</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={async () => {
                        try {
                          await vendorAPI.updateDeliveryStaff(s._id, { isActive: !s.isActive });
                          setStaff(prev => prev.map(m => m._id === s._id ? { ...m, isActive: !s.isActive } : m));
                          showToast({ message: `Staff ${!s.isActive ? "activated" : "deactivated"}`, type: "info" });
                        } catch { showToast({ message: "Failed to update", type: "error" }); }
                      }} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${s.isActive ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"}`}>
                        {s.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={async () => {
                        if (!confirm(`Remove "${s.name}"?`)) return;
                        try {
                          await vendorAPI.deleteDeliveryStaff(s._id);
                          setStaff(prev => prev.filter(m => m._id !== s._id));
                          showToast({ message: "Staff removed", type: "info" });
                        } catch { showToast({ message: "Failed to remove", type: "error" }); }
                      }} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tabOrders.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">{tab === "active" ? "🎉" : "📦"}</div>
          <p className="font-display font-bold text-ink-900 text-lg">{tab === "active" ? "No active orders" : "No delivered orders yet"}</p>
          <p className="text-ink-500 text-sm mt-2">{tab === "active" ? "Orders appear here once confirmed and paid." : "Completed deliveries show up here."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {needsAssignment.length > 0 && tab === "active" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm">
              <span>⚠️</span>
              <span className="text-red-700 font-semibold">{needsAssignment.length} order{needsAssignment.length !== 1 ? "s" : ""} need{needsAssignment.length === 1 ? "s" : ""} a staff assignment.</span>
            </div>
          )}
          {tabOrders.map(order => (
            <OrderCard key={order._id} order={order} staff={staff} assignedStaffMap={assignedStaffMap}
              onAssign={o => setAssignModal(o)} onAction={handleAction} actionLoading={actionLoading} />
          ))}
        </div>
      )}

      {assignModal && <AssignModal order={assignModal} staff={staff} onAssign={handleAssign} onClose={() => setAssignModal(null)} />}
      {addStaffModal && <AddStaffModal onAdded={loadStaff} onClose={() => setAddStaffModal(false)} />}
    </div>
  );
}