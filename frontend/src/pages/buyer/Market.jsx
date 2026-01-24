import { useState, useEffect } from "react";
import ProductCard from "../../components/product/ProductCard";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import SkeletonCard from "../../components/ui/SkeletonCard";

const dummyProducts = [
  { id: 1, name: "Wireless Headphones", price: 2499, ai: 87, category: "Electronics" },
  { id: 2, name: "Smart Watch", price: 4999, ai: 91, category: "Electronics" },
  { id: 3, name: "Bluetooth Speaker", price: 1999, ai: 82, category: "Electronics" },
  { id: 4, name: "Gaming Mouse", price: 1299, ai: 88, category: "Electronics" },
  { id: 5, name: "Office Chair", price: 8999, ai: 79, category: "Furniture" },
  { id: 6, name: "USB-C Hub", price: 1599, ai: 85, category: "Accessories" },
];

export default function Market() {
  const [search, setSearch] = useState("");
  const [minAI, setMinAI] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  const filtered = dummyProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      p.ai >= minAI &&
      p.price <= maxPrice
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Marketplace</h1>
        <p className="text-slate-600 mt-2">
          Discover verified products from trusted vendors.
        </p>
      </div>

      {/* LAYOUT */}
      <div className="grid md:grid-cols-4 gap-10">

        {/* SIDEBAR */}
        <div className="md:col-span-1">
          <Card className="p-6 sticky top-24 space-y-5">

            <h3 className="font-semibold text-lg">Filters</h3>

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

          </Card>
        </div>

        {/* PRODUCTS */}
        <div className="md:col-span-3">

          <p className="text-slate-500 mb-4">
            Showing {filtered.length} products
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}

          </div>

          {!loading && filtered.length === 0 && (
            <p className="text-slate-600 mt-16 text-center">
              No products match your filters.
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
