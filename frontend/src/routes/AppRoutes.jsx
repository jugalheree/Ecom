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
import VendorProducts from "../pages/vendor/VendorProducts";
import VendorStock from "../pages/vendor/VendorStock";
import VendorTrade from "../pages/vendor/VendorTrade";
import VendorReports from "../pages/vendor/VendorReports";
import Wishlist from "../pages/Wishlist";
import Orders from "../pages/Orders";
import TradeWallet from "../pages/wallet/TradeWallet";
import WalletClaims from "../pages/wallet/WalletClaims";
import RatingCenter from "../pages/ratings/RatingCenter";
import VendorLayout from "../components/layout/VendorLayout";
import AdminRoute from "./AdminRoute";
import DeliveryRoute from "./DeliveryRoute";
import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminClaims from "../pages/admin/AdminClaims";
import DeliveryLayout from "../components/layout/DeliveryLayout";
import DeliveryDashboard from "../pages/delivery/DeliveryDashboard";
import DeliveryOrders from "../pages/delivery/DeliveryOrders";
import DeliveryTracking from "../pages/delivery/DeliveryTracking";
import AddProduct from "../pages/vendor/AddProduct";
import EditProduct from "../pages/vendor/EditProduct";
import AdminVendors from "../pages/admin/AdminVendors";
import VendorPage from "../pages/public/VendorPage";



export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/market" element={<Market />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/vendor/:vendorId" element={<VendorPage />} />

      <Route
        path="/buyer"
        element={
          <ProtectedRoute role="buyer">
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor"
        element={
          <ProtectedRoute role="vendor">
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="products" element={<VendorProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        
        <Route path="stock" element={<VendorStock />} />
        <Route path="trade" element={<VendorTrade />} />
        <Route path="reports" element={<VendorReports />} />
      </Route>

      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
      <Route path="/vendor/dashboard" element={<VendorDashboard />} />
      


      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="claims" element={<AdminClaims />} />
        <Route path="vendors" element={<AdminVendors />} />
      </Route>

      <Route
        path="/delivery"
        element={
          <DeliveryRoute>
            <DeliveryLayout />
          </DeliveryRoute>
        }
      >
        <Route index element={<DeliveryDashboard />} />
        <Route path="dashboard" element={<DeliveryDashboard />} />
        <Route path="orders" element={<DeliveryOrders />} />
        <Route path="tracking" element={<DeliveryTracking />} />
      </Route>

      <Route path="/wallet" element={<TradeWallet />} />
      <Route path="/wallet/claims" element={<WalletClaims />} />
      <Route path="/ratings" element={<RatingCenter />} />
    </Routes>
  );
}
