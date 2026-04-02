import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Redirects vendors/admins/delivery away from buyer-only pages
export default function BuyerRoute({ children }) {
  const role = useAuthStore((s) => s.role);
  if (role === "vendor") return <Navigate to="/vendor/dashboard" replace />;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (role === "employee") return <Navigate to="/delivery/dashboard" replace />;
  return children;
}
