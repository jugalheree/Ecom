import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";

export default function VendorNavbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container-app h-16 flex items-center justify-between">

        <Link to="/vendor/dashboard" className="text-xl font-bold text-green-600">
          TradeSphere
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">

          

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
                  <p className="text-xs text-slate-500">Vendor account</p>
                </div>

                <button onClick={() => navigate("/vendor/dashboard")} className="menu-item">Dashboard</button>
                <button onClick={() => navigate("/vendor/products")} className="menu-item">Products</button>
                <button onClick={() => navigate("/vendor/orders")} className="menu-item">Orders</button>
                <button onClick={() => navigate("/vendor/reports")} className="menu-item">Reports</button>

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
