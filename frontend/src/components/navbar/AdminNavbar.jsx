import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useRef, useState, useEffect } from "react";

export default function AdminNavbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const links = [
    { to: "/admin/dashboard",  label: "Dashboard" },
    { to: "/admin/vendors",    label: "Vendors" },
    { to: "/admin/products",   label: "Products" },
    { to: "/admin/orders",     label: "Orders" },
    { to: "/admin/delivery",   label: "Delivery" },
    { to: "/admin/users",      label: "Users" },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/coupons",    label: "Coupons" },
    { to: "/admin/claims",     label: "Claims" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="flex-shrink-0" style={{ background: "#0a0a0e", borderBottom: "3px solid #f59e0b" }}>
      {/* Top row */}
      <div className="flex items-center px-6 h-14 gap-4">
        {/* Logo */}
        <Link to="/admin/dashboard" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm italic"
            style={{ background: "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)", boxShadow: "0 4px 16px rgba(245,158,11,0.4)" }}>
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-display font-bold text-sm leading-none tracking-tight">
              Trade<span style={{ color: "#fbbf24" }}>Sphere</span>
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "#f59e0b" }}>
              Admin Panel
            </p>
          </div>
        </Link>

        <div className="flex-1" />

        {/* Admin user */}
        <div className="flex items-center gap-3 flex-shrink-0" ref={dropRef}>
          <button onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all"
            style={{
              background: dropOpen ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(245,158,11,0.25)"
            }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#fbbf24,#d97706)" }}>
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="text-xs font-bold text-white hidden sm:block">{user?.name?.split(" ")[0]}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none"
              className={`hidden sm:block transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
              style={{ color: "#fbbf24" }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {dropOpen && (
            <div className="absolute top-14 right-6 mt-1 w-48 rounded-2xl overflow-hidden z-50 shadow-card-hover"
              style={{ background: "#131318", border: "1.5px solid rgba(245,158,11,0.3)" }}>
              <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.08)" }}>
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "#f59e0b" }}>Administrator</p>
              </div>
              <div className="p-1.5">
                <button onClick={() => { logout(); navigate("/"); setDropOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row — amber brand gradient */}
      <div className="overflow-x-auto scrollbar-none"
        style={{ background: "linear-gradient(90deg,#b45309 0%,#d97706 40%,#f59e0b 100%)" }}>
        <div className="flex items-center gap-0.5 px-4 h-9 min-w-max">
          {links.map((l) => {
            const active = isActive(l.to);
            return (
              <Link key={l.to} to={l.to}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  color: active ? "#b45309" : "rgba(255,255,255,0.9)",
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
