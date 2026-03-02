import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useState } from "react";

export default function BuyerNavbar() {
  const { user, logout } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { to: "/market", label: "Marketplace" },
    { to: "/orders", label: "Orders" },
    { to: "/wishlist", label: "Wishlist" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-ink-100 shadow-sm">
      <div className="container-app h-18 flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-display font-bold">TS</span>
          </div>
          <span className="text-xl font-display font-bold text-ink-900 group-hover:text-primary-600 transition-colors">
            TradeSphere
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
                location.pathname === l.to
                  ? "bg-primary-50 text-primary-700 font-semibold"
                  : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"
              }`}
            >
              {l.label}
            </Link>
          ))}

          <Link to="/cart" className="relative ml-2 p-2.5 rounded-xl text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cart.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>

          <div className="relative ml-1">
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
                  <p className="text-xs text-primary-600 font-medium mt-0.5">Buyer Account</p>
                </div>
                <div className="p-2">
                  {[
                    { label: "Dashboard", path: "/buyer/dashboard" },
                    { label: "My Orders", path: "/orders" },
                    { label: "Wishlist", path: "/wishlist" },
                    { label: "Wallet", path: "/wallet" },
                  ].map((item) => (
                    <button key={item.path} onClick={() => { navigate(item.path); setOpen(false); }} className="menu-item">
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-ink-100 my-1.5" />
                  <button onClick={() => { logout(); navigate("/"); setOpen(false); }} className="menu-item text-red-600 hover:!bg-red-50 hover:!text-red-700 hover:!pl-4">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
