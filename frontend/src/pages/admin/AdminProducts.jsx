import { useEffect, useState } from "react";
import { adminAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState({});
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    adminAPI.getPendingProducts()
      .then((r) => setProducts(r.data?.data?.products || []))
      .catch(() => showToast({ message: "Failed to load products", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    setActing((s) => ({ ...s, [id]: true }));
    try {
      await adminAPI.approveProduct(id);
      setProducts((p) => p.filter((x) => x._id !== id));
      showToast({ message: "Product approved!", type: "success" });
    } catch { showToast({ message: "Failed", type: "error" }); }
    finally { setActing((s) => ({ ...s, [id]: false })); }
  };

  const reject = async (id) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    setActing((s) => ({ ...s, [id]: true }));
    try {
      await adminAPI.rejectProduct(id, { reason });
      setProducts((p) => p.filter((x) => x._id !== id));
      showToast({ message: "Product rejected", type: "info" });
    } catch { showToast({ message: "Failed", type: "error" }); }
    finally { setActing((s) => ({ ...s, [id]: false })); }
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
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Price</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                        {p.primaryImage?.imageUrl ? <img src={p.primaryImage.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" /> : "📦"}
                      </div>
                      <p className="font-semibold text-ink-900 line-clamp-1">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-ink-500 hidden sm:table-cell">{p.vendor?.businessName || "—"}</td>
                  <td className="px-4 py-4 font-bold text-ink-900">₹{p.price?.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => approve(p._id)} disabled={acting[p._id]} className="btn-primary text-xs py-1.5 px-3">Approve</button>
                      <button onClick={() => reject(p._id)} disabled={acting[p._id]} className="btn-outline border-danger-200 text-danger-600 hover:bg-red-50 text-xs py-1.5 px-3">Reject</button>
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
