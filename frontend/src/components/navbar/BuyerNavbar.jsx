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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-ink-100 shadow-sm">
      <div className="container-app h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-display font-bold">TS</span>
          </div>
          <span className="text-base font-display font-bold text-ink-900 group-hover:text-primary-600 transition-colors">TradeSphere</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className={`text-sm font-medium px-3.5 py-2 rounded-xl transition-all ${
                location.pathname === l.to
                  ? "bg-primary-50 text-primary-700 font-semibold"
                  : "text-ink-500 hover:text-ink-900 hover:bg-ink-50"
              }`}
            >
              {l.label}
            </Link>
          ))}

          <Link to="/cart" className="relative ml-1 p-2.5 rounded-xl text-ink-500 hover:text-ink-900 hover:bg-ink-50 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cart.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>

          <div className="relative ml-1">
            <button onClick={() => setOpen(!open)}
              className="flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-xl hover:bg-ink-50 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-display font-bold text-xs shadow-sm">
                {user?.name?.[0]}
              </div>
              <span className="text-sm font-medium text-ink-600 hidden sm:block">{user?.name?.split(" ")[0]}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-ink-400 transition-transform ${open ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-ink-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-ink-100 bg-ink-50">
                  <p className="font-display font-semibold text-ink-900 text-sm">{user?.name}</p>
                  <p className="text-[10px] text-primary-600 font-medium mt-0.5 uppercase tracking-wider">Buyer Account</p>
                </div>
                <div className="p-1.5">
                  {[
                    { label: "Dashboard", path: "/buyer/dashboard" },
                    { label: "My Orders", path: "/orders" },
                    { label: "Wishlist", path: "/wishlist" },
                    { label: "Wallet", path: "/wallet" },
                  ].map((item) => (
                    <button key={item.path} onClick={() => { navigate(item.path); setOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-all">
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-ink-100 my-1" />
                  <button onClick={() => { logout(); navigate("/"); setOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-all">
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

