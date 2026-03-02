import { useEffect, useState } from "react";
import { adminAPI } from "../../services/apis/index";
import Card from "../../components/ui/Card";
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
      <div className="container-app py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-ink-900">
            Pending Vendor Approvals
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Review and approve or reject vendor verification requests.
          </p>
        </div>

        <Card className="p-6 border border-ink-200 overflow-x-auto">
          {loading ? (
            <p className="text-ink-500 animate-pulse">Loading pending vendors...</p>
          ) : vendors.length === 0 ? (
            <p className="text-ink-500 text-center py-8">
              No pending vendor verifications.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-left text-ink-500">
                  <th className="py-3 pr-4">Name</th>
                  <th className="pr-4">Email</th>
                  <th className="pr-4">Phone</th>
                  <th className="pr-4">Shop</th>
                  <th className="pr-4">Business Type</th>
                  <th className="pr-4">PAN</th>
                  <th className="pr-4">GST</th>
                  <th className="pr-4">Documents</th>
                  <th className="pr-4">Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v._id} className="border-b border-ink-100 hover:bg-ink-50">
                    <td className="py-4 pr-4 font-medium text-ink-900">{v.name}</td>
                    <td className="pr-4 text-ink-600">{v.email || "—"}</td>
                    <td className="pr-4 text-ink-600">{v.phone || "—"}</td>
                    <td className="pr-4 text-ink-600">{v.shopName}</td>
                    <td className="pr-4">
                      <span className="bg-ink-100 text-ink-700 text-xs px-2 py-1 rounded-full font-medium">
                        {v.businessType}
                      </span>
                    </td>
                    <td className="pr-4 text-ink-600 font-mono text-xs">{v.panNumber}</td>
                    <td className="pr-4 text-ink-600 font-mono text-xs">{v.gstNumber}</td>
                    <td className="pr-4">
                      <div className="flex gap-1 flex-wrap">
                        {v.documents?.length > 0 ? (
                          v.documents.map((doc, i) => (
                            <a
                              key={i}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:underline"
                            >
                              Doc {i + 1}
                            </a>
                          ))
                        ) : (
                          <span className="text-ink-400 text-xs">None</span>
                        )}
                      </div>
                    </td>
                    <td className="pr-4 text-ink-500 text-xs">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(v.vendorId)}
                          disabled={actionLoading}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ vendorId: v.vendorId })}
                          disabled={actionLoading}
                          className="bg-red-100 hover:bg-red-200 text-red-700 text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-ink-900 mb-4">
              Reject Vendor
            </h3>
            <p className="text-ink-600 text-sm mb-4">
              Please provide a reason for rejection. This will be visible to the vendor.
            </p>
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              rows="4"
              placeholder="Enter rejection reason..."
              className="w-full rounded-xl border border-ink-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectRemark("");
                }}
                className="flex-1 border-2 border-ink-200 py-2.5 rounded-xl font-medium text-ink-700 hover:bg-ink-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50"
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
