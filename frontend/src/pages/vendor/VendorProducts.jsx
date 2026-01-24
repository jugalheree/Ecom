import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useNavigate } from "react-router-dom";

export default function VendorProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([
    { id: 1, name: "Wireless Headphones", price: 2499, stock: 12 },
    { id: 2, name: "Smart Watch", price: 4999, stock: 4 },
    { id: 3, name: "Bluetooth Speaker", price: 1999, stock: 0 },
  ]);

  const [form, setForm] = useState({ name: "", price: "", stock: "" });

  const addProduct = () => {
    if (!form.name || !form.price || !form.stock) return;

    setProducts([
      ...products,
      {
        id: Date.now(),
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
      },
    ]);

    setForm({ name: "", price: "", stock: "" });
  };

  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 5).length;

  const stockStatus = (stock) => {
    if (stock === 0) return "Out of stock";
    if (stock < 5) return "Low stock";
    return "In stock";
  };

  const stockColor = (stock) => {
    if (stock === 0) return "bg-red-100 text-red-700";
    if (stock < 5) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="p-8 grid lg:grid-cols-3 gap-8">

      {/* LEFT SIDE */}
      <div className="lg:col-span-2 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold">My products</h1>
          <p className="text-slate-600 mt-1">
            Add, update and manage your product inventory.
          </p>
        </div>

        {/* ADD PRODUCT */}
        <Card className="p-6 max-w-xl">
          <h3 className="font-semibold text-lg mb-4">Add new product</h3>

          <div className="space-y-3">
            <Input
              label="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input
              label="Stock"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />

            <Button onClick={addProduct}>Add product</Button>
          </div>
        </Card>

        {/* PRODUCT TABLE */}
        <Card className="p-6 overflow-x-auto">
          <h3 className="font-semibold text-lg mb-4">Product inventory</h3>

          {products.length === 0 ? (
            <p className="text-slate-500 text-sm">No products added yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-3">Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b last:border-b-0">
                    <td className="py-4 font-medium">{p.name}</td>
                    <td>₹{p.price}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${stockColor(
                          p.stock
                        )}`}
                      >
                        {stockStatus(p.stock)}
                      </span>
                    </td>
                    <td className="text-right space-x-2">
                      <Button variant="outline" className="text-xs">
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="text-xs"
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

      {/* RIGHT SIDE */}
      <div className="space-y-6">

        {/* INVENTORY SUMMARY */}
        <Card className="p-5">
          <h3 className="font-semibold text-lg">Inventory summary</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Total products: {products.length}</p>
            <p className="text-yellow-700 font-medium">
              Low stock items: {lowStockCount}
            </p>
          </div>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="p-5 space-y-4 sticky top">
          <h3 className="font-semibold text-lg">Quick actions</h3>

          <Button className="w-full" onClick={() => navigate("/vendor/dashboard")}>
            Vendor dashboard
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/vendor/stock")}
          >
            Manage stock
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/vendor/trade")}
          >
            Trade panel
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/vendor/reports")}
          >
            View reports
          </Button>
        </Card>
      </div>
    </div>
  );
}
