import { useEffect, useState, useCallback } from "react";
import { disputeAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

const STATUS_STYLE = {
  OPEN:         "bg-amber-50 text-amber-700 border-amber-200",
  UNDER_REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
  RESOLVED:     "bg-green-50 text-green-700 border-green-200",
  REJECTED:     "bg-red-50 text-red-700 border-red-200",
  REFUNDED:     "bg-teal-50 text-teal-700 border-teal-200",
};

export default function AdminClaims() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [acting, setActing] = useState({});
  const [selected, setSelected] = useState(null);
  const [resolveForm, setResolveForm] = useState({ status: "RESOLVED", resolution: "", adminNote: "" });
  const showToast = useToastStore(s => s.showToast);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (statusFilter) params.status = statusFilter;
    disputeAPI.getAll(params)
      .then(r => {
        setDisputes(r.data?.data?.disputes || []);
        setTotalPages(r.data?.data?.pagination?.totalPages || 1);
      })
      .catch(() => showToast({ message: "Failed to load disputes", type: "error" }))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleResolve = async (id) => {
    if (!resolveForm.status) return;
    setActing(a => ({ ...a, [id]: true }));
    try {
      await disputeAPI.resolve(id, resolveForm);
      showToast({ message: "Dispute updated!", type: "success" });
      setSelected(null);
      load();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed", type: "error" });
    } finally { setActing(a => ({ ...a, [id]: false })); }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Admin</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Wallet Claims & Disputes</h1>
        <p className="text-ink-400 text-sm mt-0.5">Review and resolve buyer disputes</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {["","OPEN","UNDER_REVIEW","RESOLVED","REJECTED","REFUNDED"].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === s ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:border-ink-400"
            }`}>
            {s === "" ? "All" : s.replace(/_/g," ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-14 rounded-xl"/></div>)}</div>
      ) : disputes.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <p className="font-display font-bold text-ink-900 text-lg">No disputes found</p>
          <p className="text-ink-500 text-sm mt-2">Disputes raised by buyers will appear here.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {disputes.map(d => (
              <div key={d._id} className="card p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[d.status] || ""}`}>{d.status?.replace(/_/g," ")}</span>
                      <span className="text-xs text-ink-400">#{d._id?.slice(-8).toUpperCase()}</span>
                    </div>
                    <p className="font-semibold text-ink-900 text-sm">{d.reason}</p>
                    {d.description && <p className="text-xs text-ink-500 mt-0.5">{d.description}</p>}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-ink-500">👤 {d.buyerId?.name || "—"}</span>
                      <span className="text-xs text-ink-500">📦 {d.orderId?.orderNumber || d.orderId?._id?.slice(-8) || "—"}</span>
                      <span className="text-xs font-bold text-ink-900">₹{d.amount?.toLocaleString() || 0}</span>
                    </div>
                    <p className="text-xs text-ink-400 mt-1">{d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-IN") : ""}</p>
                  </div>

                  {!["RESOLVED","REJECTED","REFUNDED"].includes(d.status) && (
                    <button onClick={() => { setSelected(d._id); setResolveForm({ status: "RESOLVED", resolution: "", adminNote: "" }); }}
                      className="btn-primary text-xs px-4 py-2 flex-shrink-0">
                      Resolve
                    </button>
                  )}
                  {d.resolution && (
                    <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2 max-w-xs">
                      ✓ {d.resolution}
                    </p>
                  )}
                </div>

                {/* Resolve form inline */}
                {selected === d._id && (
                  <div className="mt-4 pt-4 border-t border-ink-100 space-y-3">
                    <p className="text-xs font-bold text-ink-500 uppercase tracking-wider">Resolution</p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <select value={resolveForm.status} onChange={e => setResolveForm(f => ({...f, status: e.target.value}))} className="input-base text-sm">
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REFUNDED">Refunded</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                      <input value={resolveForm.resolution} onChange={e => setResolveForm(f => ({...f, resolution: e.target.value}))}
                        placeholder="Resolution note (shown to buyer)" className="input-base text-sm sm:col-span-2" />
                    </div>
                    <input value={resolveForm.adminNote} onChange={e => setResolveForm(f => ({...f, adminNote: e.target.value}))}
                      placeholder="Internal admin note (not shown to buyer)" className="input-base text-sm" />
                    <div className="flex gap-2">
                      <button onClick={() => handleResolve(d._id)} disabled={acting[d._id]}
                        className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
                        {acting[d._id] ? "Saving..." : "Save Resolution"}
                      </button>
                      <button onClick={() => setSelected(null)} className="px-5 py-2 text-sm rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button disabled={page <= 1} onClick={() => setPage(p => p-1)} className="btn-outline py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-ink-600 font-medium px-3">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)} className="btn-outline py-2 px-4 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
