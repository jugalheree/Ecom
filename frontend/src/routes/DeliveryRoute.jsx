import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function DeliveryRoute({ children }) {
  // FIX: Use `user` object instead of `token` for auth check
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.role);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== "employee") {
    return <Navigate to="/" replace />;
  }

  return children;
}
