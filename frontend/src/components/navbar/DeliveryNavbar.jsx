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

  const isActive = (path) => location.pathname === path;

  return (
    <header className="flex-shrink-0" style={{ background: "#0a0a0e", borderBottom: "3px solid #10b981" }}>
      {/* Top row */}
      <div className="flex items-center px-6 h-14 gap-4">
        {/* Logo */}
        <Link to="/delivery/dashboard" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: "linear-gradient(135deg,#10b981 0%,#059669 100%)", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }}>
            🚚
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-display font-bold text-sm leading-none tracking-tight">
              Trade<span style={{ color: "#34d399" }}>Sphere</span>
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "#10b981" }}>
              Delivery
            </p>
          </div>
        </Link>

        <div className="flex-1" />

        {/* User + sign out */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
              style={{ background: "linear-gradient(135deg,#34d399,#059669)" }}>
              {user?.name?.[0]?.toUpperCase() || "D"}
            </div>
            <span className="text-xs font-bold text-white hidden sm:block">{user?.name?.split(" ")[0]}</span>
          </div>
          <button onClick={() => { logout(); navigate("/"); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hidden sm:block"
            style={{ color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Bottom row — emerald gradient */}
      <div style={{ background: "linear-gradient(90deg,#065f46 0%,#059669 40%,#10b981 100%)" }}>
        <div className="flex items-center gap-0.5 px-4 h-9">
          {links.map((l) => {
            const active = isActive(l.to);
            return (
              <Link key={l.to} to={l.to}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  color: active ? "#065f46" : "rgba(255,255,255,0.9)",
                  background: active ? "white" : "transparent",
                  letterSpacing: "0.02em",
                }}>
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
