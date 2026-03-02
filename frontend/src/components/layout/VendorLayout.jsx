import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/vendor/dashboard", label: "Dashboard", icon: "⊞" },
  { to: "/vendor/products", label: "Products", icon: "◫" },
  { to: "/vendor/stock", label: "Stock", icon: "≡" },
  { to: "/vendor/trade", label: "Trade", icon: "⇄" },
  { to: "/vendor/reports", label: "Reports", icon: "↗" },
];

export default function VendorLayout() {
  return (
    <div className="flex min-h-screen bg-ink-50 mt-[72px]">
      <aside className="w-64 bg-white border-r border-ink-100 flex flex-col fixed left-0 top-[72px] bottom-0 shadow-sm">
        <div className="px-5 py-5 border-b border-ink-100">
          <p className="text-xs font-display font-bold uppercase tracking-widest text-ink-400">Vendor Console</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                }`
              }
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-ink-100">
          <p className="text-xs text-ink-300 font-medium">TradeSphere v1.0</p>
        </div>
      </aside>
      <main className="flex-1 ml-64 min-h-screen bg-white">
        <Outlet />
      </main>
    </div>
  );
}
