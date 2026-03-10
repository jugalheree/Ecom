import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

const navItems = [
  { to: "/vendor/dashboard", label: "Dashboard", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )},
  { to: "/vendor/products", label: "Products", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  )},
  { to: "/vendor/stock", label: "Inventory", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )},
  { to: "/vendor/trade", label: "Orders", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
    </svg>
  )},
  { to: "/vendor/reports", label: "Reports", icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )},
];

export default function VendorLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-ink-50 mt-[72px]">
      <aside className="w-56 bg-ink-950 flex flex-col fixed left-0 top-[72px] bottom-0 z-40">
        <div className="px-4 py-4 border-b border-white/5">
          <p className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-white/30">Vendor Console</p>
        </div>
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-primary-500/15 text-primary-400 border border-primary-500/20"
                    : "text-white/45 hover:text-white/75 hover:bg-white/5"
                }`
              }
            >
              <span className="flex-shrink-0 opacity-80">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2.5 border-t border-white/5">
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-display font-bold text-xs flex-shrink-0">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/60 truncate">{user?.name}</p>
              <p className="text-[10px] text-white/25 group-hover:text-white/40 transition-colors">Sign out</p>
            </div>
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-56 min-h-screen bg-ink-50">
        <Outlet />
      </main>
    </div>
  );
}
