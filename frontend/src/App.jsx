import AppRoutes from "./routes/AppRoutes";
import ToastContainer from "./components/ui/Toast";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/layout/Footer";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

function AppShell() {
  const location = useLocation();
  useAuthStore();

  // Don't show public navbar/footer on role-specific dashboard routes
  const isDashboardRoute =
    location.pathname.startsWith("/vendor") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/delivery");

  return (
    <>
      <Navbar />
      <main>
        <AppRoutes />
      </main>
      {!isDashboardRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <>
      <AppShell />
      <ToastContainer />
    </>
  );
}