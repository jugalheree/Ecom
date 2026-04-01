import { useEffect, useState } from "react";
import { disputeAPI, orderAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

const STATUS_STYLE = {
  OPEN:         "bg-amber-50 text-amber-700 border-amber-200",
  UNDER_REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
  RESOLVED:     "bg-green-50 text-green-700 border-green-200",
  REJECTED:     "bg-red-50 text-red-700 border-red-200",
  REFUNDED:     "bg-teal-50 text-teal-700 border-teal-200",
};

export default function WalletClaims() {
  const showToast = useToastStore(s => s.showToast);
  const [disputes, setDisputes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: "", reason: "", description: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      disputeAPI.getMy().then(r => setDisputes(r.data?.data || [])),
      orderAPI.getMyOrders({ limit: 50 }).then(r => {
        const eligible = (r.data?.data?.orders || []).filter(o =>
          ["DELIVERED","RETURN_REQUESTED","RETURNED"].includes(o.orderStatus)
        );
        setOrders(eligible);
      }),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.orderId || !form.reason) {
      showToast({ message: "Order and reason are required", type: "error" }); return;
    }
    setSubmitting(true);
    try {
      const res = await disputeAPI.raise({
        orderId: form.orderId,
        reason: form.reason,
        description: form.description,
        amount: form.amount ? Number(form.amount) : undefined,
      });
      setDisputes(prev => [res.data?.data, ...prev]);
      setForm({ orderId: "", reason: "", description: "", amount: "" });
      setShowForm(false);
      showToast({ message: "Dispute raised successfully!", type: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to raise dispute", type: "error" });
    } finally { setSubmitting(false); }
  };

  const REASONS = [
    "Item not delivered",
    "Wrong item received",
    "Item damaged/defective",
    "Item not as described",
    "Refund not received",
    "Duplicate charge",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-3xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <p className="section-label">Finance</p>
            <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">Wallet Claims</h1>
            <p className="text-ink-500 text-sm mt-1">Raise and track escrow disputes</p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary px-5 py-2.5 text-sm">
            {showForm ? "✕ Cancel" : "+ Raise Dispute"}
          </button>
        </div>

        {/* Raise dispute form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card p-6 mb-6 border-2 border-brand-200 bg-brand-50 space-y-4">
            <h2 className="font-display font-bold text-ink-900 text-lg">Raise a Dispute</h2>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Select Order *</label>
              <select value={form.orderId} onChange={e => setForm(f => ({...f, orderId: e.target.value}))} className="input-base" required>
                <option value="">Choose a delivered order</option>
                {orders.map(o => (
                  <option key={o._id} value={o._id}>
                    #{o.orderNumber || o._id?.slice(-8)} — ₹{o.totalAmount?.toLocaleString()} ({o.orderStatus})
                  </option>
                ))}
              </select>
              {orders.length === 0 && (
                <p className="text-xs text-ink-400 mt-1">Only delivered orders are eligible for disputes</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Reason *</label>
              <select value={form.reason} onChange={e => setForm(f => ({...f, reason: e.target.value}))} className="input-base" required>
                <option value="">Select a reason</option>
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Description <span className="text-ink-400 font-normal">(optional)</span></label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                placeholder="Describe the issue in detail..." rows={3} className="input-base resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Claim Amount ₹ <span className="text-ink-400 font-normal">(optional — defaults to order total)</span></label>
              <input type="number" min="1" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))}
                placeholder="e.g. 1999" className="input-base" />
            </div>
            <button type="submit" disabled={submitting || !form.orderId || !form.reason}
              className="btn-primary w-full py-3 text-sm disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Dispute"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-16 rounded-xl"/></div>)}</div>
        ) : disputes.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="font-display font-bold text-ink-900 text-lg">No disputes raised</h3>
            <p className="text-ink-500 text-sm mt-2">If you have an issue with an order, raise a dispute above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map(d => (
              <div key={d._id} className="card p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[d.status] || ""}`}>{d.status?.replace(/_/g," ")}</span>
                      <span className="text-xs text-ink-400">#{d._id?.slice(-8).toUpperCase()}</span>
                      <span className="text-xs font-bold text-ink-900">₹{d.amount?.toLocaleString()}</span>
                    </div>
                    <p className="font-semibold text-ink-900 text-sm">{d.reason}</p>
                    {d.description && <p className="text-xs text-ink-500 mt-0.5">{d.description}</p>}
                    <p className="text-xs text-ink-400 mt-1">
                      Order: #{d.orderId?.orderNumber || d.orderId?._id?.slice(-8) || "—"} ·
                      {d.createdAt ? " " + new Date(d.createdAt).toLocaleDateString("en-IN") : ""}
                    </p>
                  </div>
                </div>
                {d.resolution && (
                  <div className="mt-3 pt-3 border-t border-ink-100">
                    <p className="text-xs font-semibold text-green-700">Admin Resolution:</p>
                    <p className="text-sm text-ink-600 mt-0.5">{d.resolution}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
