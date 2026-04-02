import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children, role }) {
  // FIX: Use `user` object (not `token`) to determine auth state.
  // Token is no longer stored in state — auth is via httpOnly cookies.
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.role);

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (role && role !== userRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
