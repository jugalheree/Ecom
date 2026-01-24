import { useAuthStore } from "../../store/authStore";
import PublicNavbar from "./PublicNavbar.jsx";
import BuyerNavbar from "./BuyerNavbar";
import VendorNavbar from "./VendorNavbar";

export default function Navbar() {
  const { token, role } = useAuthStore();

  if (!token) return <PublicNavbar />;
  if (role === "vendor") return <VendorNavbar />;
  return <BuyerNavbar />;
}
