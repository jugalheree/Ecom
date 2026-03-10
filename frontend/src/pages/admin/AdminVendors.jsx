import { useEffect, useState } from "react";
import { adminAPI } from "../../services/apis/index";

import { useToastStore } from "../../store/toastStore";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null); // { vendorId }
  const [rejectRemark, setRejectRemark] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const fetchVendors = () => {
    setLoading(true);
    adminAPI
      .getPendingVendors({ page: 1, limit: 20 })
      .then((res) => {
        setVendors(res.data?.data || []);
      })
      .catch((err) => {
        showToast({ message: err.message || "Failed to load vendors", type: "error" });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApprove = async (vendorId) => {
    setActionLoading(true);
    try {
      await adminAPI.approveVendor(vendorId);
      showToast({ message: "Vendor approved successfully!", type: "success" });
      fetchVendors();
    } catch (err) {
      showToast({ message: err.message || "Failed to approve vendor", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectRemark.trim()) {
      showToast({ message: "Please provide a reason for rejection", type: "error" });
      return;
    }
    setActionLoading(true);
    try {
      await adminAPI.rejectVendor(rejectModal.vendorId, { adminRemark: rejectRemark });
      showToast({ message: "Vendor rejected", type: "info" });
      setRejectModal(null);
      setRejectRemark("");
      fetchVendors();
    } catch (err) {
      showToast({ message: err.message || "Failed to reject vendor", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="bg-white border-b border-ink-100 px-8 py-7">
        <p className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-amber-600 mb-1">Approvals</p>
        <h1 className="text-2xl font-display font-bold text-ink-900">Pending Vendor Approvals</h1>
        <p className="text-ink-400 text-sm mt-0.5">Review and approve or reject vendor verification requests.</p>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center gap-3 p-6 text-ink-400 text-sm">
              <div className="w-4 h-4 border-2 border-ink-200 border-t-primary-500 rounded-full animate-spin" />
              Loading pending vendors...
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12 text-ink-400 text-sm">No pending vendor verifications.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50">
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Name</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Email</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Shop</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Type</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">PAN</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Docs</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Submitted</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Actions</th>
                  </tr>
                </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v._id} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-ink-900">{v.name}</td>
                    <td className="px-5 py-3.5 text-ink-500 text-xs">{v.email || "—"}</td>
                    <td className="px-5 py-3.5 text-ink-700 font-medium text-xs">{v.shopName}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-ink-50 text-ink-600 border border-ink-100">
                        {v.businessType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-ink-400 font-mono text-xs">{v.panNumber}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {v.documents?.length > 0 ? (
                          v.documents.map((doc, i) => (
                            <a
                              key={i}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-lg transition-colors"
                            >
                              Doc {i + 1}
                            </a>
                          ))
                        ) : (
                          <span className="text-ink-300 text-xs">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-400 text-xs">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(v.vendorId)}
                          disabled={actionLoading}
                          className="text-[11px] font-display font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50 active:scale-[0.97]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ vendorId: v.vendorId })}
                          disabled={actionLoading}
                          className="text-[11px] font-display font-semibold bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition disabled:opacity-50 active:scale-[0.97]"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-ink-100">
            <h3 className="font-display font-bold text-ink-900 text-lg mb-2">Reject Vendor</h3>
            <p className="text-ink-500 text-sm mb-4">Provide a reason for rejection. This will be visible to the vendor.</p>
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              rows="4"
              placeholder="Enter rejection reason..."
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 resize-none"
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setRejectModal(null); setRejectRemark(""); }}
                className="flex-1 border border-ink-200 py-2.5 rounded-xl font-display font-semibold text-sm text-ink-700 hover:bg-ink-50 transition active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-red-700 transition disabled:opacity-50 active:scale-[0.97]"
              >
                {actionLoading ? "Rejecting..." : "Confirm rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
