import { useEffect, useState } from "react";
import { adminAPI } from "../../services/apis/index";

import { useToastStore } from "../../store/toastStore";

export default function AdminProducts() {
  const [data, setData] = useState({ products: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectRemark, setRejectRemark] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const fetchProducts = (page = 1) => {
    setLoading(true);
    adminAPI
      .getPendingProducts({ page, limit: 10 })
      .then((res) => setData(res.data?.data || { products: [], total: 0, page: 1, pages: 1 }))
      .catch((err) =>
        showToast({ message: err.message || "Failed to load products", type: "error" })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleApprove = async (productId) => {
    setActionLoading(true);
    try {
      await adminAPI.approveProduct(productId);
      showToast({ message: "Product approved!", type: "success" });
      fetchProducts(data.page);
    } catch (err) {
      showToast({ message: err.message || "Failed to approve", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectRemark.trim()) {
      showToast({ message: "Rejection reason is required", type: "error" });
      return;
    }
    setActionLoading(true);
    try {
      await adminAPI.rejectProduct(rejectModal.productId, { adminRemark: rejectRemark });
      showToast({ message: "Product rejected", type: "info" });
      setRejectModal(null);
      setRejectRemark("");
      fetchProducts(data.page);
    } catch (err) {
      showToast({ message: err.message || "Failed to reject", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="bg-white border-b border-ink-100 px-8 py-7">
        <p className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-amber-600 mb-1">Approvals</p>
        <h1 className="text-2xl font-display font-bold text-ink-900">Pending Products</h1>
        <p className="text-ink-400 text-sm mt-0.5">Review and approve or reject vendor product listings.
          {!loading && ` · ${data.total} product${data.total !== 1 ? "s" : ""} pending`}
        </p>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center gap-3 p-6 text-ink-400 text-sm">
              <div className="w-4 h-4 border-2 border-ink-200 border-t-primary-500 rounded-full animate-spin" />
              Loading products...
            </div>
          ) : data.products.length === 0 ? (
            <div className="text-center py-12 text-ink-400 text-sm">No pending products — all caught up! ✅</div>
          ) : (
            <>
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50">
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Title</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Vendor</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Category</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Price</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Stock</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Type</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Date</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((p) => (
                    <tr key={p._id} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-ink-900 max-w-[180px]"><span className="truncate block">{p.title}</span></td>
                      <td className="px-5 py-3.5 text-ink-500 text-xs">{p.vendorId?.shopName || "—"}</td>
                      <td className="px-5 py-3.5 text-ink-500 text-xs">{p.categoryId?.name || "—"}</td>
                      <td className="px-5 py-3.5 font-display font-bold text-ink-900 text-sm">₹{p.price?.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-ink-500 text-xs">{p.stock}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          p.saleType === "B2B" ? "bg-blue-50 text-blue-700 border-blue-200"
                          : p.saleType === "BOTH" ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-ink-50 text-ink-600 border-ink-200"
                        }`}>{p.saleType}</span>
                      </td>
                      <td className="px-5 py-3.5 text-ink-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(p._id)} disabled={actionLoading}
                            className="text-[11px] font-display font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50 active:scale-[0.97]">
                            Approve
                          </button>
                          <button onClick={() => setRejectModal({ productId: p._id })} disabled={actionLoading}
                            className="text-[11px] font-display font-semibold bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition disabled:opacity-50 active:scale-[0.97]">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              {/* Pagination */}
              {data.pages > 1 && (
                <div className="flex justify-center gap-2 p-4 border-t border-ink-100">
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => fetchProducts(pg)}
                      className={`w-8 h-8 rounded-lg text-sm font-display font-semibold transition ${
                        pg === data.page
                          ? "bg-ink-900 text-white"
                          : "bg-ink-50 hover:bg-ink-100 text-ink-600 border border-ink-200"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-ink-100">
            <h3 className="font-display font-bold text-ink-900 text-lg mb-2">Reject Product</h3>
            <p className="text-ink-500 text-sm mb-4">Provide a reason for rejection. This will be visible to the vendor.</p>
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              rows="4"
              placeholder="Enter rejection reason..."
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 resize-none"
            />
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setRejectModal(null); setRejectRemark(""); }}
                className="flex-1 border border-ink-200 py-2.5 rounded-xl font-display font-semibold text-sm text-ink-700 hover:bg-ink-50 transition active:scale-[0.97]">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-red-700 transition disabled:opacity-50 active:scale-[0.97]">
                {actionLoading ? "Rejecting..." : "Confirm rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
