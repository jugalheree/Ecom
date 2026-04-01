import { useEffect, useState } from "react";
import { adminAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";
import { ReasonModal } from "../../components/ui/ConfirmModal";

// ── Product Detail Modal ───────────────────────────────────────────────────
function ProductDetailModal({ productId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    adminAPI.getProductDetails(productId)
      .then((r) => setData(r.data?.data?.product))
      .catch(() => showToast({ message: "Failed to load product details", type: "error" }))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4">
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-8 rounded-xl" />)}</div>
      </div>
    </div>
  );
  if (!data) return null;

  const p = data;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-ink-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sand-100 flex items-center justify-center text-3xl flex-shrink-0">📦</div>
            <div>
              <h2 className="text-xl font-display font-bold text-ink-900">{p.title || p.name || "—"}</h2>
              <p className="text-sm text-ink-500">{p.categoryId?.name || "—"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  p.approvalStatus === "APPROVED" ? "bg-green-50 text-green-700 border border-green-200" :
                  p.approvalStatus === "REJECTED" ? "bg-red-50 text-red-700 border border-red-200" :
                  "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>{p.approvalStatus}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-ink-50 text-ink-400 hover:text-ink-700 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Price", value: `₹${p.price?.toLocaleString() || "—"}` },
              { label: "Stock", value: p.stock ?? "—" },
              { label: "Vendor", value: p.vendorId?.shopName || "—" },
              { label: "Business Type", value: p.vendorId?.businessType || "—" },
              { label: "Created", value: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "—" },
              { label: "SKU", value: p.sku || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-sand-50 rounded-xl p-3">
                <p className="text-xs text-ink-400 font-medium mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-ink-900">{value}</p>
              </div>
            ))}
          </div>

          {p.description && (
            <div>
              <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-ink-600 bg-sand-50 rounded-xl p-4 leading-relaxed">{p.description}</p>
            </div>
          )}

          {p.adminRemark && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs text-red-700 font-semibold">Admin Remark:</p>
              <p className="text-sm text-red-800 mt-0.5">{p.adminRemark}</p>
            </div>
          )}

          {p.attributes?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-3">Attributes</h3>
              <div className="flex flex-wrap gap-2">
                {p.attributes.map((attr, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white border border-ink-200 rounded-xl px-3 py-1.5">
                    <span className="text-xs font-semibold text-ink-700">{attr.code || attr.label}:</span>
                    <span className="text-xs text-ink-500">{attr.value}</span>
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
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState({});
  const [rejectModal, setRejectModal] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
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
    } finally { setActing((s) => ({ ...s, [id]: null })); }
  };

  const reject = async (id, adminRemark) => {
    setRejectModal(null);
    setActing((s) => ({ ...s, [id]: "rejecting" }));
    try {
      await adminAPI.rejectProduct(id, { adminRemark });
      setProducts((p) => p.filter((x) => x._id !== id));
      showToast({ message: "Product rejected", type: "info" });
    } catch (err) {
      showToast({ message: err?.message || "Failed to reject", type: "error" });
    } finally { setActing((s) => ({ ...s, [id]: null })); }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <ReasonModal
        open={!!rejectModal}
        title="Reject Product"
        subtitle="Please provide a reason for rejection. The vendor will be notified."
        placeholder="e.g. Missing product images, incorrect category, prohibited item..."
        onConfirm={(reason) => reject(rejectModal, reason)}
        onCancel={() => setRejectModal(null)}
      />
      <div className="mb-6">
        <p className="section-label">Admin</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Pending Products</h1>
        <p className="text-ink-400 text-sm mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""} awaiting review · click any row to view details</p>
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
                  <tr key={p._id} onClick={() => setSelectedProductId(p._id)}
                    className="hover:bg-sand-50 transition-colors cursor-pointer">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-lg flex-shrink-0">📦</div>
                        <div>
                          <p className="font-semibold text-ink-900 line-clamp-1">{p.title || p.name || "—"}</p>
                          {p.adminRemark && <p className="text-xs text-danger-500 mt-0.5">Remark: {p.adminRemark}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-ink-500 hidden sm:table-cell">{p.vendorId?.shopName || "—"}</td>
                    <td className="px-4 py-4 text-ink-500 hidden md:table-cell">{p.categoryId?.name || "—"}</td>
                    <td className="px-4 py-4 font-bold text-ink-900">₹{p.price?.toLocaleString()}</td>
                    <td className="px-4 py-4 text-ink-500 hidden md:table-cell">{p.stock ?? "—"}</td>
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => approve(p._id)} disabled={!!isActing} className="btn-primary text-xs py-1.5 px-3">
                          {isActing === "approving" ? "Approving..." : "Approve"}
                        </button>
                        <button onClick={() => setRejectModal(p._id)} disabled={!!isActing}
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

      {selectedProductId && (
        <ProductDetailModal productId={selectedProductId} onClose={() => setSelectedProductId(null)} />
      )}
    </div>
  );
}
