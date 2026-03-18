import { useEffect, useState } from "react";
import { adminAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState({});
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    adminAPI.getPendingVendors()
      .then((r) => setVendors(r.data?.data?.vendors || []))
      .catch(() => showToast({ message: "Failed to load vendors", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    setActing((s) => ({ ...s, [id]: "approving" }));
    try {
      await adminAPI.approveVendor(id);
      setVendors((v) => v.filter((x) => x._id !== id));
      showToast({ message: "Vendor approved!", type: "success" });
    } catch { showToast({ message: "Failed", type: "error" }); }
    finally { setActing((s) => ({ ...s, [id]: null })); }
  };

  const reject = async (id) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    setActing((s) => ({ ...s, [id]: "rejecting" }));
    try {
      await adminAPI.rejectVendor(id, { reason });
      setVendors((v) => v.filter((x) => x._id !== id));
      showToast({ message: "Vendor rejected", type: "info" });
    } catch { showToast({ message: "Failed", type: "error" }); }
    finally { setActing((s) => ({ ...s, [id]: null })); }
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
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Business Name</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden sm:table-cell">Owner</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Applied</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {vendors.map((v) => (
                <tr key={v._id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink-900">{v.businessName}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{v.gstin || "No GSTIN"}</p>
                  </td>
                  <td className="px-4 py-4 text-ink-600 hidden sm:table-cell">{v.user?.name || "—"}</td>
                  <td className="px-4 py-4 text-ink-400 hidden md:table-cell">{v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => approve(v._id)} disabled={acting[v._id]}
                        className="btn-primary text-xs py-1.5 px-3">
                        {acting[v._id] === "approving" ? "Approving..." : "Approve"}
                      </button>
                      <button onClick={() => reject(v._id)} disabled={acting[v._id]}
                        className="btn-outline border-danger-200 text-danger-600 hover:bg-red-50 hover:border-danger-400 text-xs py-1.5 px-3">
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
  );
}
