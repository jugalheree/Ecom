import { useState, useEffect } from "react";
import ProductCard from "../../components/product/ProductCard";
import SkeletonCard from "../../components/ui/SkeletonCard";
import { marketplaceAPI } from "../../services/apis/index";

export default function Market() {
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("All Products");
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [attrFilters, setAttrFilters] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const flattenTree = (nodes, depth = 0) => {
    const result = [];
    for (const node of nodes) {
      result.push({ ...node, depth });
      if (node.children?.length) result.push(...flattenTree(node.children, depth + 1));
    }
    return result;
  };

  useEffect(() => {
    setCatLoading(true);
    marketplaceAPI.getCategoryTree()
      .then((res) => {
        const tree = res.data?.data || [];
        setCategoryTree(tree);
        const flat = flattenTree(tree);
        if (flat.length > 0) {
          const firstLeaf = flat.find((c) => !c.hasChildren) || flat[0];
          setSelectedCategoryId(firstLeaf._id);
          setSelectedCategoryName(firstLeaf.name);
        }
      })
      .catch(() => setError("Failed to load categories"))
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;
    setFilters([]); setPriceMin(""); setPriceMax(""); setAttrFilters({});
    marketplaceAPI.getCategoryFilters(selectedCategoryId)
      .then((res) => setFilters(res.data?.data?.filters || []))
      .catch(() => {});
  }, [selectedCategoryId]);

  useEffect(() => {
    if (!selectedCategoryId) return;
    setLoading(true); setError(""); setProducts([]);
    const params = { page, limit: 20, sort, saleType: "B2C" };
    if (priceMin) params.priceMin = priceMin;
    if (priceMax) params.priceMax = priceMax;
    Object.entries(attrFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    marketplaceAPI.getProductsByCategory(selectedCategoryId, params)
      .then((res) => {
        const d = res.data?.data;
        setProducts(d?.products || []);
        setPagination({ currentPage: d?.currentPage || 1, totalPages: d?.totalPages || 1, totalProducts: d?.totalProducts || 0 });
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, [selectedCategoryId, page, sort]);

  const flatCategories = flattenTree(categoryTree);

  const applyFilters = () => {
    setPage(1);
    setLoading(true); setError(""); setProducts([]);
    const params = { page: 1, limit: 20, sort, saleType: "B2C" };
    if (priceMin) params.priceMin = priceMin;
    if (priceMax) params.priceMax = priceMax;
    Object.entries(attrFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    marketplaceAPI.getProductsByCategory(selectedCategoryId, params)
      .then((res) => {
        const d = res.data?.data;
        setProducts(d?.products || []);
        setPagination({ currentPage: d?.currentPage || 1, totalPages: d?.totalPages || 1, totalProducts: d?.totalProducts || 0 });
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => { setLoading(false); setSidebarOpen(false); });
  };

  const Sidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">Categories</h3>
        {catLoading ? (
          <div className="space-y-1.5">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-8 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1">
            {flatCategories.map((cat) => (
              <button key={cat._id}
                onClick={() => { setSelectedCategoryId(cat._id); setSelectedCategoryName(cat.name); setPage(1); setSidebarOpen(false); }}
                style={{ paddingLeft: `${12 + cat.depth * 14}px` }}
                className={`w-full text-left py-2 pr-3 rounded-lg text-sm transition-all ${
                  selectedCategoryId === cat._id
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                }`}>
                {cat.name}
                {cat.productCount > 0 && (
                  <span className="ml-1.5 text-[10px] text-ink-400">({cat.productCount})</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-ink-100 pt-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min ₹" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
            className="input-base text-xs py-2" />
          <input type="number" placeholder="Max ₹" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
            className="input-base text-xs py-2" />
        </div>
      </div>

      {filters.map((f) => (
        <div key={f.code} className="border-t border-ink-100 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">{f.label}</h3>
          {f.type === "SELECT" ? (
            <select value={attrFilters[f.code] || ""} onChange={(e) => setAttrFilters({ ...attrFilters, [f.code]: e.target.value })}
              className="input-base text-xs py-2">
              <option value="">Any</option>
              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {f.options?.map((o) => (
                <button key={o} onClick={() => setAttrFilters({ ...attrFilters, [f.code]: attrFilters[f.code] === o ? "" : o })}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    attrFilters[f.code] === o ? "bg-brand-600 text-white border-brand-600" : "border-ink-200 text-ink-600 hover:border-brand-300"
                  }`}>
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={applyFilters} className="btn-primary w-full py-2.5 text-sm mt-2">Apply Filters</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header bar */}
      <div className="bg-white border-b border-ink-100">
        <div className="container-app py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="section-label">Marketplace</p>
            <h1 className="text-2xl font-display font-bold text-ink-900 mt-0.5">{selectedCategoryName}</h1>
            {!loading && pagination.totalProducts > 0 && (
              <p className="text-xs text-ink-400 mt-0.5">{pagination.totalProducts.toLocaleString()} products found</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="input-base text-sm py-2 w-44">
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Best Rated</option>
            </select>
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-outline py-2 text-sm gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <Sidebar />
            </div>
          </aside>

          {/* Mobile sidebar drawer */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-card-hover overflow-y-auto p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-ink-900">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-ink-50">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <Sidebar />
              </div>
            </div>
          )}

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="card p-6 text-center text-danger-500 mb-6">
                <p className="font-medium">{error}</p>
                <button onClick={() => setPage(1)} className="btn-outline mt-3 text-sm py-2">Retry</button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 && !error ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto bg-sand-100 rounded-full flex items-center justify-center text-4xl mb-4">🔍</div>
                <h3 className="font-display font-semibold text-ink-900 text-lg">No products found</h3>
                <p className="text-ink-500 text-sm mt-2">Try adjusting your filters or selecting a different category.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                      className="btn-outline py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => {
                        const pg = i + 1;
                        return (
                          <button key={pg} onClick={() => setPage(pg)}
                            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                              page === pg ? "bg-brand-600 text-white" : "bg-white border border-ink-200 text-ink-600 hover:border-brand-300"
                            }`}>{pg}</button>
                        );
                      })}
                    </div>
                    <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}
                      className="btn-outline py-2 px-4 text-sm disabled:opacity-40">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
