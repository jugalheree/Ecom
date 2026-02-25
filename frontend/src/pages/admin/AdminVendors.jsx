import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/admin/vendors?page=1&limit=20")
      .then((res) => {
        setVendors(res.data.data?.vendors || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (status) => {
    if (status === "APPROVED") return "text-emerald-600";
    if (status === "PENDING") return "text-amber-600";
    if (status === "REJECTED") return "text-red-600";
    return "text-stone-600";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">

        <div className="mb-10">
          <h1 className="text-5xl font-display font-bold text-stone-900 mb-4">
            Admin Vendors
          </h1>
          <p className="text-xl text-stone-600">
            View and manage vendor accounts.
          </p>
        </div>

        <Card className="p-8 border-2 border-stone-200 overflow-x-auto">

          {loading ? (
            <p>Loading vendors...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-stone-500">
                  <th className="py-3">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>
                {vendors.map((v) => (
                  <tr key={v._id} className="border-b border-stone-200">
                    <td className="py-4 font-medium">
                      {v.userId?.name}
                    </td>
                    <td>{v.userId?.email}</td>
                    <td>{v.userId?.role}</td>
                    <td className={statusColor(v.status)}>
                      {v.status}
                    </td>
                    <td>
                      {new Date(v.createdAt).toLocaleDateString()}
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