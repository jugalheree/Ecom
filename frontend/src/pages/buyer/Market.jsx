import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";
import SkeletonCard from "../../components/ui/SkeletonCard";
import { marketplaceAPI } from "../../services/apis/index";

export default function Market() {
  const navigate = useNavigate();
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState("");

  // Flatten tree preserving depth for indentation
  const flattenTree = (nodes, depth = 0) => {
    const result = [];
    for (const node of nodes) {
      result.push({ ...node, depth });
      if (node.children?.length) result.push(...flattenTree(node.children, depth + 1));
    }
    return result;
  };

  // Load category tree on mount
  useEffect(() => {
    setCatLoading(true);
    marketplaceAPI.getCategoryTree()
      .then((res) => {
        const tree = res.data?.data || [];
        setCategoryTree(tree);
        // Auto-select first category available (leaf preferred, else any)
        const flat = flattenTree(tree);
        if (flat.length > 0) {
          const firstLeaf = flat.find((c) => !c.hasChildren) || flat[0];
          setSelectedCategoryId(firstLeaf._id);
        }
      })
      .catch(() => setError("Failed to load categories"))
      .finally(() => setCatLoading(false));
  }, []);

  // Load products when category, page, or sort changes
  useEffect(() => {
    if (!selectedCategoryId) return;
    setLoading(true);
    setError("");
    setProducts([]);
    marketplaceAPI.getProductsByCategory(selectedCategoryId, { page, limit: 20, sort })
      .then((res) => {
        const data = res.data?.data;
        setProducts(data?.products || []);
        setPagination(data?.pagination || { currentPage: 1, totalPages: 1, totalProducts: 0 });
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, [selectedCategoryId, page, sort]);

  const flat = flattenTree(categoryTree);
  const selectedCat = flat.find((c) => c._id === selectedCategoryId);

  const handleCategorySelect = (id) => {
    setSelectedCategoryId(id);
    setPage(1);
    setProducts([]);
  };

  return (
    <div className="min-h-screen bg-ink-50 mt-[72px]">
      {/* Header */}
      <div className="bg-white border-b border-ink-100">
        <div className="container-app py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-2">Marketplace</p>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-ink-900 leading-tight">
                {selectedCat ? selectedCat.name : "Discover products"}
              </h1>
              {!loading && selectedCategoryId && (
                <p className="text-ink-500 mt-2 text-sm">
                  {pagination.totalProducts} product{pagination.totalProducts !== 1 ? "s" : ""} available
                </p>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-4 py-2.5 border-2 border-ink-200 rounded-xl text-sm outline-none focus:border-primary-500 bg-white text-ink-900 font-medium"
            >
              <option value="newest">Newest first</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container-app py-8 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden sticky top-24">
            <div className="px-4 py-3 border-b border-ink-100">
              <p className="text-[10px] font-display font-bold uppercase tracking-widest text-ink-400">Categories</p>
            </div>
            <nav className="p-2 max-h-[70vh] overflow-y-auto">
              {catLoading ? (
                <div className="p-4 text-xs text-ink-400 animate-pulse">Loading categories...</div>
              ) : flat.length === 0 ? (
                <div className="p-4 text-xs text-ink-400">No categories found</div>
              ) : (
                flat.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategorySelect(cat._id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedCategoryId === cat._id
                        ? "bg-primary-50 text-primary-700 font-semibold border border-primary-100"
                        : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                    }`}
                    style={{ paddingLeft: `${12 + cat.depth * 14}px` }}
                  >
                    {cat.hasChildren ? (
                      <span className="flex items-center gap-1.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                        {cat.name}
                      </span>
                    ) : cat.name}
                  </button>
                ))
              )}
            </nav>
          </div>
        </aside>

        {/* Products area */}
        <div className="flex-1 min-w-0">
          {/* Mobile category pills */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4">
            {flat.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat._id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  selectedCategoryId === cat._id
                    ? "bg-ink-900 text-white border-ink-900"
                    : "bg-white text-ink-600 border-ink-200 hover:border-ink-400"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-5 py-4 rounded-xl mb-6">{error}</div>
          )}

          {/* No category selected */}
          {!selectedCategoryId && !catLoading && (
            <div className="text-center py-20 bg-white rounded-2xl border border-ink-200">
              <div className="text-5xl mb-4">🗂️</div>
              <p className="text-lg font-display font-semibold text-ink-800">Select a category to browse products</p>
            </div>
          )}

          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))
            }
          </div>

          {/* Empty state */}
          {!loading && products.length === 0 && selectedCategoryId && !error && (
            <div className="text-center py-20 bg-white rounded-2xl border border-ink-200">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-display font-semibold text-ink-800 mb-1">No products in this category</p>
              <p className="text-ink-500 text-sm">Check back later or browse another category.</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-6">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-9 h-9 rounded-xl text-sm font-display font-semibold transition ${
                    pg === pagination.currentPage
                      ? "bg-ink-900 text-white"
                      : "bg-white border border-ink-200 text-ink-600 hover:bg-ink-50"
                  }`}
                >
                  {pg}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
