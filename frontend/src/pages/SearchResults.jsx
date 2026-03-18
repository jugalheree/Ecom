import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { marketplaceAPI } from "../services/apis/index";
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
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    marketplaceAPI.searchProducts({ q, limit: 24 })
      .then((res) => {
        const d = res.data?.data;
        setProducts(d?.products || []);
        setTotal(d?.totalProducts || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="bg-white border-b border-ink-100">
        <div className="container-app py-5">
          <p className="section-label">Search Results</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-0.5">
            {q ? `Results for "${q}"` : "Browse Products"}
          </h1>
          {!loading && <p className="text-xs text-ink-400 mt-0.5">{total.toLocaleString()} products found</p>}
        </div>
      </div>

      <div className="container-app py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-sand-100 rounded-full flex items-center justify-center text-4xl mb-4">🔍</div>
            <h3 className="font-display font-semibold text-ink-900 text-lg">No results found</h3>
            <p className="text-ink-500 text-sm mt-2">Try searching with different keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
