import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-ink-50 mt-20">
      <aside className="w-72 bg-white border-r border-ink-200 flex flex-col shadow-sm">
        <div className="h-20 flex items-center px-8 border-b border-ink-200">
          <div>
            <h1 className="text-xl font-bold text-ink-900">Admin Panel</h1>
            <p className="text-xs text-ink-500 mt-1">TradeSphere Console</p>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-2 text-sm">
          <SidebarLink to="/admin/dashboard" label="Dashboard" icon="📊" />
          <SidebarLink to="/admin/users" label="Users" icon="👥" />
          <SidebarLink to="/admin/orders" label="Orders" icon="📦" />
          <SidebarLink to="/admin/claims" label="Claims" icon="📋" />
          <SidebarLink to="/admin/vendors" label="Pending Vendors" icon="🏪" />
          <SidebarLink to="/admin/products" label="Pending Products" icon="🔍" />
          <SidebarLink to="/admin/categories" label="Categories" icon="🗂️" />
        </nav>
        <div className="p-6 border-t border-ink-200 text-xs text-ink-500">
          TradeSphere Admin v1.0
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-white">
        <Outlet />
      </main>
    </div>
  );
}

function SidebarLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
          isActive
            ? "bg-primary-600 text-white shadow-md"
            : "text-ink-700 hover:bg-ink-100"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {label}
    </NavLink>
  );
}
