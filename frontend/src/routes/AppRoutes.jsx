import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Market from "../pages/buyer/Market";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import BuyerDashboard from "../pages/buyer/BuyerDashboard";
import VendorDashboard from "../pages/vendor/VendorDashboard";
import ProtectedRoute from "./ProtectedRoute";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Wallet from "../pages/Wallet";
import VendorProducts from "../pages/vendor/VendorProducts";
import VendorStock from "../pages/vendor/VendorStock";
import VendorTrade from "../pages/vendor/VendorTrade";
import VendorReports from "../pages/vendor/VendorReports";
import Wishlist from "../pages/Wishlist";
import Orders from "../pages/Orders";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/market" element={<Market />} />
      <Route path="/product/:id" element={<ProductDetail />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/buyer"
        element={
          <ProtectedRoute role="buyer">
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/products"
        element={
          <ProtectedRoute role="vendor">
            <VendorProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/stock"
        element={
          <ProtectedRoute role="vendor">
            <VendorStock />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/trade"
        element={
          <ProtectedRoute role="vendor">
            <VendorTrade />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/reports"
        element={
          <ProtectedRoute role="vendor">
            <VendorReports />
          </ProtectedRoute>
        }
      />


      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
      <Route path="/vendor/dashboard" element={<VendorDashboard />} />



    </Routes>
  );
}
