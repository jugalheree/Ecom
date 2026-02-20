import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import api from "../../services/api";

export default function AdminUsers() {
  const [data, setData] = useState({ users: [], total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/admin/users", { params: { page: 1, limit: 50 } })
      .then((res) => setData(res.data.data))
      .catch(() => setData({ users: [], total: 0, page: 1, totalPages: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const users = data.users || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-4">
            Users
          </h1>
          <p className="text-xl text-stone-600">
            All registered users ({data.total})
          </p>
        </div>
        <Card className="p-6 border-2 border-stone-200 overflow-hidden hover:border-primary-300 transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="pb-3 font-semibold text-stone-700">Name</th>
                  <th className="pb-3 font-semibold text-stone-700">Email</th>
                  <th className="pb-3 font-semibold text-stone-700">Role</th>
                  <th className="pb-3 font-semibold text-stone-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-stone-500 text-center">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="py-3 font-medium text-stone-900">{u.name}</td>
                      <td className="py-3 text-stone-600">{u.email || u.phone || "—"}</td>
                      <td className="py-3">
                        <Badge type="info">{u.role}</Badge>
                      </td>
                      <td className="py-3">
                        <Badge type={u.isBlocked ? "danger" : "success"}>{u.isBlocked ? "Blocked" : "Active"}</Badge>
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
