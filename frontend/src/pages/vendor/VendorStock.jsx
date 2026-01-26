import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useNavigate } from "react-router-dom";

export default function VendorStock() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([
    { id: 1, name: "Wireless Headphones", stock: 12 },
    { id: 2, name: "Smart Watch", stock: 4 },
    { id: 3, name: "Bluetooth Speaker", stock: 0 },
    { id: 4, name: "Gaming Mouse", stock: 2 },
  ]);

  const updateStock = (id, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Number(value) } : p
      )
    );
  };

  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 5);
  const outOfStock = products.filter((p) => p.stock === 0);

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
          <h1 className="text-3xl font-semibold">Stock management</h1>
          <p className="text-slate-600 mt-1">
            Monitor and update your product stock levels.
          </p>
        </div>

        {/* STOCK TABLE */}
        <Card className="p-6 overflow-x-auto">
          <h3 className="font-semibold text-lg mb-4">Inventory status</h3>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-3">Product</th>
                <th>Current stock</th>
                <th>Update stock</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b last:border-b-0">
                  <td className="py-4 font-medium">{p.name}</td>
                  <td>{p.stock}</td>
                  <td className="max-w-[120px]">
                    <Input
                      type="number"
                      value={p.stock}
                      onChange={(e) =>
                        updateStock(p.id, e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${stockColor(
                        p.stock
                      )}`}
                    >
                      {stockStatus(p.stock)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* ALERTS */}
        {(lowStock.length > 0 || outOfStock.length > 0) && (
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">Stock alerts</h3>

            {outOfStock.map((p) => (
              <p
                key={p.id}
                className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-lg mb-2"
              >
                ❌ {p.name} is out of stock
              </p>
            ))}

            {lowStock.map((p) => (
              <p
                key={p.id}
                className="text-sm bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg mb-2"
              >
                ⚠ {p.name} is running low (only {p.stock} left)
              </p>
            ))}
          </Card>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-6">

        {/* SUMMARY */}
        <Card className="p-5">
          <h3 className="font-semibold text-lg">Stock summary</h3>

          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Total products: {products.length}</p>
            <p className="text-yellow-700 font-medium">
              Low stock: {lowStock.length}
            </p>
            <p className="text-red-700 font-medium">
              Out of stock: {outOfStock.length}
            </p>
          </div>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="p-5 space-y-4 sticky top">
          <h3 className="font-semibold text-lg">Quick actions</h3>

          <Button className="w-full" onClick={() => navigate("/vendor/products")}>
            Manage products
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
            onClick={() => navigate("/vendor/dashboard")}
          >
            Vendor dashboard
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/vendor/reports")}
          >
            View reports
          </Button>
        </Card>

        {/* BUSINESS TIP */}
        <Card className="p-5 bg-green-50 border-none">
          <h3 className="font-semibold text-green-700">Business tip</h3>
          <p className="text-sm text-green-700 mt-1">
            Keeping products in stock improves your marketplace visibility and
            buyer trust score.
          </p>
        </Card>
      </div>
    </div>
  );
}
