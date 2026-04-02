import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// VendorTrade was a duplicate of VendorOrders — redirect there
export default function VendorTrade() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/vendor/orders", { replace: true }); }, []);
  return null;
}
