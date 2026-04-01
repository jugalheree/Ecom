import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { marketplaceAPI, categoryAPI } from "../services/apis/index";
import ProductCard from "../components/product/ProductCard";

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square w-full" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-9 w-full rounded-xl mt-3" />
      </div>
    </div>
  );
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputQ, setInputQ] = useState(q);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const searchInputRef = useRef(null);

  useEffect(() => {
    categoryAPI.getAll().then((r) => {
      const flat = [];
      const flatten = (nodes) => nodes.forEach((n) => { flat.push(n); if (n.children?.length) flatten(n.children); });
      flatten(r.data?.data || []);
      setCategories(flat);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setInputQ(q);
    setPage(1);
  }, [q]);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    const params = { q, limit: 20, sort, page, saleType: "B2C" };
    if (priceMin) params.priceMin = priceMin;
    if (priceMax) params.priceMax = priceMax;
    if (selectedCategory) params.categoryId = selectedCategory;
    marketplaceAPI.searchProducts(params)
      .then((res) => {
        const d = res.data?.data;
        setProducts(d?.products || []);
        setTotal(d?.pagination?.total || d?.totalProducts || 0);
        setTotalPages(d?.pagination?.totalPages || 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, sort, page, priceMin, priceMax, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputQ.trim()) return;
    navigate(`/search?q=${encodeURIComponent(inputQ.trim())}`);
  };

  const applyPrice = () => { setPage(1); };

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-white border-b border-ink-100 sticky top-[68px] z-30">
        <div className="container-app py-4">
          <form onSubmit={handleSearch} className="flex gap-3 items-center flex-wrap">
            {/* Search bar */}
            <div className="relative flex-1 min-w-[240px]">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchInputRef}
                type="text" value={inputQ} onChange={(e) => setInputQ(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-400 transition-all"
              />
            </div>
            <button type="submit" className="btn-primary px-5 py-2.5 text-sm flex-shrink-0">Search</button>

            {/* Sort */}
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl border-2 border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-400 cursor-pointer">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* Category filter */}
            {categories.length > 0 && (
              <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="px-3 py-2.5 rounded-xl border-2 border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-400 cursor-pointer">
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            )}

            {/* Price range */}
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min ₹" value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)} onBlur={applyPrice}
                className="w-24 px-3 py-2.5 rounded-xl border-2 border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-400" />
              <span className="text-ink-400 text-sm">–</span>
              <input type="number" placeholder="Max ₹" value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)} onBlur={applyPrice}
                className="w-24 px-3 py-2.5 rounded-xl border-2 border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-400" />
            </div>

            {(priceMin || priceMax) && (
              <button type="button" onClick={() => { setPriceMin(""); setPriceMax(""); setPage(1); }}
                className="text-xs text-ink-400 hover:text-red-500 transition-colors">✕ Clear</button>
            )}
          </form>

          {/* Results info */}
          {!loading && q && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-xs text-ink-500">
                {total > 0 ? <><strong>{total.toLocaleString()}</strong> results for</> : "No results for"}{" "}
                <strong>"{q}"</strong>
              </p>
              {(priceMin || priceMax) && (
                <span className="text-xs text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                  {priceMin && priceMax ? `₹${priceMin}–₹${priceMax}` : priceMin ? `Min ₹${priceMin}` : `Max ₹${priceMax}`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container-app py-8">
        {!q ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-2xl font-display font-bold text-ink-900">What are you looking for?</h2>
            <p className="text-ink-500 text-sm mt-2">Type in the search bar above to find products</p>
            {/* Popular searches */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {["Electronics", "Fashion", "Groceries", "Sports", "Books", "Home Decor"].map((s) => (
                <button key={s} onClick={() => navigate(`/search?q=${s}`)}
                  className="px-4 py-2 rounded-xl bg-white border border-ink-200 text-sm text-ink-600 hover:border-brand-400 hover:text-brand-700 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-sand-100 rounded-full flex items-center justify-center text-4xl mb-4">😕</div>
            <h3 className="font-display font-semibold text-ink-900 text-lg">No products found for "{q}"</h3>
            <p className="text-ink-500 text-sm mt-2 mb-6">Try different keywords, or browse all categories</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setPriceMin(""); setPriceMax(""); setSort("newest"); }}
                className="btn-outline px-5 py-2.5 text-sm">Reset Filters</button>
              <button onClick={() => navigate("/market")} className="btn-primary px-5 py-2.5 text-sm">Browse Marketplace →</button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="btn-outline py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                    const pg = i + 1;
                    return (
                      <button key={pg} onClick={() => setPage(pg)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                          page === pg ? "bg-brand-600 text-white" : "bg-white border border-ink-200 text-ink-600 hover:border-brand-300"
                        }`}>{pg}</button>
                    );
                  })}
                </div>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="btn-outline py-2 px-4 text-sm disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
