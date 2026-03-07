import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/admin/users")
      .then((res) => { setUsers(res.data.data?.users || []); setError(""); })
      .catch((err) => setError(err.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const roleColors = {
    ADMIN: "bg-amber-50 text-amber-700 border border-amber-200",
    VENDOR: "bg-primary-50 text-primary-700 border border-primary-200",
    BUYER: "bg-blue-50 text-blue-700 border border-blue-200",
    DELIVERY: "bg-purple-50 text-purple-700 border border-purple-200",
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="bg-white border-b border-ink-100 px-8 py-7">
        <p className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-amber-600 mb-1">Management</p>
        <h1 className="text-2xl font-display font-bold text-ink-900">Users</h1>
        <p className="text-ink-400 text-sm mt-0.5">View and manage all registered users.</p>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
          {loading && (
            <div className="flex items-center gap-3 p-6 text-ink-400 text-sm">
              <div className="w-4 h-4 border-2 border-ink-200 border-t-primary-500 rounded-full animate-spin" />
              Loading users...
            </div>
          )}
          {error && <div className="p-6 text-red-500 text-sm bg-red-50 border-b border-red-100">{error}</div>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50">
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Name</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Email</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Role</th>
                    <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ink-100 to-ink-200 flex items-center justify-center text-ink-600 font-display font-bold text-xs flex-shrink-0">
                            {u.name?.[0]}
                          </div>
                          <span className="font-medium text-ink-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink-500">{u.email || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${roleColors[u.role] || "bg-ink-50 text-ink-500 border border-ink-200"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {u.isBlocked ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-red-50 text-red-600 border border-red-100">Blocked</span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-ink-400 text-sm">No users found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}