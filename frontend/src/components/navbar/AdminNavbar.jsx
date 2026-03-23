import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function AdminNavbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/vendors",   label: "Vendors" },
    { to: "/admin/products",  label: "Products" },
    { to: "/admin/orders",    label: "Orders" },
    { to: "/admin/users",     label: "Users" },
    { to: "/admin/categories",label: "Categories" },
  ];

  return (
    <header className="h-[72px] bg-ink-950 border-b border-white/10 flex items-center px-6 gap-4 flex-shrink-0">
      <Link to="/admin/dashboard" className="flex items-center gap-2.5 mr-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm italic">A</span>
        </div>
        <span className="text-sm font-display font-bold text-white hidden sm:block">Admin Panel</span>
      </Link>
      <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto">
        {links.map((l) => (
          <Link key={l.to} to={l.to}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              location.pathname === l.to ? "bg-amber-500 text-white" : "text-ink-400 hover:text-white hover:bg-white/10"
            }`}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <button onClick={() => { logout(); navigate("/"); }} className="text-xs text-ink-400 hover:text-red-400 transition-colors hidden sm:block">
          Sign Out
        </button>
      </div>
    </header>
  );
}
