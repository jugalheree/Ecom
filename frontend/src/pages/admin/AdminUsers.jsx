import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { adminAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

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

  useEffect(() => {
    api.get(`/api/admin/users/${userId}`)
      .then((r) => setData(r.data?.data))
      .catch(() => showToast({ message: "Failed to load user details", type: "error" }))
      .finally(() => setLoading(false));
  }, [userId]);

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
        {/* Header */}
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic info */}
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

          {/* Buyer stats */}
          {buyerData && (
            <div>
              <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-3">Buyer Activity</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="card p-4 text-center">
                  <p className="text-2xl font-display font-bold text-ink-900">{buyerData.stats?.totalOrders ?? 0}</p>
                  <p className="text-xs text-ink-400 mt-0.5">Total Orders</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-display font-bold text-ink-900">₹{(buyerData.stats?.totalSpent ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-ink-400 mt-0.5">Total Spent</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-display font-bold text-emerald-600">₹{(buyerData.walletBalance ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-ink-400 mt-0.5">Wallet Balance</p>
                </div>
              </div>
              {buyerData.recentOrders?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-ink-400 font-semibold uppercase tracking-wider mb-2">Recent Orders</p>
                  <div className="space-y-2">
                    {buyerData.recentOrders.slice(0, 3).map((o) => (
                      <div key={o._id} className="flex items-center justify-between text-sm bg-sand-50 rounded-xl px-4 py-2.5">
                        <span className="font-mono text-xs text-ink-500">#{o.orderNumber || o._id?.slice(-8)}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          o.orderStatus === "DELIVERED" ? "bg-green-50 text-green-700" :
                          o.orderStatus === "CANCELLED" ? "bg-red-50 text-red-700" :
                          "bg-amber-50 text-amber-700"
                        }`}>{o.orderStatus?.replace(/_/g," ")}</span>
                        <span className="font-semibold text-ink-900">₹{o.totalAmount?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vendor data */}
          {vendorData && (
            <div>
              <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-3">Vendor Activity</h3>
              
              {/* Vendor shop info */}
              {vendorData.vendor && (
                <div className="mb-3 p-4 bg-brand-50 rounded-xl border border-brand-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-lg">
                      {(vendorData.vendor.shopName || "V")[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-ink-900">{vendorData.vendor.shopName || "—"}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          vendorData.vendor.approvalStatus === "APPROVED" ? "bg-green-50 text-green-700" :
                          vendorData.vendor.approvalStatus === "REJECTED" ? "bg-red-50 text-red-700" :
                          "bg-amber-50 text-amber-700"
                        }`}>{vendorData.vendor.approvalStatus || "PENDING"}</span>
                        {vendorData.vendor.businessType && (
                          <span className="text-[10px] text-ink-500">{vendorData.vendor.businessType}</span>
                        )}
                        {vendorData.vendor.gstNumber && (
                          <span className="text-[10px] font-mono text-ink-400">GST: {vendorData.vendor.gstNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {vendorData.vendor.address?.city && (
                    <p className="text-xs text-ink-500 mt-2 ml-13">
                      📍 {[vendorData.vendor.address.area, vendorData.vendor.address.city, vendorData.vendor.address.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="card p-4 text-center">
                  <p className="text-2xl font-display font-bold text-ink-900">{vendorData.stats?.totalOrders ?? 0}</p>
                  <p className="text-xs text-ink-400 mt-0.5">Sales Orders</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-display font-bold text-ink-900">₹{(vendorData.stats?.totalRevenue ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-ink-400 mt-0.5">Revenue</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-display font-bold text-ink-900">{vendorData.products?.length ?? 0}</p>
                  <p className="text-xs text-ink-400 mt-0.5">Products</p>
                </div>
              </div>
              {vendorData.products?.length > 0 && (
                <div>
                  <p className="text-xs text-ink-400 font-semibold uppercase tracking-wider mb-2">Products ({vendorData.products.length})</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {vendorData.products.map((p) => (
                      <div key={p._id} className="flex items-center justify-between text-sm bg-sand-50 rounded-xl px-4 py-2.5">
                        <div className="flex-1 min-w-0">
                          <span className="text-ink-800 font-medium truncate block">{p.title}</span>
                          <span className="text-ink-400 text-[10px]">Stock: {p.stock ?? "—"}</span>
                        </div>
                        <span className="text-ink-500 ml-3 font-semibold">₹{p.price?.toLocaleString()}</span>
                        <span className={`ml-3 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          p.approvalStatus === "APPROVED" ? "bg-green-50 text-green-700" :
                          p.approvalStatus === "REJECTED" ? "bg-red-50 text-red-700" :
                          "bg-amber-50 text-amber-700"
                        }`}>{p.approvalStatus}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Addresses */}
          {addresses?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-3">Addresses</h3>
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
  }, [page, search, role]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => { setPage(1); load(); };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    try {
      await adminAPI.getUserDetails && api.delete(`/api/admin/users/${userId}`);
      showToast({ message: `User "${userName}" deleted`, type: "success" });
      setUsers(prev => prev.filter(u => u._id !== userId));
      setTotalUsers(t => t - 1);
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to delete user", type: "error" });
    }
  };

  const handleCleanup = async () => {
    if (!confirm("Find and delete all VENDOR accounts that never completed their shop setup? This will preview first.")) return;
    try {
      const res = await api.get("/api/admin/cleanup/incomplete-vendors", { params: { dryRun: true } });
      const { count, users: incomplete } = res.data?.data || {};
      if (count === 0) { showToast({ message: "No incomplete vendor registrations found ✅", type: "success" }); return; }
      if (confirm(`Found ${count} incomplete vendor registrations:\n${incomplete.slice(0,5).map(u => `• ${u.name} (${u.email})`).join("\n")}${count > 5 ? `\n...and ${count - 5} more` : ""}\n\nDelete all of these?`)) {
        await api.get("/api/admin/cleanup/incomplete-vendors", { params: { dryRun: false } });
        showToast({ message: `Deleted ${count} incomplete vendor registrations`, type: "success" });
        load();
      }
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Cleanup failed", type: "error" });
    }
  };

  const ROLE_BADGE = {
    ADMIN:    "bg-amber-50 text-amber-700 border border-amber-200",
    VENDOR:   "bg-brand-50 text-brand-700 border border-brand-200",
    BUYER:    "bg-blue-50 text-blue-700 border border-blue-200",
    EMPLOYEE: "bg-purple-50 text-purple-700 border border-purple-200",
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="section-label">Admin</p>
            <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">All Users</h1>
            <p className="text-ink-400 text-sm mt-0.5">{totalUsers} users found</p>
          </div>
          <button onClick={handleCleanup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold hover:bg-amber-100 transition-all">
            🧹 Clean Up Incomplete Registrations
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Search name, email, phone..."
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-900 focus:outline-none focus:border-brand-400"
        />
        <select
          value={role}
          onChange={e => { setRole(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border-2 border-ink-200 bg-white text-sm text-ink-600 focus:outline-none focus:border-brand-400"
        >
          <option value="">All Roles</option>
          <option value="BUYER">Buyer</option>
          <option value="VENDOR">Vendor</option>
          <option value="ADMIN">Admin</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
        <button onClick={handleSearch} className="btn-primary px-4 py-2 text-sm">Search</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="card p-5"><div className="skeleton h-12 rounded-xl" /></div>)}</div>
      ) : users.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <p className="font-display font-bold text-ink-900 text-lg">No users found</p>
        </div>
      ) : (
        <>
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
                  <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => setSelectedUserId(u._id)}
                    className="hover:bg-brand-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {u.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-ink-900 group-hover:text-brand-700 transition-colors">{u.name || "—"}</p>
                          <p className="text-xs text-ink-400">{u.phone || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-ink-500 hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[u.role] || "bg-ink-50 text-ink-600"}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-4 text-ink-500 hidden md:table-cell">{u.totalOrders ?? 0}</td>
                    <td className="px-4 py-4 text-ink-500 hidden lg:table-cell">₹{(u.totalSpent ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-4 text-ink-400 hidden md:table-cell">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button onClick={() => {
                          api.patch(`/api/admin/users/${u._id}/toggle-block`).then(() => {
                            setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isBlocked: !x.isBlocked } : x));
                            showToast({ message: `User ${u.isBlocked ? "unblocked" : "blocked"}`, type: "info" });
                          }).catch(() => showToast({ message: "Failed", type: "error" }));
                        }}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
                            u.isBlocked ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                                        : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                          }`}>
                          {u.isBlocked ? "Unblock" : "Block"}
                        </button>
                        {u.role !== "ADMIN" && (
                          <button onClick={() => handleDelete(u._id, u.name)}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all">
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="btn-outline py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-ink-600 font-medium px-3">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="btn-outline py-2 px-4 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}
