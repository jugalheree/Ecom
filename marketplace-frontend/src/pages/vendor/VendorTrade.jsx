import { useState } from "react";
import VendorLayout from "../../components/layout/VendorLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

export default function VendorTrade() {
  const [vendors] = useState([
    { id: 1, name: "TechWorld Suppliers" },
    { id: 2, name: "Gadget Hub" },
    { id: 3, name: "ElectroMart" },
  ]);

  const [requests, setRequests] = useState([
    { id: 1, from: "Gadget Hub", product: "Smart Watch", qty: 5, status: "pending" },
  ]);

  const [form, setForm] = useState({
    vendor: "",
    product: "",
    qty: "",
  });

  function sendRequest() {
    if (!form.vendor || !form.product || !form.qty) return;

    setRequests([
      {
        id: Date.now(),
        from: form.vendor,
        product: form.product,
        qty: form.qty,
        status: "pending",
      },
      ...requests,
    ]);

    setForm({ vendor: "", product: "", qty: "" });
  }

  return (
    <VendorLayout>
      <h1>Vendor Trading</h1>
      <p className="text-slate-600 mt-1">
        Request stock directly from other vendors.
      </p>

      {/* REQUEST FORM */}
      <Card className="mt-6 max-w-md space-y-3">
        <h3>Create trade request</h3>

        <select
          className="border rounded-lg px-3 py-2 w-full"
          value={form.vendor}
          onChange={(e) => setForm({ ...form, vendor: e.target.value })}
        >
          <option value="">Select vendor</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>

        <Input
          label="Product name"
          value={form.product}
          onChange={(e) => setForm({ ...form, product: e.target.value })}
        />

        <Input
          label="Quantity"
          type="number"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: e.target.value })}
        />

        <Button onClick={sendRequest}>Send Request</Button>
      </Card>

      {/* REQUEST LIST */}
      <div className="mt-10 space-y-4 max-w-2xl">
        <h3>Trade requests</h3>

        {requests.map((r) => (
          <Card key={r.id} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{r.from}</p>
              <p className="text-sm text-slate-600">
                {r.product} × {r.qty}
              </p>
            </div>

            <Badge
              type={
                r.status === "pending"
                  ? "warning"
                  : r.status === "accepted"
                  ? "success"
                  : "danger"
              }
            >
              {r.status}
            </Badge>
          </Card>
        ))}
      </div>
    </VendorLayout>
  );
}
