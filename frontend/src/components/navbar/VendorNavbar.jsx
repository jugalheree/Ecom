import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";

export default function VendorNavbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/vendor/dashboard",   label: "Dashboard" },
    { to: "/vendor/products",    label: "Products" },
    { to: "/vendor/orders",      label: "Orders" },
    { to: "/vendor/stock",       label: "Stock" },
    { to: "/vendor/marketplace", label: "🏪 Marketplace", highlight: true },
    { to: "/vendor/ratings",     label: "⭐ Ratings" },
    { to: "/vendor/reports",     label: "Reports" },
  ];

  return (
    <header className="h-[72px] bg-ink-950 border-b border-white/10 flex items-center px-6 gap-4 flex-shrink-0">
      <Link to="/vendor/dashboard" className="flex items-center gap-2.5 mr-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm italic">T</span>
        </div>
        <span className="text-sm font-display font-bold text-white hidden sm:block">Vendor Panel</span>
      </Link>

      <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto">
        {links.map((l) => {
          const isActive = location.pathname === l.to;
          return (
            <Link key={l.to} to={l.to}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-brand-600 text-white"
                  : l.highlight
                    ? "text-brand-400 hover:text-white hover:bg-brand-600/20 border border-brand-600/30"
                    : "text-ink-400 hover:text-white hover:bg-white/10"
              }`}>
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative flex-shrink-0">
        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-xl hover:bg-white/5 transition-all"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-display font-bold text-xs shadow-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-white/60 hidden sm:block">{user?.name?.split(" ")[0]}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-white/30 transition-transform ${open ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-52 bg-ink-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-white/5">
              <p className="font-display font-semibold text-white text-sm">{user?.name}</p>
              <p className="text-[10px] text-brand-400 font-medium mt-0.5 uppercase tracking-wider">Vendor Account</p>
            </div>
            <div className="p-1.5">
              {links.map((l) => (
                <button key={l.to} onClick={() => { navigate(l.to); setOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
                  {l.label}
                </button>
              ))}
              <div className="border-t border-white/5 my-1" />
              <button onClick={() => { logout(); navigate("/"); setOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
