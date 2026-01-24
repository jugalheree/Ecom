import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function VendorTrade() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([
    {
      id: 1,
      buyer: "Aman Patel",
      total: 7498,
      status: "Pending",
      items: [
        { name: "Wireless Headphones", qty: 2 },
        { name: "Bluetooth Speaker", qty: 1 },
      ],
      date: "24 Jan 2026",
    },
    {
      id: 2,
      buyer: "Neha Shah",
      total: 4999,
      status: "Accepted",
      items: [{ name: "Smart Watch", qty: 1 }],
      date: "23 Jan 2026",
    },
  ]);

  const updateStatus = (id, status) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  const statusColor = (status) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    if (status === "Accepted") return "bg-blue-100 text-blue-700";
    if (status === "Shipped") return "bg-purple-100 text-purple-700";
    if (status === "Completed") return "bg-green-100 text-green-700";
  };

  const pendingCount = orders.filter((o) => o.status === "Pending").length;

  return (
    <div className="p-8 grid lg:grid-cols-3 gap-8">

      {/* LEFT SIDE - ORDERS */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Vendor Trade</h1>
          <p className="text-slate-600 mt-1">
            Manage incoming orders and trading activity.
          </p>
        </div>

        {orders.map((order) => (
          <Card key={order.id} className="p-6 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500">
                  Order #{order.id} • {order.date}
                </p>
                <h3 className="font-semibold text-lg mt-1">
                  {order.buyer}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Total: ₹{order.total}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="border rounded-lg p-3 bg-slate-50 space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.qty}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {order.status === "Pending" && (
                <>
                  <Button onClick={() => updateStatus(order.id, "Accepted")}>
                    Accept order
                  </Button>
                  <Button variant="outline">Reject</Button>
                </>
              )}

              {order.status === "Accepted" && (
                <Button onClick={() => updateStatus(order.id, "Shipped")}>
                  Mark as shipped
                </Button>
              )}

              {order.status === "Shipped" && (
                <Button onClick={() => updateStatus(order.id, "Completed")}>
                  Mark as completed
                </Button>
              )}

              {order.status === "Completed" && (
                <span className="text-green-600 font-medium text-sm">
                  Trade successfully completed ✔
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* RIGHT SIDE - QUICK ACTIONS */}
      <div className="space-y-6">

        {/* SUMMARY */}
        <Card className="p-5">
          <h3 className="font-semibold text-lg">Trade summary</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>Total orders: {orders.length}</p>
            <p className="text-yellow-700 font-medium">
              Pending orders: {pendingCount}
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
            onClick={() => navigate("/vendor/stock")}
          >
            Manage stock
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/vendor/reports")}
          >
            View reports
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/vendor/dashboard")}
          >
            Vendor dashboard
          </Button>
        </Card>
      </div>
    </div>
  );
}
