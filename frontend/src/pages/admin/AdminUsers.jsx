import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { adminAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";
import { SimpleConfirmModal } from "../../components/ui/ConfirmModal";

const ROLE_STYLE = {
  ADMIN:    "bg-amber-50 text-amber-700 border border-amber-200",
  VENDOR:   "bg-brand-50 text-brand-700 border border-brand-200",
  BUYER:    "bg-blue-50 text-blue-700 border border-blue-200",
  EMPLOYEE: "bg-purple-50 text-purple-700 border border-purple-200",
};

const STATUS_STYLE = {
  active:  "bg-green-50 text-green-700",
  blocked: "bg-red-50 text-red-700",
};

function UserDetailModal({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const showToast = useToastStore((s) => s.showToast);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }

  useEffect(() => {
    api.get(`/api/admin/users/${userId}`)
      .then((r) => setData(r.data?.data))
      .catch(() => showToast({ message: "Failed to load user details", type: "error" }))
      .finally(() => setLoading(false));
  }, [userId, showToast]);

  if (!data && loading) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4">
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-8 rounded-xl" />)}</div>
      </div>
    </div>
  );

  if (!data) return null;
  const { user, buyerData, vendorData, addresses } = data;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center justify-between p-6 border-b border-ink-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-2xl font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-ink-900">{user.name}</h2>
              <p className="text-sm text-ink-500">{user.email || user.phone}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ROLE_STYLE[user.role]}`}>{user.role}</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${user.isBlocked ? STATUS_STYLE.blocked : STATUS_STYLE.active}`}>
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-ink-50 text-ink-400 hover:text-ink-700 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Phone", value: user.phone || "—" },
              { label: "Joined", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—" },
              { label: "Last Login", value: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("en-IN") : "Never" },
              { label: "B2B", value: user.isB2B ? "Yes" : "No" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-sand-50 rounded-xl p-3">
                <p className="text-xs text-ink-400 font-medium mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-ink-900">{value}</p>
              </div>
            ))}
          </div>

          {addresses?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-ink-700 mb-3">Addresses</h3>
              <div className="space-y-2">
                {addresses.map((a) => (
                  <div key={a._id} className="bg-sand-50 rounded-xl px-4 py-3 text-sm text-ink-600">
                    {[a.buildingNameOrNumber, a.area, a.city, a.state, a.pincode].filter(Boolean).join(", ")}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const showToast = useToastStore((s) => s.showToast);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (search) params.search = search;
    if (role) params.role = role;

    api.get("/api/admin/users", { params })
      .then((r) => {
        setUsers(r.data?.data?.users || []);
        setTotalPages(r.data?.data?.pagination?.totalPages || 1);
        setTotalUsers(r.data?.data?.pagination?.totalUsers || 0);
      })
      .catch(() => showToast({ message: "Failed to load users", type: "error" }))
      .finally(() => setLoading(false));
  }, [page, search, role, showToast]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (userId, userName) => {
    setDeleteConfirm({ id: userId, name: userName });
  };

  const confirmDelete = async () => {
    const { id, name } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      await api.delete(`/api/admin/users/${id}`);
      showToast({ message: `User deleted`, type: "success" });
      setUsers(prev => prev.filter(u => u._id !== id));
      setTotalUsers(t => t - 1);
    } catch {
      showToast({ message: "Failed to delete user", type: "error" });
    }
  };

  const handleBlock = async (userId, isBlocked, userName) => {
    try {
      await api.patch(`/api/admin/users/${userId}/toggle-block`);
      showToast({ message: `User ${isBlocked ? "unblocked" : "blocked"}: ${userName}`, type: "success" });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
    } catch {
      showToast({ message: "Failed to update user", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">Admin</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Users</h1>
          <p className="text-ink-400 text-sm mt-0.5">{totalUsers} users total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <input
          className="input-base text-sm flex-1 min-w-[200px]"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="input-base text-sm w-44"
          value={role}
          onChange={e => { setRole(e.target.value); setPage(1); }}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="VENDOR">Vendor</option>
          <option value="BUYER">Buyer</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
        <button onClick={load} className="btn-primary px-4 py-2 text-sm">Refresh</button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="card p-4"><div className="skeleton h-8 rounded-xl" /></div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="font-display font-bold text-ink-900 text-lg">No users found</h3>
          <p className="text-ink-500 text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-100 border-b border-ink-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-ink-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-ink-500 uppercase tracking-wider hidden sm:table-cell">Email / Phone</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-ink-500 uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-ink-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-ink-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-sand-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedUserId(u._id)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-ink-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-500 hidden sm:table-cell">{u.email || u.phone || "—"}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ROLE_STYLE[u.role] || "bg-ink-100 text-ink-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${u.isBlocked ? STATUS_STYLE.blocked : STATUS_STYLE.active}`}>
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleBlock(u._id, u.isBlocked, u.name)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${u.isBlocked ? "border-green-300 text-green-700 hover:bg-green-50" : "border-amber-300 text-amber-700 hover:bg-amber-50"}`}
                      >
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-ink-100 bg-sand-50">
              <p className="text-sm text-ink-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 text-sm rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-40"
                >← Prev</button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 text-sm rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-40"
                >Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
      {deleteConfirm && (
        <SimpleConfirmModal
          open={!!deleteConfirm}
          title="Delete User"
          message={`Are you sure you want to delete "${deleteConfirm?.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}