import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { vendorAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

const STATUS_STYLE = {
  APPROVED: "text-green-700 bg-green-50 border-green-200",
  PENDING:  "text-amber-700 bg-amber-50 border-amber-200",
  REJECTED: "text-red-700 bg-red-50 border-red-200",
};

const STATUS_ICON = { APPROVED: "✓", PENDING: "⏳", REJECTED: "✕" };

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalProducts: 0 });
  const showToast = useToastStore((s) => s.showToast);

  const load = (params = {}) => {
    setLoading(true);
    vendorAPI.products({ page, limit: 12, sort, ...params })
      .then((r) => {
        const d = r.data?.data;
        setProducts(Array.isArray(d) ? d : d?.products || []);
        if (d?.pagination) setPagination(d.pagination);
      })
      .catch((err) => { const msg = err?.response?.data?.message || ""; if (!msg.includes("not approved") && !msg.includes("vendor profile")) showToast({ message: "Failed to load products", type: "error" }); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load({ search, status, sort, page }); }, [page, sort]);

  const handleSearch = () => { setPage(1); load({ search, status, sort, page: 1 }); };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await vendorAPI.deleteProduct(id);
      showToast({ message: "Product deleted", type: "success" });
      setProducts((p) => p.filter((x) => x._id !== id));
      setPagination((p) => ({ ...p, totalProducts: p.totalProducts - 1 }));
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to delete product", type: "error" });
    }
  };

  const stats = {
    total: pagination.totalProducts || products.length,
    approved: products.filter((p) => p.approvalStatus === "APPROVED").length,
    pending: products.filter((p) => p.approvalStatus === "PENDING").length,
    lowStock: products.filter((p) => p.stock < 5).length,
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="section-label">Vendor</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">My Products</h1>
          <p className="text-ink-400 text-sm mt-0.5">{pagination.totalProducts || products.length} product{products.length !== 1 ? "s" : ""} listed</p>
        </div>
        <Link to="/vendor/products/add">
          <button className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Listed", value: stats.total, icon: "📦", color: "text-ink-900" },
          { label: "Approved",     value: stats.approved, icon: "✅", color: "text-green-600" },
          { label: "Pending",      value: stats.pending, icon: "⏳", color: "text-amber-600" },
          { label: "Low Stock",    value: stats.lowStock, icon: "⚠️", color: "text-red-600" },
        ].map((s, i) => (
          <div key={i} className="card p-4 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-ink-400 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="flex gap-3 flex-wrap">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search products..."
            className="flex-1 min-w-[180px] px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-900 focus:outline-none focus:border-brand-400"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-600 focus:outline-none focus:border-brand-400 cursor-pointer">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-600 focus:outline-none focus:border-brand-400 cursor-pointer">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_low_high">Price: Low → High</option>
            <option value="price_high_low">Price: High → Low</option>
          </select>
          <button onClick={handleSearch} className="btn-primary px-5 py-2 text-sm">Search</button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-video w-full" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No products yet</h3>
          <p className="text-ink-500 text-sm mt-2 mb-6">Add your first product to start selling on TradeSphere.</p>
          <Link to="/vendor/products/add"><button className="btn-primary px-8 py-3">Add First Product →</button></Link>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p._id} className="card overflow-hidden hover:shadow-card-hover transition-all duration-200 group">
                {/* Image */}
                <div className="relative bg-sand-100 aspect-video overflow-hidden">
                  {p.image || p.primaryImage?.imageUrl ? (
                    <img src={p.image || p.primaryImage?.imageUrl} alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-ink-200">📦</div>
                  )}
                  {/* Status badge */}
                  <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[p.approvalStatus] || STATUS_STYLE.PENDING}`}>
                    {STATUS_ICON[p.approvalStatus]} {p.approvalStatus}
                  </span>
                  {/* Low stock warning */}
                  {p.stock < 5 && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                      Low Stock: {p.stock}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-ink-900 text-sm line-clamp-2 leading-snug mb-2">{p.title}</h3>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-sand-50 rounded-lg">
                      <p className="text-sm font-bold text-ink-900">₹{p.price?.toLocaleString()}</p>
                      <p className="text-[10px] text-ink-400">Price</p>
                    </div>
                    <div className="text-center p-2 bg-sand-50 rounded-lg">
                      <p className="text-sm font-bold text-ink-900">{p.stock}</p>
                      <p className="text-[10px] text-ink-400">Stock</p>
                    </div>
                    <div className="text-center p-2 bg-sand-50 rounded-lg">
                      <p className="text-sm font-bold text-ink-900">{p.totalSold || 0}</p>
                      <p className="text-[10px] text-ink-400">Sold</p>
                    </div>
                  </div>

                  {p.revenue > 0 && (
                    <p className="text-xs text-green-600 font-semibold mb-3">
                      💰 Revenue: ₹{p.revenue?.toLocaleString()}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/vendor/products/edit/${p._id}`} className="flex-1">
                      <button className="w-full py-2 rounded-xl border-2 border-ink-200 text-xs font-semibold text-ink-600 hover:border-ink-400 hover:text-ink-900 transition-all">
                        ✏️ Edit
                      </button>
                    </Link>
                    <Link to={`/vendor/stock?highlight=${p._id}`} className="flex-1">
                      <button className="w-full py-2 rounded-xl border-2 border-ink-200 text-xs font-semibold text-ink-600 hover:border-brand-400 hover:text-brand-700 transition-all">
                        📦 Stock
                      </button>
                    </Link>
                    <button onClick={() => handleDelete(p._id)}
                      className="px-3 py-2 rounded-xl border-2 border-ink-200 text-xs font-semibold text-red-500 hover:border-red-300 hover:bg-red-50 transition-all">
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="btn-outline py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-ink-600 font-medium px-3">
                Page {page} of {pagination.totalPages}
              </span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
                className="btn-outline py-2 px-4 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
