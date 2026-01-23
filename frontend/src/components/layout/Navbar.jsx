import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

export default function Navbar() {
  const { user, token, logout, role } = useAuthStore();
  const navigate = useNavigate();
  const cart = useCartStore((s) => s.cart);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container-app h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">
          TradeSphere
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium text-slate-700 dark:text-slate-500">
          <Link to="/market" className="hover:text-blue-600 transition">
            Market
          </Link>

          <Link to="/cart" className="relative hover:text-blue-600 transition">
            <span>Cart</span>
            {cart.length > 0 && (
              <span className="ml-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </Link>

          <Link to="/wishlist" className="hover:text-blue-600">
            Wishlist
          </Link>
          <Link to="/orders" className="hover:text-blue-600">
            Orders
          </Link>
          <Link to="/wallet" className="hover:text-blue-600">
            Wallet
          </Link>

          {token ? (
            <>
              {/* {role === "vendor" && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Vendor Panel
                </Button>
              )} */}

              {role === "buyer" && (
                <Button variant="outline" onClick={() => navigate("/buyer")}>
                  Dashboard
                </Button>
              )}

              <span className="text-slate-600">Hi, {user?.name}</span>

              <Button
                variant="danger"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
