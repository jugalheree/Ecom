import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children, role }) {
  const token = useAuthStore((s) => s.token);
  const userRole = useAuthStore((s) => s.role);

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (role && role !== userRole) {
    return <Navigate to="/" replace />;
  }

  // Allowed
  return children;
}
