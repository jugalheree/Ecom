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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const showToast = useToastStore((s) => s.showToast);

  const load = (params = {}) => {
    setLoading(true);
    vendorAPI.products(params)
      .then((r) => {
        const d = r.data?.data;
        // Backend returns { products: [], pagination: {} }
        setProducts(Array.isArray(d) ? d : d?.products || []);
      })
      .catch(() => showToast({ message: "Failed to load products", type: "error" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => {
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    load(params);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await vendorAPI.deleteProduct(id);
      showToast({ message: "Product deleted", type: "success" });
      setProducts((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      showToast({ message: err?.message || "Failed to delete product", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="section-label">Vendor</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">My Products</h1>
          <p className="text-ink-400 text-sm mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""} listed</p>
        </div>
        <Link to="/vendor/products/add">
          <button className="btn-primary px-5 py-2.5 text-sm">+ Add Product</button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Search products..."
          className="flex-1 min-w-[180px] px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-900 focus:outline-none focus:border-ink-900" />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-600 focus:outline-none focus:border-ink-900">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button onClick={handleSearch} className="btn-primary px-4 py-2 text-sm">Search</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="card p-5"><div className="skeleton h-12 rounded-xl" /></div>)}</div>
      ) : products.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No products yet</h3>
          <p className="text-ink-500 text-sm mt-2 mb-6">Add your first product to start selling.</p>
          <Link to="/vendor/products/add"><button className="btn-primary px-8 py-3">Add First Product →</button></Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-ink-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Product</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Price</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Stock</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Sold</th>
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
                        {/* Backend returns image as p.image (url string), not p.primaryImage */}
                        {p.image
                          ? <img src={p.image} alt="" className="w-full h-full object-cover rounded-xl" />
                          : "📦"}
                      </div>
                      {/* Backend returns `title`, not `name` */}
                      <p className="font-semibold text-ink-900 line-clamp-1">{p.title || p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-ink-900">₹{p.price?.toLocaleString()}</td>
                  <td className="px-4 py-4 text-ink-500 hidden md:table-cell">{p.stock ?? "—"}</td>
                  <td className="px-4 py-4 text-ink-500 hidden md:table-cell">{p.totalSold ?? 0}</td>
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
