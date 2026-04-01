import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirect to the unified Wallet page — it now uses real API for all roles
export default function TradeWallet() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/wallet", { replace: true }); }, []);
  return null;
}
