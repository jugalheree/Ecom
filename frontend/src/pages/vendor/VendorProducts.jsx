import { useState } from "react";
import VendorLayout from "../../components/layout/VendorLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function VendorProducts() {
  const [products, setProducts] = useState([
    { id: 1, name: "Wireless Headphones", stock: 12, price: 2499 },
    { id: 2, name: "Smart Watch", stock: 5, price: 4999 },
  ]);

  const [form, setForm] = useState({
    name: "",
    stock: "",
    price: "",
  });

  function handleAddProduct() {
    if (!form.name || !form.stock || !form.price) return;

    setProducts([
      ...products,
      {
        id: Date.now(),
        name: form.name,
        stock: Number(form.stock),
        price: Number(form.price),
      },
    ]);

    setForm({ name: "", stock: "", price: "" });
  }

  return (
    <VendorLayout>
      <div className="flex justify-between items-center">
        <h1>My Products</h1>
        <Button onClick={handleAddProduct}>Add Product</Button>
      </div>

      {/* ADD PRODUCT FORM */}
      <Card className="mt-6 space-y-3 max-w-md">
        <h3>Add new product</h3>

        <Input
          label="Product name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          label="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <Input
          label="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
      </Card>


      {products.length === 0 && (
        <div className="mt-10 text-center text-slate-600">
          <p>No products yet.</p>
          <p className="text-sm">Add your first product to start selling.</p>
        </div>
      )}
      
      {/* PRODUCT LIST */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {products.map((p) => (
          <Card key={p.id}>
            <h3>{p.name}</h3>
            <p className="text-sm text-slate-600 mt-1">
              Stock: {p.stock}
            </p>
            <p className="font-semibold mt-1">₹{p.price}</p>

            {p.stock <= 5 && (
              <p className="text-red-600 text-xs mt-2">
                ⚠ Low stock alert
              </p>
            )}
          </Card>
        ))}
      </div>
    </VendorLayout>
  );
}
