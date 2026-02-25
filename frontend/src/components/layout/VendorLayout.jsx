import { NavLink, Outlet } from "react-router-dom";

export default function VendorLayout() {
  return (
    <div className="flex min-h-screen bg-stone-50 mt-20">

      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-stone-200 flex flex-col shadow-sm">

        {/* Brand */}
        <div className="h-20 flex items-center px-8 border-b border-stone-200">
          <div>
            <h1 className="text-xl font-bold text-stone-900">
              Vendor Panel
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              TradeSphere Console
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 text-sm">

          <SidebarLink to="/vendor/dashboard" label="Dashboard" icon="📊" />
          <SidebarLink to="/vendor/products" label="Products" icon="📦" />
          <SidebarLink to="/vendor/stock" label="Stock" icon="📋" />
          <SidebarLink to="/vendor/trade" label="Trade" icon="🤝" />
          <SidebarLink to="/vendor/reports" label="Reports" icon="📈" />
          {/* <Link to="/admin/vendors">Vendors</Link> */}

        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-stone-200 text-xs text-stone-500">
          TradeSphere Vendor v1.0
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 overflow-y-auto bg-white">
        <Outlet />
      </main>
    </div>
  );
}

/* Sidebar link component */
function SidebarLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
          isActive
            ? "bg-primary-600 text-white shadow-md"
            : "text-stone-700 hover:bg-stone-100"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {label}
    </NavLink>
  );
}
