import { useState } from "react";
import ProductCard from "../components/product/ProductCard";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { useEffect } from "react";
import SkeletonCard from "../components/ui/SkeletonCard";

const dummyProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 2499,
    ai: 87,
    category: "Electronics",
  },
  { id: 2, name: "Smart Watch", price: 4999, ai: 91, category: "Electronics" },
  {
    id: 3,
    name: "Bluetooth Speaker",
    price: 1999,
    ai: 82,
    category: "Electronics",
  },
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
    <div className="container-app py-10">
      <h1>Marketplace</h1>
      <p className="text-slate-600 mt-1">
        Discover verified products from trusted vendors.
      </p>

      {/* FILTER BAR */}
      <Card className="mt-6 grid md:grid-cols-3 gap-4">
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

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {filtered.length === 0 && (
        <p className="text-slate-600 mt-10 text-center">
          No products match your filters.
        </p>
      )}
    </div>
  );
}
