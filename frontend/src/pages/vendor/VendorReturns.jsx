import { useEffect, useState, useCallback } from "react";
import { vendorAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

const STATUS_STYLE = {
  REQUESTED: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED:  "bg-blue-50 text-blue-700 border-blue-200",
  REJECTED:  "bg-red-50 text-red-700 border-red-200",
  PICKED_UP: "bg-indigo-50 text-indigo-700 border-indigo-200",
  RECEIVED:  "bg-purple-50 text-purple-700 border-purple-200",
  REFUNDED:  "bg-green-50 text-green-700 border-green-200",
};

const STATUS_STEPS = ["REQUESTED","APPROVED","PICKED_UP","RECEIVED","REFUNDED"];

// ── Return Detail / Action Modal ───────────────────────────────────────────
function ReturnModal({ ret, onClose, onRefresh }) {
  const [acting, setActing] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [refundAmount, setRefundAmount] = useState(ret.refundAmount || "");
  const showToast = useToastStore(s => s.showToast);

  const act = async (fn, successMsg) => {
    setActing(true);
    try {
      await fn();
      showToast({ message: successMsg, type: "success" });
      onRefresh();
      onClose();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Action failed", type: "error" });
    } finally { setActing(false); }
  };

  const currentStepIdx = STATUS_STEPS.indexOf(ret.status);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink-100">
          <div>
            <h2 className="text-lg font-display font-bold text-ink-900">Return Request</h2>
            <p className="text-sm text-ink-500 mt-0.5">Order #{ret.orderId?.orderNumber || ret.orderId?._id?.slice(-8)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[ret.status] || "bg-ink-50 text-ink-600 border-ink-200"}`}>
              {ret.status}
            </span>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-ink-50 text-ink-400 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Progress steps */}
          <div className="flex items-center gap-1">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center flex-1`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i <= currentStepIdx ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-400"
                  }`}>
                    {i <= currentStepIdx ? "✓" : i + 1}
                  </div>
                  <p className={`text-[9px] font-semibold mt-1 text-center leading-tight ${i <= currentStepIdx ? "text-brand-700" : "text-ink-400"}`}>
                    {step.replace(/_/g, " ")}
                  </p>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mb-4 ${i < currentStepIdx ? "bg-brand-400" : "bg-ink-100"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Product info */}
          <div className="flex items-center gap-3 p-4 bg-sand-50 rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
              {ret.productId?.primaryImage
                ? <img src={ret.productId.primaryImage} alt="" className="w-full h-full object-cover rounded-xl" />
                : "📦"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink-900 truncate">{ret.productId?.title || "Product"}</p>
              <p className="text-xs text-ink-500">Qty: {ret.quantity} · ₹{(ret.productId?.price * ret.quantity)?.toLocaleString() || "—"}</p>
            </div>
          </div>

          {/* Buyer info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-sand-50 rounded-xl p-3">
              <p className="text-xs text-ink-400 font-medium mb-0.5">Buyer</p>
              <p className="text-sm font-semibold text-ink-900">{ret.buyerId?.name || "—"}</p>
              <p className="text-xs text-ink-400">{ret.buyerId?.phone || ret.buyerId?.email || ""}</p>
            </div>
            <div className="bg-sand-50 rounded-xl p-3">
              <p className="text-xs text-ink-400 font-medium mb-0.5">Requested On</p>
              <p className="text-sm font-semibold text-ink-900">
                {ret.requestedAt ? new Date(ret.requestedAt).toLocaleDateString("en-IN") : "—"}
              </p>
            </div>
          </div>

          {/* Return reason */}
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Return Reason</p>
            <p className="text-sm font-semibold text-ink-900">{ret.reason}</p>
            {ret.description && <p className="text-xs text-ink-600 mt-1 leading-relaxed">{ret.description}</p>}
          </div>

          {/* Return images */}
          {ret.images?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Buyer Uploaded Images</p>
              <div className="flex gap-2 flex-wrap">
                {ret.images.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                    <img src={img} alt="" className="w-20 h-20 object-cover rounded-xl border border-ink-200 hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Vendor remark (if already actioned) */}
          {ret.vendorRemark && (
            <div className="p-3 bg-ink-50 rounded-xl border border-ink-100">
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-1">Your Remark</p>
              <p className="text-sm text-ink-700">{ret.vendorRemark}</p>
            </div>
          )}

          {/* ── Action buttons based on current status ── */}
          {ret.status === "REQUESTED" && (
            <div className="space-y-3 pt-2 border-t border-ink-100">
              <p className="text-sm font-semibold text-ink-700">Review this return request:</p>

              {!showRejectInput ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => act(() => vendorAPI.reviewReturn(ret._id, { action: "APPROVE" }), "Return approved! You can now schedule pickup.")}
                    disabled={acting}
                    className="flex-1 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all disabled:opacity-50">
                    ✓ Approve Return
                  </button>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={acting}
                    className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 border-2 border-red-200 text-sm font-semibold hover:bg-red-100 transition-all disabled:opacity-50">
                    ✕ Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-1.5">Rejection Reason <span className="text-red-400">*</span></label>
                    <textarea
                      value={rejectRemark}
                      onChange={e => setRejectRemark(e.target.value)}
                      placeholder="Explain why you're rejecting this return request…"
                      rows={3}
                      className="input-base resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowRejectInput(false)} className="flex-1 py-2.5 rounded-xl border-2 border-ink-200 text-sm font-semibold text-ink-600 hover:border-ink-400">
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!rejectRemark.trim()) { showToast({ message: "Rejection reason is required", type: "error" }); return; }
                        act(() => vendorAPI.reviewReturn(ret._id, { action: "REJECT", remark: rejectRemark }), "Return request rejected.");
                      }}
                      disabled={acting || !rejectRemark.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {ret.status === "APPROVED" && (
            <div className="pt-2 border-t border-ink-100">
              <p className="text-sm font-semibold text-ink-700 mb-3">Arrange pickup from buyer's address, then mark it picked up:</p>
              <button
                onClick={() => act(() => vendorAPI.markReturnPickedUp(ret._id), "Marked as picked up!")}
                disabled={acting}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50">
                🚛 Mark Picked Up
              </button>
            </div>
          )}

          {ret.status === "PICKED_UP" && (
            <div className="pt-2 border-t border-ink-100">
              <p className="text-sm font-semibold text-ink-700 mb-3">Confirm you have received the returned item:</p>
              <button
                onClick={() => act(() => vendorAPI.markReturnReceived(ret._id), "Item received! Now process the refund.")}
                disabled={acting}
                className="w-full py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all disabled:opacity-50">
                📦 Mark Received
              </button>
            </div>
          )}

          {ret.status === "RECEIVED" && (
            <div className="pt-2 border-t border-ink-100 space-y-3">
              <p className="text-sm font-semibold text-ink-700">Process refund to buyer's wallet:</p>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Refund Amount (₹) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                  placeholder={`Max: ₹${(ret.productId?.price * ret.quantity)?.toLocaleString() || "—"}`}
                  className="input-base"
                />
              </div>
              <button
                onClick={() => {
                  if (!refundAmount) { showToast({ message: "Enter refund amount", type: "error" }); return; }
                  act(() => vendorAPI.refundReturn(ret._id, { refundAmount: Number(refundAmount), refundMethod: "WALLET" }), "Refund processed! Buyer's wallet has been credited.");
                }}
                disabled={acting || !refundAmount}
                className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all disabled:opacity-50">
                💰 Process Refund
              </button>
            </div>
          )}

          {ret.status === "REFUNDED" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm font-bold text-green-800">Refund Completed</p>
                <p className="text-xs text-green-700 mt-0.5">
                  ₹{ret.refundAmount?.toLocaleString()} refunded to buyer's wallet on{" "}
                  {ret.refundedAt ? new Date(ret.refundedAt).toLocaleDateString("en-IN") : "—"}
                </p>
              </div>
            </div>
          )}

          {ret.status === "REJECTED" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <span className="text-2xl">✕</span>
              <div>
                <p className="text-sm font-bold text-red-800">Return Rejected</p>
                {ret.vendorRemark && <p className="text-xs text-red-700 mt-0.5">{ret.vendorRemark}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function VendorReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const showToast = useToastStore(s => s.showToast);

  const load = useCallback(() => {
    setLoading(true);
    const params = filter !== "ALL" ? { status: filter } : {};
    vendorAPI.getReturns(params)
      .then(r => setReturns(r.data?.data || []))
      .catch(() => showToast({ message: "Failed to load returns", type: "error" }))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const FILTERS = ["ALL","REQUESTED","APPROVED","PICKED_UP","RECEIVED","REFUNDED","REJECTED"];

  const summary = {
    requested: returns.filter(r => r.status === "REQUESTED").length,
    approved:  returns.filter(r => r.status === "APPROVED").length,
    received:  returns.filter(r => r.status === "RECEIVED").length,
    refunded:  returns.filter(r => r.status === "REFUNDED").length,
  };

  const filtered = filter === "ALL" ? returns : returns.filter(r => r.status === filter);

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Return Requests</h1>
        <p className="text-ink-400 text-sm mt-0.5">Review and manage product returns from buyers</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Needs Review", value: summary.requested, icon: "⏳", color: "text-amber-600" },
          { label: "Approved",     value: summary.approved,  icon: "✅", color: "text-blue-600" },
          { label: "To Refund",    value: summary.received,  icon: "📦", color: "text-purple-600" },
          { label: "Refunded",     value: summary.refunded,  icon: "💰", color: "text-green-600" },
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
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              filter === f ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:border-ink-400"
            }`}>
            {f === "ALL" ? "All Returns" : f.replace(/_/g, " ")}
            {f === "REQUESTED" && summary.requested > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {summary.requested}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-16 rounded-xl" /></div>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">↩️</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No return requests</h3>
          <p className="text-ink-500 text-sm mt-2">
            {filter === "ALL" ? "When buyers request returns, they'll appear here." : `No ${filter} returns.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ret => (
            <div key={ret._id}
              onClick={() => setSelectedReturn(ret)}
              className="card p-5 cursor-pointer hover:border-brand-200 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                    {ret.productId?.primaryImage
                      ? <img src={ret.productId.primaryImage} alt="" className="w-full h-full object-cover rounded-xl" />
                      : "📦"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900 truncate group-hover:text-brand-700 transition-colors">
                      {ret.productId?.title || "Product"}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Order #{ret.orderId?.orderNumber || ret.orderId?._id?.slice(-8)} · Qty: {ret.quantity}
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5 italic truncate">{ret.reason}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[ret.status] || "bg-ink-50 text-ink-600 border-ink-200"}`}>
                    {ret.status}
                  </span>
                  <p className="text-xs text-ink-400">
                    {ret.requestedAt ? new Date(ret.requestedAt).toLocaleDateString("en-IN") : ""}
                  </p>
                  {ret.buyerId?.name && (
                    <p className="text-xs text-ink-500 font-medium">{ret.buyerId.name}</p>
                  )}
                </div>
              </div>

              {/* Urgent action hint */}
              {ret.status === "REQUESTED" && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  <span>⚠️</span> Action required — approve or reject this return
                </div>
              )}
              {ret.status === "RECEIVED" && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  <span>💰</span> Item received — process refund to complete return
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedReturn && (
        <ReturnModal
          ret={selectedReturn}
          onClose={() => setSelectedReturn(null)}
          onRefresh={load}
        />
      )}
    </div>
  );
}