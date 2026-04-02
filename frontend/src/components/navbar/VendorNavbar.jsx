import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { vendorAPI } from "../../services/apis/index";
import { useEffect, useState, useRef } from "react";

export default function VendorNavbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [shopName, setShopName] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    vendorAPI.getProfile()
      .then((r) => setShopName(r.data?.data?.shopName || ""))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const primaryLinks = [
    { to: "/vendor/dashboard", label: "Dashboard" },
    { to: "/vendor/products",  label: "Products" },
    { to: "/vendor/orders",    label: "Orders" },
    { to: "/vendor/returns",   label: "Returns" },
    { to: "/vendor/stock",     label: "Stock" },
    { to: "/vendor/delivery",  label: "Delivery" },
    { to: "/vendor/reports",   label: "Reports" },
  ];

  const secondaryLinks = [
    { to: "/vendor/marketplace", label: "Marketplace", highlight: true },
    { to: "/vendor/deals",       label: "Deals",       highlight: true },
    { to: "/vendor/ratings",     label: "Ratings" },
    // { to: "/vendor/trade",       label: "Trade" },
    { to: "/vendor/payout",      label: "Payout" },
  ];

  const allLinks = [...primaryLinks, ...secondaryLinks];
  const displayName = shopName || user?.name || "Vendor";
  const initial = displayName[0]?.toUpperCase() || "V";
  const isActive = (path) => location.pathname === path;

  return (
    <header className="flex-shrink-0" style={{ background: "#0a0a0e", borderBottom: "3px solid #ff7d07" }}>
      {/* Top row */}
      <div className="flex items-center px-6 h-14 gap-4">
        {/* Logo */}
        <Link to="/vendor/dashboard" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm italic shadow-brand"
            style={{ background: "linear-gradient(135deg,#ff7d07 0%,#c74400 100%)" }}>
            T
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-display font-bold text-sm leading-none tracking-tight">
              Trade<span style={{ color: "#ff9d2e" }}>Sphere</span>
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "#ff7d07" }}>
              Vendor Panel
            </p>
          </div>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User info + sign out */}
        <div className="flex items-center gap-3 flex-shrink-0" ref={dropRef}>
          <button onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all"
            style={{ background: dropOpen ? "rgba(255,125,7,0.15)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,125,7,0.2)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#ff9d2e,#f05f00)" }}>
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-none truncate max-w-[110px]">{displayName}</p>
              {shopName && user?.name && shopName !== user?.name && (
                <p className="text-[9px] leading-none truncate max-w-[110px] mt-0.5" style={{ color: "#8e8e9a" }}>{user.name}</p>
              )}
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none"
              className={`hidden sm:block transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
              style={{ color: "#ff9d2e" }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {dropOpen && (
            <div className="absolute top-14 right-6 mt-1 w-48 rounded-2xl overflow-hidden z-50 shadow-card-hover"
              style={{ background: "#131318", border: "1.5px solid rgba(255,125,7,0.3)" }}>
              <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,125,7,0.2)", background: "rgba(255,125,7,0.08)" }}>
                <p className="text-xs font-bold text-white">{displayName}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "#ff7d07" }}>Vendor</p>
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

      {/* Bottom row — brand gradient nav bar */}
      <div className="overflow-x-auto scrollbar-none" style={{ background: "linear-gradient(90deg,#c74400 0%,#f05f00 40%,#ff7d07 100%)" }}>
        <div className="flex items-center gap-0.5 px-4 h-9 min-w-max">
          {primaryLinks.map((l) => {
            const active = isActive(l.to);
            return (
              <Link key={l.to} to={l.to}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  color: active ? "#c74400" : "rgba(255,255,255,0.9)",
                  background: active ? "white" : "transparent",
                  letterSpacing: "0.02em",
                }}>
                {l.label}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-4 mx-1.5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.3)" }} />

          {secondaryLinks.map((l) => {
            const active = isActive(l.to);
            return (
              <Link key={l.to} to={l.to}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  color: active ? "#c74400" : l.highlight ? "white" : "rgba(255,255,255,0.9)",
                  background: active ? "white" : l.highlight ? "rgba(255,255,255,0.18)" : "transparent",
                  letterSpacing: "0.02em",
                  ...(l.highlight && !active ? { border: "1px solid rgba(255,255,255,0.35)" } : {}),
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
