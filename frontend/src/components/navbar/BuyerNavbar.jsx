import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useState } from "react";

export default function BuyerNavbar() {
  const { user, logout } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/50">
      <div className="container-app h-20 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold font-display text-stone-900 hover:text-primary-600 transition-colors duration-200"
        >
          TradeSphere
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/market"
            className="text-stone-700 hover:text-stone-900 transition-colors duration-200"
          >
            Marketplace
          </Link>

          <Link
            to="/cart"
            className="relative text-stone-700 hover:text-stone-900 transition-colors duration-200"
          >
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-stone-900 text-white text-xs font-semibold rounded-full">
                {cart.length}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-stone-100 transition-colors duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-semibold shadow-md">
                {user?.name?.[0]}
              </div>
              <span className="text-stone-700 font-medium">Hi, {user?.name}</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-stone-200 overflow-hidden animate-fade-in">
                <div className="px-5 py-4 border-b border-stone-200 bg-stone-50">
                  <p className="font-semibold text-stone-900">{user?.name}</p>
                  <p className="text-xs text-stone-600 uppercase tracking-wide mt-1">Buyer account</p>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate("/buyer/dashboard");
                      setOpen(false);
                    }}
                    className="menu-item"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate("/orders");
                      setOpen(false);
                    }}
                    className="menu-item"
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => {
                      navigate("/wishlist");
                      setOpen(false);
                    }}
                    className="menu-item"
                  >
                    Wishlist
                  </button>
                  <button
                    onClick={() => {
                      navigate("/wallet");
                      setOpen(false);
                    }}
                    className="menu-item"
                  >
                    Wallet
                  </button>

                  <div className="border-t border-stone-200 my-2" />

                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                      setOpen(false);
                    }}
                    className="menu-item text-red-600 hover:bg-red-50"
                  >
                    Logout
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
