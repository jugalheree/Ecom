import { useEffect, useState, useCallback } from "react";
import { adminAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";
import { ReasonModal } from "../../components/ui/ConfirmModal";

// ── Vendor Detail Modal ────────────────────────────────────────────────────
function VendorDetailModal({ vendorId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    adminAPI.getVendorDetails(vendorId)
      .then((r) => setData(r.data?.data))
      .catch(() => showToast({ message: "Failed to load vendor details", type: "error" }))
      .finally(() => setLoading(false));
  }, [vendorId]);

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4">
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-8 rounded-xl" />)}</div>
      </div>
    </div>
  );
  if (!data) return null;

  const { vendor, verification, products, recentOrders, stats } = data;
  const user = vendor?.userId;

  const VSTATUS = {
    PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
    APPROVED: "bg-green-50 text-green-700 border border-green-200",
    REJECTED: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-ink-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-2xl font-bold">
              {vendor.shopName?.[0]?.toUpperCase() || "V"}
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-ink-900">{vendor.shopName || "—"}</h2>
              <p className="text-sm text-ink-500">{vendor.businessType || "—"}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {verification?.status && (
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${VSTATUS[verification.status] || "bg-ink-50 text-ink-600"}`}>
                    {verification.status}
                  </span>
                )}
                {user?.isBlocked && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700">Blocked</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-ink-50 text-ink-400 hover:text-ink-700 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-3">Owner Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Name", value: user?.name || "—" },
                { label: "Email", value: user?.email || "—" },
                { label: "Phone", value: user?.phone || "—" },
                { label: "Joined", value: vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString("en-IN") : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-sand-50 rounded-xl p-3">
                  <p className="text-xs text-ink-400 font-medium mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-ink-900 truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-3">Business Info</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "GST Number", value: vendor.gstNumber || "—" },
                { label: "PAN Number", value: vendor.panNumber || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-sand-50 rounded-xl p-3">
                  <p className="text-xs text-ink-400 font-medium mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-ink-900">{value}</p>
                </div>
              ))}
            </div>
            {verification?.adminRemark && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 font-semibold">Admin Remark:</p>
                <p className="text-sm text-amber-800 mt-0.5">{verification.adminRemark}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-3">Performance</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="card p-4 text-center">
                <p className="text-2xl font-display font-bold text-ink-900">{stats?.totalProducts ?? 0}</p>
                <p className="text-xs text-ink-400 mt-0.5">Products</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-display font-bold text-ink-900">{stats?.totalOrders ?? 0}</p>
                <p className="text-xs text-ink-400 mt-0.5">Orders</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xl font-display font-bold text-ink-900">₹{(stats?.totalRevenue ?? 0).toLocaleString()}</p>
                <p className="text-xs text-ink-400 mt-0.5">Revenue</p>
              </div>
            </div>
          </div>

          {products?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-3">Recent Products</h3>
              <div className="space-y-2">
                {products.slice(0, 5).map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-sm bg-sand-50 rounded-xl px-4 py-2.5">
                    <span className="text-ink-800 font-medium truncate flex-1">{p.title}</span>
                    <span className="text-ink-500 ml-3">₹{p.price?.toLocaleString()}</span>
                    <span className={`ml-3 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.approvalStatus === "APPROVED" ? "bg-green-50 text-green-700" :
                      p.approvalStatus === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    }`}>{p.approvalStatus}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentOrders?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-3">Recent Orders</h3>
              <div className="space-y-2">
                {recentOrders.slice(0, 5).map((o) => (
                  <div key={o._id} className="flex items-center justify-between text-sm bg-sand-50 rounded-xl px-4 py-2.5">
                    <span className="font-mono text-xs text-ink-500">#{o.orderNumber || o._id?.slice(-8)}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      o.orderStatus === "DELIVERED" ? "bg-green-50 text-green-700" :
                      o.orderStatus === "CANCELLED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    }`}>{o.orderStatus?.replace(/_/g, " ")}</span>
                    <span className="font-semibold text-ink-900">₹{o.totalAmount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function AdminVendors() {
  const [tab, setTab] = useState("pending");
  const [pendingVendors, setPendingVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState({});
  const [rejectModal, setRejectModal] = useState(null);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [search, setSearch] = useState("");
  const [allPage, setAllPage] = useState(1);
  const [allTotalPages, setAllTotalPages] = useState(1);
  const [allTotal, setAllTotal] = useState(0);
  const showToast = useToastStore((s) => s.showToast);

  const loadPending = useCallback(() => {
    setLoading(true);
    adminAPI.getPendingVendors()
      .then((r) => {
        const d = r.data?.data;
        setPendingVendors(Array.isArray(d) ? d : d?.vendors || []);
      })
      .catch(() => showToast({ message: "Failed to load vendors", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const loadAll = useCallback(() => {
    setLoading(true);
    const params = { page: allPage, limit: 20 };
    if (search) params.search = search;
    adminAPI.getAllVendors(params)
      .then((r) => {
        setAllVendors(r.data?.data?.vendors || []);
        setAllTotalPages(r.data?.data?.pagination?.totalPages || 1);
        setAllTotal(r.data?.data?.pagination?.total || 0);
      })
      .catch(() => showToast({ message: "Failed to load vendors", type: "error" }))
      .finally(() => setLoading(false));
  }, [allPage, search]);

  useEffect(() => {
    if (tab === "pending") loadPending();
    else loadAll();
  }, [tab, loadPending, loadAll]);

  const approve = async (vendorId) => {
    setActing((s) => ({ ...s, [vendorId]: "approving" }));
    try {
      await adminAPI.approveVendor(vendorId);
      setPendingVendors((v) => v.filter((x) => x.vendorId?.toString() !== vendorId && x._id?.toString() !== vendorId));
      showToast({ message: "Vendor approved!", type: "success" });
    } catch (err) {
      showToast({ message: err?.message || "Failed to approve vendor", type: "error" });
    } finally { setActing((s) => ({ ...s, [vendorId]: null })); }
  };

  const reject = async (vendorId, adminRemark) => {
    setRejectModal(null);
    setActing((s) => ({ ...s, [vendorId]: "rejecting" }));
    try {
      await adminAPI.rejectVendor(vendorId, { adminRemark });
      setPendingVendors((v) => v.filter((x) => x.vendorId?.toString() !== vendorId && x._id?.toString() !== vendorId));
      showToast({ message: "Vendor rejected", type: "info" });
    } catch (err) {
      showToast({ message: err?.message || "Failed to reject vendor", type: "error" });
    } finally { setActing((s) => ({ ...s, [vendorId]: null })); }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <ReasonModal
        open={!!rejectModal}
        title="Reject Vendor"
        subtitle="Please provide a reason. The vendor will be notified."
        placeholder="e.g. Incomplete documents, invalid GST number, policy violation..."
        onConfirm={(reason) => reject(rejectModal, reason)}
        onCancel={() => setRejectModal(null)}
      />

      <div className="mb-6">
        <p className="section-label">Admin</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Vendors</h1>
        <p className="text-ink-400 text-sm mt-0.5">
          {tab === "pending" ? `${pendingVendors.length} awaiting approval` : `${allTotal} vendors total`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[["pending", "Pending Approval"], ["all", "All Vendors"]].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:border-ink-400"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "all" && (
        <div className="flex gap-3 mb-5">
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && loadAll()}
            placeholder="Search shop name..." className="flex-1 px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-900 focus:outline-none focus:border-brand-400" />
          <button onClick={loadAll} className="btn-primary px-4 py-2 text-sm">Search</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-12 rounded-xl" /></div>)}</div>
      ) : tab === "pending" ? (
        pendingVendors.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-display font-bold text-ink-900 text-lg">All caught up!</h3>
            <p className="text-ink-500 text-sm mt-2">No vendors pending approval.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-sand-50 border-b border-ink-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Shop / Business</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden sm:table-cell">Owner</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">GST / PAN</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden lg:table-cell">Applied</th>
                  <th className="px-4 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {pendingVendors.map((v) => {
                  const actionId = v.vendorId?.toString() || v._id?.toString();
                  const isActing = acting[actionId];
                  return (
                    <tr key={v._id} onClick={() => setSelectedVendorId(actionId)}
                      className="hover:bg-sand-50 transition-colors cursor-pointer">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-ink-900">{v.shopName || "—"}</p>
                        <p className="text-xs text-ink-400 mt-0.5">{v.businessType || "—"}</p>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <p className="text-ink-700 font-medium">{v.name || "—"}</p>
                        <p className="text-xs text-ink-400">{v.email || v.phone || "—"}</p>
                      </td>
                      <td className="px-4 py-4 text-ink-500 hidden md:table-cell">
                        <p className="text-xs">GST: {v.gstNumber || "—"}</p>
                        <p className="text-xs">PAN: {v.panNumber || "—"}</p>
                      </td>
                      <td className="px-4 py-4 text-ink-400 hidden lg:table-cell">
                        {v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => approve(actionId)} disabled={!!isActing} className="btn-primary text-xs py-1.5 px-3">
                            {isActing === "approving" ? "Approving..." : "Approve"}
                          </button>
                          <button onClick={() => setRejectModal(actionId)} disabled={!!isActing}
                            className="btn-outline border-danger-200 text-danger-600 hover:bg-red-50 hover:border-danger-400 text-xs py-1.5 px-3">
                            {isActing === "rejecting" ? "Rejecting..." : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <>
          {allVendors.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-5xl mb-4">🏪</div>
              <p className="font-display font-bold text-ink-900 text-lg">No vendors found</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 border-b border-ink-100">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Shop</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden sm:table-cell">Owner</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden lg:table-cell">Vendor Score</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden lg:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {allVendors.map((v) => {
                    const vendorScore = v.vendorScore ?? 100;
                    const vColor = vendorScore >= 80 ? "#10b981" : vendorScore >= 60 ? "#f59e0b" : "#ef4444";
                    const vLabel = vendorScore >= 80 ? "Good" : vendorScore >= 60 ? "Fair" : "⚠ Poor";
                    return (
                    <tr key={v._id} onClick={() => setSelectedVendorId(v._id?.toString())}
                      className="hover:bg-brand-50 transition-colors cursor-pointer group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {v.shopName?.[0]?.toUpperCase() || "V"}
                          </div>
                          <div>
                            <p className="font-semibold text-ink-900 group-hover:text-brand-700 transition-colors">{v.shopName || "—"}</p>
                            <p className="text-xs text-ink-400">{v.businessType || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <p className="text-ink-700 font-medium">{v.userId?.name || "—"}</p>
                        <p className="text-xs text-ink-400">{v.userId?.email || v.userId?.phone || "—"}</p>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${v.userId?.isBlocked ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                          {v.userId?.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="space-y-1 min-w-[100px]">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold" style={{ color: vColor }}>{vendorScore}</span>
                            <span className="text-[10px] font-semibold" style={{ color: vColor }}>{vLabel}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${vendorScore}%`, background: vColor }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-ink-400 hidden lg:table-cell">
                        {v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {allTotalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button disabled={allPage <= 1} onClick={() => setAllPage(p => p - 1)} className="btn-outline py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-ink-600 font-medium px-3">Page {allPage} of {allTotalPages}</span>
              <button disabled={allPage >= allTotalPages} onClick={() => setAllPage(p => p + 1)} className="btn-outline py-2 px-4 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}

      {selectedVendorId && (
        <VendorDetailModal vendorId={selectedVendorId} onClose={() => setSelectedVendorId(null)} />
      )}
    </div>
  );
}
