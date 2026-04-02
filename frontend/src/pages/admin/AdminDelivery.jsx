import { useEffect, useState, useCallback } from "react";
import { assignmentAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";
import api from "../../services/api";

const STATUS_STYLE = {
  ASSIGNED:         "bg-amber-50 text-amber-700 border-amber-200",
  ACCEPTED:         "bg-blue-50 text-blue-700 border-blue-200",
  PICKED_UP:        "bg-indigo-50 text-indigo-700 border-indigo-200",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700 border-orange-200",
  DELIVERED:        "bg-green-50 text-green-700 border-green-200",
  FAILED:           "bg-red-50 text-red-700 border-red-200",
  REASSIGNED:       "bg-ink-50 text-ink-400 border-ink-200",
};

export default function AdminDelivery() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToastStore(s => s.showToast);

  const load = useCallback(() => {
    setLoading(true);
    assignmentAPI.getAll({ limit: 100 })
      .then(r => setAssignments(r.data?.data?.assignments || []))
      .catch(() => showToast({ message: "Failed to load assignments", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const summary = {
    assigned: assignments.filter(a => a.status === "ASSIGNED").length,
    inTransit: assignments.filter(a => ["ACCEPTED","PICKED_UP","OUT_FOR_DELIVERY"].includes(a.status)).length,
    delivered: assignments.filter(a => a.status === "DELIVERED").length,
    failed: assignments.filter(a => a.status === "FAILED").length,
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Admin</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Delivery Overview</h1>
        <p className="text-ink-400 text-sm mt-0.5">Delivery is managed by vendors — this is a read-only overview</p>
      </div>

      {/* Info banner */}
      <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl mb-6 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🚚</span>
        <div>
          <p className="text-sm font-semibold text-blue-800 mb-1">Vendor-Managed Delivery</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            Delivery staff are provided and managed by individual vendors. Each vendor can add their own delivery team and assign orders to them directly from their dashboard. This page shows a platform-wide view of all active assignments.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Assigned",       value: summary.assigned,   icon: "📋", color: "text-amber-600" },
          { label: "In Transit",     value: summary.inTransit,  icon: "🚚", color: "text-blue-600" },
          { label: "Delivered",      value: summary.delivered,  icon: "✅", color: "text-green-600" },
          { label: "Failed",         value: summary.failed,     icon: "❌", color: "text-red-600" },
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

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-16 rounded-xl" /></div>)}</div>
      ) : assignments.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="font-display font-bold text-ink-900 text-lg">No assignments yet</p>
          <p className="text-ink-500 text-sm mt-2">Vendor delivery assignments will appear here.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-ink-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Order</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden sm:table-cell">Delivery Person</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Status</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {assignments.map(a => (
                <tr key={a._id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-mono text-sm font-bold text-ink-700">
                      #{a.orderId?.orderNumber || a.orderId?._id?.slice(-8).toUpperCase()}
                    </p>
                    {a.orderId?.totalAmount && <p className="text-xs text-ink-400 mt-0.5">₹{a.orderId.totalAmount?.toLocaleString()}</p>}
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {(a.deliveryPersonId?.name || "?")[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-800">{a.deliveryPersonId?.name || "—"}</p>
                        {a.deliveryPersonId?.phone && <p className="text-xs text-ink-400">{a.deliveryPersonId.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLE[a.status] || "bg-ink-50 text-ink-600 border-ink-200"}`}>
                      {a.status?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-ink-400 text-xs hidden md:table-cell">
                    {a.updatedAt ? new Date(a.updatedAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—"}
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
