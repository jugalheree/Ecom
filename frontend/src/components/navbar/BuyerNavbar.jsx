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
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container-app h-16 flex items-center justify-between">

        <Link to="/" className="text-xl font-bold text-green-600">
          TradeSphere
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">

          <Link to="/market">Marketplace</Link>

          <Link to="/cart" className="relative">
            Cart
            {cart.length > 0 && (
              <span className="ml-1 bg-green-600 text-white text-xs px-2 rounded-full">
                {cart.length}
              </span>
            )}
          </Link>

          {/* PROFILE */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100"
            >
              <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                {user?.name?.[0]}
              </div>
              <span>Hi, {user?.name}</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border overflow-hidden">
                <div className="px-4 py-3 border-b">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-xs text-slate-500">Buyer account</p>
                </div>

                <button onClick={() => navigate("/buyer/dashboard")} className="menu-item">Dashboard</button>
                <button onClick={() => navigate("/orders")} className="menu-item">Orders</button>
                <button onClick={() => navigate("/wishlist")} className="menu-item">Wishlist</button>
                <button onClick={() => navigate("/wallet")} className="menu-item">Wallet</button>

                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="menu-item text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
