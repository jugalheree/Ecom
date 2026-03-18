import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { vendorAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

const statusBadge = (s) =>
  s === "APPROVED" ? "badge-success" :
  s === "REJECTED" ? "badge-danger" :
  "badge-warn";

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToastStore((s) => s.showToast);

  const load = () => {
    setLoading(true);
    vendorAPI.products()
      .then((r) => { const d = r.data?.data; setProducts(Array.isArray(d) ? d : d?.products || []); })
      .catch(() => showToast({ message: "Failed to load products", type: "error" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await vendorAPI.deleteProduct(id);
      showToast({ message: "Product deleted", type: "success" });
      load();
    } catch { showToast({ message: "Delete failed — backend endpoint missing", type: "error" }); }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">Vendor</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">My Products</h1>
          <p className="text-ink-400 text-sm mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""} listed</p>
        </div>
        <Link to="/vendor/products/add">
          <button className="btn-primary px-5 py-2.5 text-sm">+ Add Product</button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="card p-5"><div className="skeleton h-12 rounded-xl" /></div>)}</div>
      ) : products.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No products yet</h3>
          <p className="text-ink-500 text-sm mt-2 mb-6">Add your first product to start selling on TradeSphere.</p>
          <Link to="/vendor/products/add"><button className="btn-primary px-8 py-3">Add First Product →</button></Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-ink-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Product</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Price</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Stock</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Status</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                        {p.primaryImage?.imageUrl ? <img src={p.primaryImage.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" /> : "📦"}
                      </div>
                      <p className="font-semibold text-ink-900 line-clamp-1">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-ink-500 hidden sm:table-cell">{p.category?.name || "—"}</td>
                  <td className="px-4 py-4 font-semibold text-ink-900">₹{p.price?.toLocaleString()}</td>
                  <td className="px-4 py-4 text-ink-500 hidden md:table-cell">{p.stock ?? "—"}</td>
                  <td className="px-4 py-4">
                    <span className={statusBadge(p.approvalStatus)}>{p.approvalStatus || "PENDING"}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/vendor/products/edit/${p._id}`}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">Edit</Link>
                      <button onClick={() => handleDelete(p._id)}
                        className="text-xs font-medium text-danger-500 hover:text-danger-600 transition-colors">Delete</button>
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
