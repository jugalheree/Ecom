/**
 * Market.jsx — FIXED
 * 1. Categories shown as horizontal scrollable chips
 * 2. "All Products" shown by default on load
 * 3. No empty right side — products fill full width
 */

import { useState, useEffect } from "react";
import ProductCard from "../../components/product/ProductCard";
import SkeletonCard from "../../components/ui/SkeletonCard";
import { marketplaceAPI } from "../../services/apis/index";
import NearbyProductsSection from "../../components/map/NearbyProductsSection";

const CAT_ICONS = {
  "Electronics": "⚡", "Fashion": "👗", "Groceries": "🛒",
  "Industrial": "⚙️", "Home & Living": "🏠", "Beauty": "✨",
  "Sports": "🏆", "Books": "📚", "Food": "🍎", "Health": "💊",
  "Toys": "🧸", "Automotive": "🚗",
};

export default function Market() {
  const [activeTab, setActiveTab] = useState("browse");
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
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setCatLoading(true);
    marketplaceAPI.getCategoryTree()
      .then((res) => setCategoryTree(res.data?.data || []))
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
    if (activeTab !== "browse") return;
    setLoading(true); setError(""); setProducts([]);
    const params = { page, limit: 20, sort, saleType: "B2C" };
    if (priceMin) params.priceMin = priceMin;
    if (priceMax) params.priceMax = priceMax;
    Object.entries(attrFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    const call = selectedCategoryId
      ? marketplaceAPI.getProductsByCategory(selectedCategoryId, params)
      : marketplaceAPI.getMarketplaceProducts(params);
    call
      .then((res) => {
        const d = res.data?.data;
        setProducts(d?.products || []);
        setPagination({ currentPage: d?.currentPage || 1, totalPages: d?.totalPages || 1, totalProducts: d?.totalProducts || 0 });
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, [selectedCategoryId, page, sort, activeTab]);

  const applyFilters = () => {
    setPage(1);
    setLoading(true); setError(""); setProducts([]);
    const params = { page: 1, limit: 20, sort, saleType: "B2C" };
    if (priceMin) params.priceMin = priceMin;
    if (priceMax) params.priceMax = priceMax;
    Object.entries(attrFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    const call = selectedCategoryId
      ? marketplaceAPI.getProductsByCategory(selectedCategoryId, params)
      : marketplaceAPI.getMarketplaceProducts(params);
    call
      .then((res) => {
        const d = res.data?.data;
        setProducts(d?.products || []);
        setPagination({ currentPage: d?.currentPage || 1, totalPages: d?.totalPages || 1, totalProducts: d?.totalProducts || 0 });
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  };

  const selectCategory = (id, name) => {
    setSelectedCategoryId(id);
    setSelectedCategoryName(name);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="max-w-screen-xl mx-auto px-4 py-4">

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 mb-4 bg-white border border-gray-200 rounded-2xl p-1 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === "browse" ? "bg-black text-white shadow" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            🛍️ Browse All
          </button>
          <button
            onClick={() => setActiveTab("nearby")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === "nearby" ? "bg-black text-white shadow" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            📍 Nearby Vendors
          </button>
        </div>

        {activeTab === "nearby" && <NearbyProductsSection />}

        {activeTab === "browse" && (
          <>
            {/* Horizontal Category Chips */}
            <div className="mb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => selectCategory(null, "All Products")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition border ${
                    !selectedCategoryId
                      ? "bg-gray-900 text-white border-gray-900 shadow"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  🛍️ All
                </button>
                {catLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-9 w-24 bg-gray-100 rounded-full animate-pulse flex-shrink-0" />
                    ))
                  : categoryTree.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => selectCategory(cat._id, cat.name)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition border ${
                          selectedCategoryId === cat._id
                            ? "bg-gray-900 text-white border-gray-900 shadow"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <span>{CAT_ICONS[cat.name] || "🛍️"}</span>
                        {cat.name}
                      </button>
                    ))
                }
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{selectedCategoryName}</h2>
                {!loading && pagination.totalProducts > 0 && (
                  <span className="text-sm text-gray-400">{pagination.totalProducts.toLocaleString()} products</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {filters.length > 0 && (
                  <button
                    onClick={() => setShowFilters(v => !v)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      showFilters ? "bg-black text-white border-black" : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    🔧 Filters
                  </button>
                )}
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black bg-white"
                >
                  <option value="newest">Newest</option>
                  <option value="price_low_high">Price: Low → High</option>
                  <option value="price_high_low">Price: High → Low</option>
                </select>
              </div>
            </div>

            {/* Inline Filters Panel */}
            {showFilters && filters.length > 0 && (
              <div className="mb-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Min Price (₹)</p>
                    <input type="number" placeholder="Min" value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Max Price (₹)</p>
                    <input type="number" placeholder="Max" value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-black" />
                  </div>
                  {filters.map((filter) => (
                    <div key={filter.code}>
                      <p className="text-xs text-gray-500 mb-1">{filter.label}</p>
                      <select value={attrFilters[filter.code] || ""}
                        onChange={(e) => setAttrFilters({ ...attrFilters, [filter.code]: e.target.value })}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-black">
                        <option value="">All</option>
                        {filter.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <button onClick={applyFilters}
                  className="mt-3 bg-black text-white text-xs px-4 py-2 rounded-lg hover:bg-gray-900 transition">
                  Apply Filters
                </button>
              </div>
            )}

            {/* Products Grid — full width */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500 text-sm">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📦</div>
                <p className="text-base font-medium text-gray-600">No products found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different category or clear filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition">
                      ← Prev
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">{page} / {pagination.totalPages}</span>
                    <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition">
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
