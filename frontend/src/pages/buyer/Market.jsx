import { useState, useEffect } from "react";
import ProductCard from "../../components/product/ProductCard";
import SkeletonCard from "../../components/ui/SkeletonCard";
import BackendMissing from "../../components/ui/BackendMissing";
import api from "../../services/api";

export default function Market() {
  const [search, setSearch] = useState("");
  const [minAI, setMinAI] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [backendMissing, setBackendMissing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setBackendMissing(false);
    api.get("/api/products", { params: { search: search || undefined, minAi: minAI || undefined, maxPrice: maxPrice || undefined } })
      .then((res) => { if (!isMounted) return; setProducts(res?.data?.data?.products ?? []); setError(""); })
      .catch((err) => {
        if (!isMounted) return;
        if (err?.status === 404) setBackendMissing(true);
        else setError(err.message || "Failed to load products");
        setProducts([]);
      })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [search, minAI, maxPrice]);

  return (
    <div className="min-h-screen bg-ink-50 mt-[72px]">
      {/* Header */}
      <div className="bg-white border-b border-ink-100">
        <div className="container-app py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-widest text-primary-600 mb-2">Marketplace</p>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-ink-900 leading-tight">
                Discover products
              </h1>
              <p className="text-ink-500 mt-2 text-sm">Verified products from trusted vendors across India.</p>
            </div>
            {!backendMissing && (
              <div className="flex items-center gap-2 bg-ink-50 border border-ink-200 rounded-xl px-4 py-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
                <span className="text-xs font-display font-semibold text-ink-600">
                  {loading ? "Loading..." : `${products.length} products`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Filter bar */}
        <div className="bg-white border border-ink-200 rounded-2xl p-5 mb-8 shadow-sm">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-ink-200 rounded-xl text-sm outline-none transition-all bg-white placeholder:text-ink-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 hover:border-ink-300"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 text-xs font-display font-bold uppercase tracking-widest text-ink-400 w-20">Min AI Score</div>
              <div className="flex-1 flex items-center gap-3">
                <input type="range" min="0" max="100" value={minAI} onChange={(e) => setMinAI(Number(e.target.value))}
                  className="flex-1 accent-primary-500 h-1.5 cursor-pointer" />
                <span className="text-sm font-display font-bold text-ink-900 w-8 text-right">{minAI}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 text-xs font-display font-bold uppercase tracking-widest text-ink-400 w-20">Max Price</div>
              <div className="flex-1 flex items-center gap-3">
                <input type="range" min="0" max="50000" step="500" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="flex-1 accent-primary-500 h-1.5 cursor-pointer" />
                <span className="text-sm font-display font-bold text-ink-900 w-16 text-right">₹{maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {backendMissing && (
          <BackendMissing
            endpoint="/api/products"
            method="GET"
            todo={[
              "Create /backend/src/controllers/product.controller.js with getProducts() and getProductById()",
              "Create /backend/src/routes/product.routes.js with GET / and GET /:id",
              "Add to app.js: import productRoutes from './routes/product.routes.js'",
              "Add to app.js: app.use('/api/products', productRoutes)",
              "Restart the backend server",
            ]}
          />
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-5 py-4 rounded-xl mb-6">{error}</div>}

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((p) => <ProductCard key={p._id} product={p} />)
          }
        </div>

        {!loading && products.length === 0 && !error && !backendMissing && (
          <div className="text-center py-24 bg-white rounded-2xl border border-ink-200">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-display font-semibold text-ink-800 mb-1">No products found</p>
            <p className="text-ink-500 text-sm">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
  );
}
