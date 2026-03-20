import { useEffect, useState } from "react";
import { adminAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState({});
  const showToast = useToastStore((s) => s.showToast);

  const load = () => {
    setLoading(true);
    adminAPI.getPendingVendors()
      // Backend returns the array directly in data (not wrapped in { vendors: [] })
      .then((r) => {
        const d = r.data?.data;
        setVendors(Array.isArray(d) ? d : d?.vendors || []);
      })
      .catch(() => showToast({ message: "Failed to load vendors", type: "error" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (vendorId) => {
    setActing((s) => ({ ...s, [vendorId]: "approving" }));
    try {
      await adminAPI.approveVendor(vendorId);
      setVendors((v) => v.filter((x) => x.vendorId?.toString() !== vendorId && x._id?.toString() !== vendorId));
      showToast({ message: "Vendor approved!", type: "success" });
    } catch (err) {
      showToast({ message: err?.message || "Failed to approve vendor", type: "error" });
    } finally {
      setActing((s) => ({ ...s, [vendorId]: null }));
    }
  };

  const reject = async (vendorId) => {
    const adminRemark = prompt("Rejection reason:");
    if (!adminRemark) return;
    setActing((s) => ({ ...s, [vendorId]: "rejecting" }));
    try {
      await adminAPI.rejectVendor(vendorId, { adminRemark });
      setVendors((v) => v.filter((x) => x.vendorId?.toString() !== vendorId && x._id?.toString() !== vendorId));
      showToast({ message: "Vendor rejected", type: "info" });
    } catch (err) {
      showToast({ message: err?.message || "Failed to reject vendor", type: "error" });
    } finally {
      setActing((s) => ({ ...s, [vendorId]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Admin</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Pending Vendors</h1>
        <p className="text-ink-400 text-sm mt-0.5">{vendors.length} vendor{vendors.length !== 1 ? "s" : ""} awaiting approval</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-12 rounded-xl" /></div>)}</div>
      ) : vendors.length === 0 ? (
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
              {vendors.map((v) => {
                // Backend returns vendorId as the ID to pass to approve/reject routes
                const actionId = v.vendorId?.toString() || v._id?.toString();
                const isActing = acting[actionId];
                return (
                  <tr key={v._id} className="hover:bg-sand-50 transition-colors">
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
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => approve(actionId)}
                          disabled={!!isActing}
                          className="btn-primary text-xs py-1.5 px-3">
                          {isActing === "approving" ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => reject(actionId)}
                          disabled={!!isActing}
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
      )}
    </div>
  );
}
