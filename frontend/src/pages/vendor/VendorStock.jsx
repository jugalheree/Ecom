import { useEffect, useState } from "react";
import api from "../../services/api";

export default function VendorStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/vendor/allProducts");
      const raw = res.data?.data;
      setProducts(Array.isArray(raw) ? raw : raw?.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id, change) => {
    try {
      // NOTE: /api/vendor/products/:id/stock does not yet exist in the backend.
      // This is a placeholder — the backend needs to implement this route.
      await api.patch(`/api/vendor/products/${id}/stock`, { change });
      await fetchProducts(); // refetch to get latest stock
    } catch (err) {
      alert(err.message || "Stock update failed — this feature requires a backend route not yet implemented.");
    }
  };

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">

        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">
            Stock Management
          </h1>
          <p className="text-gray-500">
            Manage your product inventory in real time.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-gray-500">
            No products found.
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center border p-6 rounded-xl"
              >
                <div>
                  <h3 className="font-semibold text-lg">
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Current stock: {p.stock}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => updateStock(p.id, -1)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-lg"
                  >
                    -
                  </button>

                  <span className="font-semibold">
                    {p.stock}
                  </span>

                  <button
                    onClick={() => updateStock(p.id, 1)}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
