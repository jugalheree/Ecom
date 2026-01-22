import { useState } from "react";
import VendorLayout from "../../components/layout/VendorLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function VendorStock() {
  const [items, setItems] = useState([
    { id: 1, name: "Wireless Headphones", stock: 12 },
    { id: 2, name: "Smart Watch", stock: 4 },
    { id: 3, name: "Bluetooth Speaker", stock: 2 },
  ]);

  function updateStock(id, newStock) {
    setItems(
      items.map((i) =>
        i.id === id ? { ...i, stock: Number(newStock) } : i
      )
    );
  }

  return (
    <VendorLayout>
      <h1>Stock Management</h1>

      <div className="space-y-4 mt-6">
        {items.map((item) => (
          <Card key={item.id} className="flex justify-between items-center">
            <div>
              <h3>{item.name}</h3>
              <p className="text-sm text-slate-600">
                Current stock: {item.stock}
              </p>

              {item.stock <= 5 && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠ Low stock alert
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Input
                type="number"
                className="w-24"
                placeholder="New"
                onChange={(e) =>
                  updateStock(item.id, e.target.value)
                }
              />
              <Button>Update</Button>
            </div>
          </Card>
        ))}
      </div>
    </VendorLayout>
  );
}
