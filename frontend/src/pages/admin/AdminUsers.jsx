import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/admin/users")
      .then((res) => {
        setUsers(res.data.data?.users || []);
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load users");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">

        <div className="mb-10">
          <h1 className="text-5xl font-display font-bold text-ink-900 mb-4">
            Admin Users
          </h1>
          <p className="text-xl text-ink-600">
            View and manage all registered users.
          </p>
        </div>

        <Card className="p-8 border-2 border-ink-200 overflow-x-auto">
          {loading && <p>Loading users...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-left text-ink-500">
                  <th className="py-3">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-ink-200">
                    <td className="py-4 font-medium text-ink-900">
                      {u.name}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      {u.isBlocked ? (
                        <span className="text-red-600">Blocked</span>
                      ) : (
                        <span className="text-emerald-600">Active</span>
                      )}
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