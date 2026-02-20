import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/products/vendor/my-products")
      .then((res) => {
        setProducts(res.data.data.products);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/api/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };
  
  const updateStock = async (id, change) => {
    try {
      const res = await api.patch(
        `/api/products/${id}/stock`,
        { change }
      );
  
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, stock: res.data.data.stock } : p
        )
      );
    } catch (err) {
      alert(err.message || "Stock update failed");
    }
  };
  

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-display font-bold text-stone-900 mb-2">
              My Products
            </h1>
            <p className="text-lg text-stone-600">
              Manage your product inventory.
            </p>
          </div>

          <Link
            to="/vendor/products/add"
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            + Add Product
          </Link>
        </div>

        <Card className="p-8 border-2 border-stone-200 overflow-x-auto">
          {loading ? (
            <p>Loading...</p>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-stone-500">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-lg">No products yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-stone-200 text-left">
                  <th className="py-4">Product</th>
                  <th className="py-4">Price</th>
                  <th className="py-4">Stock</th>
                  <th className="py-4">Status</th>
                  <th className="py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-4 font-semibold">{p.name}</td>
                    <td className="py-4">₹{p.price}</td>
                    <td className="py-4">{p.stock}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStock(p.id, -1)}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded"
                        >
                          -
                        </button>

                        <span>{p.stock}</span>

                        <button
                          onClick={() => updateStock(p.id, 1)}
                          className="px-2 py-1 bg-green-100 text-green-600 rounded"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-4 text-right space-x-2">
                      <Link to={`/vendor/products/edit/${p.id}`}>
                        <Button variant="outline" className="text-xs py-2 px-4">
                          Edit
                        </Button>
                      </Link>

                      <Button
                        variant="danger"
                        className="text-xs py-2 px-4"
                        onClick={() => deleteProduct(p.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
