import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";

export default function VendorNavbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ink-950 border-b border-white/5">
      <div className="container-app h-[72px] flex items-center justify-between">
        <Link to="/vendor/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-display font-bold">TS</span>
          </div>
          <span className="text-base font-display font-bold text-white group-hover:text-primary-400 transition-colors">TradeSphere</span>
          <span className="text-[10px] font-display font-semibold text-white/30 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Vendor</span>
        </Link>

        <div className="relative">
          <button onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-display font-bold text-xs shadow-sm">
              {user?.name?.[0]}
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
                <p className="text-[10px] text-primary-400 font-medium mt-0.5 uppercase tracking-wider">Vendor Account</p>
              </div>
              <div className="p-1.5">
                {[
                  { label: "Dashboard", path: "/vendor/dashboard" },
                  { label: "Products", path: "/vendor/products" },
                  { label: "Orders", path: "/vendor/orders" },
                  { label: "Reports", path: "/vendor/reports" },
                ].map((item) => (
                  <button key={item.path} onClick={() => { navigate(item.path); setOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
                    {item.label}
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
      </div>
    </nav>
  );
}
