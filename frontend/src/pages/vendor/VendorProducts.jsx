import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const res = await api.get("/api/products/vendor/my-products");
    setProducts(res.data.data?.products || []);
    setLoading(false);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await api.get("/api/products/vendor/my-products");
      setProducts(res.data.data?.products || []);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    await api.delete(`/api/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateStock = async (id, change) => {
    await api.patch(`/api/products/${id}/stock`, { change });
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-ink-900 mb-2">
              My Products
            </h1>
            <p className="text-lg text-ink-500">
              Manage your listed products and inventory.
            </p>
          </div>

          <button
            onClick={() => navigate("/vendor/products/add")}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-sm font-medium 
               hover:bg-ink-900 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span className="text-lg">+</span>
            Add Product
          </button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-ink-200 rounded-2xl">
            <h3 className="text-xl font-semibold text-ink-800 mb-3">
              No products yet
            </h3>
            <p className="text-ink-500 mb-6">
              Start by adding your first product to your store.
            </p>

            <button
              onClick={() => navigate("/vendor/products/add")}
              className="bg-black text-white px-6 py-3 rounded-xl text-sm font-medium 
               hover:bg-ink-900 transition-all duration-200"
            >
              + Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="p-6 border-2 border-ink-200">
                <img
                  src={product.images?.[0]?.url || "/placeholder.png"}
                  alt={product.name}
                />

                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p>₹{product.price}</p>
                <p>Stock: {product.stock}</p>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => updateStock(product.id, 1)}>
                    + Stock
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => updateStock(product.id, -1)}
                  >
                    - Stock
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
