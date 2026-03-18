import { useEffect, useState } from "react";
import api from "../../services/api";
import BackendMissing from "../../components/ui/BackendMissing";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendMissing, setBackendMissing] = useState(false);

  useEffect(() => {
    api.get("/api/admin/users")
      .then((r) => setUsers(r.data?.data?.users || []))
      .catch(() => setBackendMissing(true))
      .finally(() => setLoading(false));
  }, []);

  const roleStyle = {
    ADMIN:    "badge-warn",
    VENDOR:   "badge-brand",
    BUYER:    "badge-navy",
    EMPLOYEE: "badge bg-purple-50 text-purple-700 border border-purple-200",
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Admin</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">All Users</h1>
        <p className="text-ink-400 text-sm mt-0.5">View and manage all registered users</p>
      </div>

      {backendMissing && <BackendMissing method="GET" endpoint="/api/admin/users" todo="Return paginated list of all users with name, email, role, createdAt" />}

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="card p-5"><div className="skeleton h-12 rounded-xl" /></div>)}</div>
      ) : users.length === 0 && !backendMissing ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <p className="font-display font-bold text-ink-900 text-lg">No users found</p>
        </div>
      ) : !backendMissing && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-ink-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Name</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Role</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ink-300 to-ink-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <p className="font-semibold text-ink-900">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-ink-500 hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-4"><span className={roleStyle[u.role] || "badge"}>{u.role}</span></td>
                  <td className="px-4 py-4 text-ink-400 hidden md:table-cell">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
