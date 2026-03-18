import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function DeliveryNavbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/delivery/dashboard", label: "Dashboard" },
    { to: "/delivery/orders",    label: "My Deliveries" },
    { to: "/delivery/tracking",  label: "Tracking" },
  ];

  return (
    <header className="h-[72px] bg-ink-950 border-b border-white/10 flex items-center px-6 gap-4 flex-shrink-0">
      <Link to="/delivery/dashboard" className="flex items-center gap-2.5 mr-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm">🚚</span>
        </div>
        <span className="text-sm font-display font-bold text-white hidden sm:block">Delivery</span>
      </Link>
      <nav className="flex items-center gap-0.5 flex-1">
        {links.map((l) => (
          <Link key={l.to} to={l.to}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              location.pathname === l.to ? "bg-emerald-600 text-white" : "text-ink-400 hover:text-white hover:bg-white/10"
            }`}>
            {l.label}
          </Link>
        ))}
      </nav>
      <button onClick={() => { logout(); navigate("/"); }} className="text-xs text-ink-400 hover:text-red-400 transition-colors">Sign Out</button>
    </header>
  );
}
