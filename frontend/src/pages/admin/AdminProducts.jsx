import { useEffect, useState } from "react";
import { adminAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState({});
  const showToast = useToastStore((s) => s.showToast);

  const load = () => {
    setLoading(true);
    adminAPI.getPendingProducts()
      .then((r) => setProducts(r.data?.data?.products || []))
      .catch(() => showToast({ message: "Failed to load products", type: "error" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setActing((s) => ({ ...s, [id]: "approving" }));
    try {
      await adminAPI.approveProduct(id);
      setProducts((p) => p.filter((x) => x._id !== id));
      showToast({ message: "Product approved!", type: "success" });
    } catch (err) {
      showToast({ message: err?.message || "Failed to approve", type: "error" });
    } finally {
      setActing((s) => ({ ...s, [id]: null }));
    }
  };

  const reject = async (id) => {
    const adminRemark = prompt("Rejection reason:");
    if (!adminRemark) return;
    setActing((s) => ({ ...s, [id]: "rejecting" }));
    try {
      // Backend expects { adminRemark } not { reason }
      await adminAPI.rejectProduct(id, { adminRemark });
      setProducts((p) => p.filter((x) => x._id !== id));
      showToast({ message: "Product rejected", type: "info" });
    } catch (err) {
      showToast({ message: err?.message || "Failed to reject", type: "error" });
    } finally {
      setActing((s) => ({ ...s, [id]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Admin</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Pending Products</h1>
        <p className="text-ink-400 text-sm mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""} awaiting review</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-12 rounded-xl" /></div>)}</div>
      ) : products.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No pending products</h3>
          <p className="text-ink-500 text-sm mt-2">All products have been reviewed.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-ink-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Product</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden sm:table-cell">Vendor</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Price</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Stock</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {products.map((p) => {
                const isActing = acting[p._id];
                return (
                  <tr key={p._id} className="hover:bg-sand-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                          📦
                        </div>
                        <div>
                          {/* Backend returns `title`, not `name` */}
                          <p className="font-semibold text-ink-900 line-clamp-1">{p.title || p.name || "—"}</p>
                          {p.adminRemark && (
                            <p className="text-xs text-danger-500 mt-0.5">Remark: {p.adminRemark}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Backend populates vendorId with shopName */}
                    <td className="px-4 py-4 text-ink-500 hidden sm:table-cell">
                      {p.vendorId?.shopName || "—"}
                    </td>
                    {/* Backend populates categoryId with name */}
                    <td className="px-4 py-4 text-ink-500 hidden md:table-cell">
                      {p.categoryId?.name || "—"}
                    </td>
                    <td className="px-4 py-4 font-bold text-ink-900">₹{p.price?.toLocaleString()}</td>
                    <td className="px-4 py-4 text-ink-500 hidden md:table-cell">{p.stock ?? "—"}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => approve(p._id)}
                          disabled={!!isActing}
                          className="btn-primary text-xs py-1.5 px-3">
                          {isActing === "approving" ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => reject(p._id)}
                          disabled={!!isActing}
                          className="btn-outline border-danger-200 text-danger-600 hover:bg-red-50 text-xs py-1.5 px-3">
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
