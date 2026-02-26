import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/admin/orders?page=1&limit=20")
      .then((res) => {
        setOrders(res.data.data?.orders || []);
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load orders");
      })
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (status) => {
    if (status === "DELIVERED") return "text-emerald-600";
    if (status === "SHIPPED") return "text-blue-600";
    if (status === "PENDING") return "text-amber-600";
    if (status === "CANCELLED") return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">

        <div className="mb-10">
          <h1 className="text-5xl font-display font-bold text-stone-900 mb-4">
            Admin Orders
          </h1>
          <p className="text-xl text-stone-600">
            View and manage platform orders.
          </p>
        </div>

        <Card className="p-8 border-2 border-stone-200 overflow-x-auto">

          {loading && <p>Loading orders...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-stone-500">
                  <th className="py-3">Order ID</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-stone-200">
                    <td className="py-4 font-medium text-stone-900">
                      {o.orderId}
                    </td>
                    <td>{o.buyerName}</td>
                    <td>₹{o.amount}</td>
                    <td className={statusColor(o.status)}>
                      {o.status}
                    </td>
                    <td>
                      {new Date(o.createdAt).toLocaleDateString()}
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