import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToastStore } from "../../store/toastStore";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const showToast = useToastStore((s) => s.showToast);

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (role) params.role = role;
    api.get("/api/admin/users", { params })
      .then((r) => setUsers(r.data?.data?.users || []))
      .catch(() => showToast({ message: "Failed to load users", type: "error" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

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
        <p className="text-ink-400 text-sm mt-0.5">{users.length} user{users.length !== 1 ? "s" : ""} found</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && load()}
          placeholder="Search name, email, phone..."
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-900 focus:outline-none focus:border-ink-900" />
        <select value={role} onChange={e => setRole(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-600 focus:outline-none focus:border-ink-900">
          <option value="">All Roles</option>
          <option value="BUYER">Buyer</option>
          <option value="VENDOR">Vendor</option>
          <option value="ADMIN">Admin</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
        <button onClick={load} className="btn-primary px-4 py-2 text-sm">Search</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="card p-5"><div className="skeleton h-12 rounded-xl" /></div>)}</div>
      ) : users.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <p className="font-display font-bold text-ink-900 text-lg">No users found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-ink-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Name</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Role</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Orders</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden lg:table-cell">Spent</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ink-300 to-ink-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {u.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-ink-900">{u.name || "—"}</p>
                        <p className="text-xs text-ink-400">{u.phone || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-ink-500 hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-4"><span className={roleStyle[u.role] || "badge"}>{u.role}</span></td>
                  <td className="px-4 py-4 text-ink-500 hidden md:table-cell">{u.totalOrders ?? 0}</td>
                  <td className="px-4 py-4 text-ink-500 hidden lg:table-cell">₹{(u.totalSpent ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-4 text-ink-400 hidden md:table-cell">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
