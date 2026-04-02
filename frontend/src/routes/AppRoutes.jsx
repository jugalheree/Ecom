import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Market from "../pages/buyer/Market";
import ProductDetail from "../pages/ProductDetail";
import SearchResults from "../pages/SearchResults";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Profile from "../pages/Profile";
import BuyerDashboard from "../pages/buyer/BuyerDashboard";
import VendorDashboard from "../pages/vendor/VendorDashboard";
import ProtectedRoute from "./ProtectedRoute";
import BuyerRoute from "./BuyerRoute";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import VendorProducts from "../pages/vendor/VendorProducts";
import VendorStock from "../pages/vendor/VendorStock";
import VendorTrade from "../pages/vendor/VendorTrade";
import VendorPayout from "../pages/vendor/VendorPayout";
import VendorReports from "../pages/vendor/VendorReports";
import VendorSetup from "../pages/vendor/VendorSetup";
import Wishlist from "../pages/Wishlist";
import BuyerOrders from "../pages/user/BuyerOrders";
import BuyerOrderDetail from "../pages/user/BuyerOrderDetail";
import TradeWallet from "../pages/wallet/TradeWallet";
import WalletClaims from "../pages/wallet/WalletClaims";
import Referral from "../pages/Referral";
import RatingCenter from "../pages/ratings/RatingCenter";
import VendorLayout from "../components/layout/VendorLayout";
import AdminRoute from "./AdminRoute";
import DeliveryRoute from "./DeliveryRoute";
import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminClaims from "../pages/admin/AdminClaims";
import AdminVendors from "../pages/admin/AdminVendors";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminDelivery from "../pages/admin/AdminDelivery";
import AdminCoupons from "../pages/admin/AdminCoupons";
import DeliveryLayout from "../components/layout/DeliveryLayout";
import DeliveryDashboard from "../pages/delivery/DeliveryDashboard";
import DeliveryOrders from "../pages/delivery/DeliveryOrders";
import DeliveryTracking from "../pages/delivery/DeliveryTracking";
import AddProduct from "../pages/vendor/AddProduct";
import EditProduct from "../pages/vendor/EditProduct";
import VendorPage from "../pages/public/VendorPage";
import VendorReturns from "../pages/vendor/VendorReturns";
import VendorDelivery from "../pages/vendor/VendorDelivery";
import VendorOrders from "../pages/vendor/VendorOrders";
import VendorOrderDetail from "../pages/vendor/VendorOrderDetail";
import VendorMarketplace from "../pages/vendor/VendorMarketplace";
import VendorRatings from "../pages/vendor/VendorRatings";
import VendorDeals from "../pages/vendor/VendorDeals";
import Wallet from "../pages/Wallet";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<Home />} />
      <Route path="/market" element={<Market />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/vendor/:vendorId" element={<VendorPage />} />

      {/* ── Buyer (vendors/admins redirected away) ── */}
      <Route path="/buyer/dashboard" element={<BuyerRoute><BuyerDashboard /></BuyerRoute>} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<BuyerRoute><Checkout /></BuyerRoute>} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/orders" element={<BuyerRoute><BuyerOrders /></BuyerRoute>} />
      <Route path="/orders/:id" element={<BuyerRoute><BuyerOrderDetail /></BuyerRoute>} />
      <Route path="/wallet" element={<BuyerRoute><Wallet /></BuyerRoute>} />
      <Route path="/wallet/trade" element={<BuyerRoute><TradeWallet /></BuyerRoute>} />
      <Route path="/wallet/claims" element={<BuyerRoute><WalletClaims /></BuyerRoute>} />
      <Route path="/referral" element={<BuyerRoute><Referral /></BuyerRoute>} />
      <Route path="/ratings" element={<BuyerRoute><RatingCenter /></BuyerRoute>} />

      {/* ── Vendor ── */}
      <Route path="/vendor/setup" element={<VendorSetup />} />
      <Route
        path="/vendor"
        element={
          <ProtectedRoute role="vendor">
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<VendorDashboard />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="products" element={<VendorProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="stock" element={<VendorStock />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="orders/:id" element={<VendorOrderDetail />} />
        <Route path="returns" element={<VendorReturns />} />
        <Route path="delivery" element={<VendorDelivery />} />
        <Route path="trade" element={<VendorTrade />} />
        <Route path="reports" element={<VendorReports />} />
        <Route path="marketplace" element={<VendorMarketplace />} />
        <Route path="ratings" element={<VendorRatings />} />
        <Route path="deals" element={<VendorDeals />} />
        <Route path="payout" element={<VendorPayout />} />
      </Route>

      {/* ── Admin ── */}
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
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="delivery" element={<AdminDelivery />} />
        <Route path="coupons" element={<AdminCoupons />} />
      </Route>

      {/* ── Delivery ── */}
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

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}