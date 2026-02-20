import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import api from "../../services/api";

const statusType = {
  PENDING: "warning",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export default function AdminOrders() {
  const [data, setData] = useState({ orders: [], total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/admin/orders", { params: { page: 1, limit: 50 } })
      .then((res) => setData(res.data.data))
      .catch(() => setData({ orders: [], total: 0, page: 1, totalPages: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const orders = data.orders || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-4">
            Orders
          </h1>
          <p className="text-xl text-stone-600">
            All platform orders ({data.total})
          </p>
        </div>
        <Card className="p-6 border-2 border-stone-200 overflow-hidden hover:border-primary-300 transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="pb-3 font-semibold text-stone-700">Order ID</th>
                  <th className="pb-3 font-semibold text-stone-700">Buyer</th>
                  <th className="pb-3 font-semibold text-stone-700">Amount</th>
                  <th className="pb-3 font-semibold text-stone-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-stone-500 text-center">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="py-3 font-medium text-stone-900">{o.orderId}</td>
                      <td className="py-3 text-stone-600">{o.buyerName}</td>
                      <td className="py-3 text-stone-700">₹{Number(o.amount).toLocaleString()}</td>
                      <td className="py-3">
                        <Badge type={statusType[o.status] || "default"}>{o.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
