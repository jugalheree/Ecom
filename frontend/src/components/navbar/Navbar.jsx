import { useAuthStore } from "../../store/authStore";
import PublicNavbar from "./PublicNavbar.jsx";
import BuyerNavbar from "./BuyerNavbar";
import VendorNavbar from "./VendorNavbar";
import AdminNavbar from "./AdminNavbar";
import DeliveryNavbar from "./DeliveryNavbar";

export default function Navbar() {
  const { token, role } = useAuthStore();

  if (!token) return <PublicNavbar />;
  if (role === "vendor") return <VendorNavbar />;
  if (role === "admin") return <AdminNavbar />;
  if (role === "delivery") return <DeliveryNavbar />;
  return <BuyerNavbar />;
}
