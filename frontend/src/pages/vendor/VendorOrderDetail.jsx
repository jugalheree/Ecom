import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

export default function VendorOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/api/orders/vendor`).then((res) => {
      const found = res.data.data.orders.find((o) => o.id === id);
      setOrder(found);
    });
  }, [id]);

  if (!order) return <div className="p-20">Loading...</div>;

  const statusSteps = ["PENDING", "ACCEPTED", "SHIPPED", "DELIVERED"];

  return (
    <div className="min-h-screen bg-white mt-20">
      <div className="container-app py-16 max-w-4xl">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">
            Order #{order.id}
          </h1>
          <p className="text-ink-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* STATUS TIMELINE */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const active =
                statusSteps.indexOf(order.status) >= index;

              return (
                <div key={step} className="flex-1 text-center">
                  <div
                    className={`w-8 h-8 mx-auto rounded-full mb-2 ${
                      active ? "bg-black" : "bg-ink-200"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      active ? "text-black" : "text-ink-400"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* BUYER INFO */}
        <div className="border rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-3">Buyer Details</h3>
          <p>{order.buyer}</p>
          <p className="text-sm text-ink-500">{order.email}</p>
        </div>

        {/* ITEMS */}
        <div className="border rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-4">Items</h3>

          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between mb-3 border-b pb-3"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-ink-500">
                  Quantity: {item.qty}
                </p>
              </div>
              <p>₹{item.price * item.qty}</p>
            </div>
          ))}
        </div>

        {/* PRICE SUMMARY */}
        <div className="border rounded-2xl p-6">
          <div className="flex justify-between mb-2">
            <span>Total</span>
            <span className="font-semibold">
              ₹{order.total}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}