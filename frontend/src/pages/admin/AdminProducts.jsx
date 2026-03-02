import { useEffect, useState } from "react";
import { adminAPI } from "../../services/apis/index";
import Card from "../../components/ui/Card";
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
      <div className="container-app py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-ink-900">
            Pending Products
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Review and approve or reject vendor product listings.
          </p>
          {!loading && (
            <p className="text-ink-400 mt-2">
              {data.total} product{data.total !== 1 ? "s" : ""} pending review
            </p>
          )}
        </div>

        <Card className="p-6 border border-ink-200 overflow-x-auto">
          {loading ? (
            <p className="text-ink-500 animate-pulse">Loading products...</p>
          ) : data.products.length === 0 ? (
            <p className="text-ink-500 text-center py-8">
              No pending products. All caught up! ✅
            </p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-200 text-left text-ink-500">
                    <th className="py-3 pr-4">Title</th>
                    <th className="pr-4">Vendor</th>
                    <th className="pr-4">Category</th>
                    <th className="pr-4">Price</th>
                    <th className="pr-4">Stock</th>
                    <th className="pr-4">Sale Type</th>
                    <th className="pr-4">Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((p) => (
                    <tr key={p._id} className="border-b border-ink-100 hover:bg-ink-50">
                      <td className="py-4 pr-4 font-medium text-ink-900">{p.title}</td>
                      <td className="pr-4 text-ink-600">
                        {p.vendorId?.shopName || "—"}
                      </td>
                      <td className="pr-4 text-ink-600">
                        {p.categoryId?.name || "—"}
                      </td>
                      <td className="pr-4 font-semibold text-ink-900">₹{p.price}</td>
                      <td className="pr-4 text-ink-600">{p.stock}</td>
                      <td className="pr-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            p.saleType === "B2B"
                              ? "bg-blue-100 text-blue-700"
                              : p.saleType === "BOTH"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-ink-100 text-ink-700"
                          }`}
                        >
                          {p.saleType}
                        </span>
                      </td>
                      <td className="pr-4 text-ink-500 text-xs">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(p._id)}
                            disabled={actionLoading}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModal({ productId: p._id })}
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

              {/* Pagination */}
              {data.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => fetchProducts(pg)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                        pg === data.page
                          ? "bg-black text-white"
                          : "bg-ink-100 hover:bg-ink-200 text-ink-700"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-ink-900 mb-4">
              Reject Product
            </h3>
            <p className="text-ink-600 text-sm mb-4">
              Provide a reason for rejection. This will be visible to the vendor.
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
