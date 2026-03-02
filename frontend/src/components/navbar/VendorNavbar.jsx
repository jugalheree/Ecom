import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";

export default function VendorNavbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-ink-100 shadow-sm">
      <div className="container-app h-18 flex items-center justify-between py-3">
        <Link to="/vendor/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-display font-bold">TS</span>
          </div>
          <span className="text-xl font-display font-bold text-ink-900 group-hover:text-primary-600 transition-colors">
            TradeSphere
          </span>
          <span className="hidden sm:block text-xs font-display font-semibold text-ink-400 bg-ink-100 px-2 py-0.5 rounded-full ml-1">Vendor</span>
        </Link>

        <div className="relative">
          <button onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-xl hover:bg-ink-50 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-display font-bold text-sm shadow-sm">
              {user?.name?.[0]}
            </div>
            <span className="text-sm font-medium text-ink-700 hidden sm:block">{user?.name?.split(" ")[0]}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-ink-400 transition-transform ${open ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-ink-100 overflow-hidden animate-fade-up z-50">
              <div className="px-4 py-3.5 border-b border-ink-100 bg-ink-50">
                <p className="font-display font-semibold text-ink-900 text-sm">{user?.name}</p>
                <p className="text-xs text-primary-600 font-medium mt-0.5">Vendor Account</p>
              </div>
              <div className="p-2">
                {[
                  { label: "Dashboard", path: "/vendor/dashboard" },
                  { label: "Products", path: "/vendor/products" },
                  { label: "Orders", path: "/vendor/trade" },
                  { label: "Reports", path: "/vendor/reports" },
                ].map((item) => (
                  <button key={item.path} onClick={() => { navigate(item.path); setOpen(false); }} className="menu-item">
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-ink-100 my-1.5" />
                <button onClick={() => { logout(); navigate("/"); setOpen(false); }} className="menu-item text-red-600 hover:!bg-red-50 hover:!text-red-700">
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
