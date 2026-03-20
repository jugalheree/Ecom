import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function VendorNavbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/vendor/dashboard",    label: "Dashboard" },
    { to: "/vendor/products",     label: "Products" },
    { to: "/vendor/orders",       label: "Orders" },
    { to: "/vendor/stock",        label: "Stock" },
    { to: "/vendor/marketplace",  label: "🏪 Marketplace", highlight: true },
    { to: "/vendor/ratings",      label: "⭐ Ratings" },
    { to: "/vendor/reports",      label: "Reports" },
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
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <button onClick={() => { logout(); navigate("/"); }} className="text-xs text-ink-400 hover:text-red-400 transition-colors hidden sm:block">
          Sign Out
        </button>
      </div>
    </header>
  );
}