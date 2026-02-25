import { useState, useEffect } from "react";
import ProductCard from "../../components/product/ProductCard";
import Input from "../../components/ui/Input";
import SkeletonCard from "../../components/ui/SkeletonCard";
import api from "../../services/api";

export default function Market() {
  const [search, setSearch] = useState("");
  const [minAI, setMinAI] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    // setLoading(true) removed as loading is initialized to true by default

    api
      .get("/api/products", {
        params: {
          search: search || undefined,
          minAi: minAI || undefined,
          maxPrice: maxPrice || undefined,
        },
      })
      .then((res) => {
        if (!isMounted) return;
        setProducts(res?.data?.data?.products ?? []);
        setError("");
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Failed to load products");
        setProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, minAI, maxPrice]);

  return (
    <div className="min-h-screen bg-white mt-20">
      <div className="container-app py-12">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-4">
            Marketplace
          </h1>
          <p className="text-xl text-stone-600">
            Discover verified products from trusted vendors.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 mb-10">
          <div className="grid md:grid-cols-3 gap-6">

            <Input
              label="Search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Input
              label="Minimum AI score"
              type="number"
              value={minAI}
              onChange={(e) => setMinAI(Number(e.target.value))}
            />

            <Input
              label="Max price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />

          </div>
        </div>

        {/* Result Count */}
        <p className="text-stone-600 font-medium mb-8 text-lg">
          Showing{" "}
          <span className="font-bold text-stone-900">
            {products.length}
          </span>{" "}
          products
        </p>

        {/* Error */}
        {error && (
          <div className="text-red-500 mb-6 text-center">
            {error}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">

          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}

        </div>

        {/* Empty State */}
        {!loading && products.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-stone-600 mb-2">
              No products match your filters.
            </p>
            <p className="text-stone-500">
              Try adjusting your search criteria.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
