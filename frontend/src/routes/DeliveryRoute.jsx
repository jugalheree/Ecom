import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function DeliveryRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const userRole = useAuthStore((s) => s.role);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== "delivery") {
    return <Navigate to="/" replace />;
  }

  return children;
}
