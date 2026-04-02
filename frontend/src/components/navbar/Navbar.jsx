import { useAuthStore } from "../../store/authStore";
import PublicNavbar from "./PublicNavbar.jsx";
import BuyerNavbar from "./BuyerNavbar";
import VendorNavbar from "./VendorNavbar";
import AdminNavbar from "./AdminNavbar";
import DeliveryNavbar from "./DeliveryNavbar";

export default function Navbar() {
  // FIX: was checking `token` which was removed from store — now checks `user` object
  const { user, role } = useAuthStore();

  if (!user) return <PublicNavbar />;
  if (role === "vendor") return <VendorNavbar />;
  if (role === "admin") return <AdminNavbar />;
  if (role === "employee") return <DeliveryNavbar />;
  return <BuyerNavbar />;
}
