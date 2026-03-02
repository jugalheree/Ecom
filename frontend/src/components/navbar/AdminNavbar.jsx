import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";

export default function AdminNavbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/50">
      <div className="container-app h-20 flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          className="text-2xl font-bold font-display text-ink-900 hover:text-primary-600 transition-colors duration-200"
        >
          TradeSphere
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/admin/dashboard"
            className="text-ink-700 hover:text-ink-900 transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/users"
            className="text-ink-700 hover:text-ink-900 transition-colors duration-200"
          >
            Users
          </Link>
          <Link
            to="/admin/orders"
            className="text-ink-700 hover:text-ink-900 transition-colors duration-200"
          >
            Orders
          </Link>
          <Link
            to="/admin/claims"
            className="text-ink-700 hover:text-ink-900 transition-colors duration-200"
          >
            Claims
          </Link>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-ink-100 transition-colors duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-semibold shadow-md">
                {user?.name?.[0]}
              </div>
              <span className="text-ink-700 font-medium">Hi, {user?.name}</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-stone-200 overflow-hidden animate-fade-in">
                <div className="px-5 py-4 border-b border-stone-200 bg-ink-50">
                  <p className="font-semibold text-ink-900">{user?.name}</p>
                  <p className="text-xs text-ink-600 uppercase tracking-wide mt-1">Admin account</p>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate("/admin/dashboard");
                      setOpen(false);
                    }}
                    className="menu-item"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate("/admin/users");
                      setOpen(false);
                    }}
                    className="menu-item"
                  >
                    Users
                  </button>
                  <button
                    onClick={() => {
                      navigate("/admin/orders");
                      setOpen(false);
                    }}
                    className="menu-item"
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => {
                      navigate("/admin/claims");
                      setOpen(false);
                    }}
                    className="menu-item"
                  >
                    Claims
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
