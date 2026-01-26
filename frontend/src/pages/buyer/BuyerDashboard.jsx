import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useOrderStore } from "../../store/orderStore";
import { useWalletStore } from "../../store/walletStore";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function BuyerDashboard() {
  const { user } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const wishlist = useWishlistStore((s) => s.wishlist);
  const orders = useOrderStore((s) => s.orders);
  const wallet = useWalletStore((s) => s.balance);

  const navigate = useNavigate();

  return (
    <div className="container-app py-10 grid lg:grid-cols-[1fr_320px] gap-8">

      {/* LEFT MAIN */}
      <div className="space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-slate-600 mt-1">
            Here’s what’s happening with your account.
          </p>
        </div>

        {/* STATS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card>
            <p className="text-slate-500 text-sm">Wallet balance</p>
            <h2 className="text-2xl font-bold mt-1">₹{wallet}</h2>
          </Card>

          <Card>
            <p className="text-slate-500 text-sm">My orders</p>
            <h2 className="text-2xl font-bold mt-1">{orders.length}</h2>
          </Card>

          <Card>
            <p className="text-slate-500 text-sm">Wishlist</p>
            <h2 className="text-2xl font-bold mt-1">{wishlist.length}</h2>
          </Card>

          <Card>
            <p className="text-slate-500 text-sm">Cart items</p>
            <h2 className="text-2xl font-bold mt-1">{cart.length}</h2>
          </Card>
        </div>

        {/* RECENT / EMPTY STATE */}
        <Card>
          <h3 className="text-lg font-semibold">Recent orders</h3>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              You haven’t placed any orders yet.
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {orders.slice(0, 3).map((o, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>Order #{i + 1}</span>
                  <span className="font-medium">₹{o.total}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* RECOMMENDED */}
        <div>
          <h2 className="text-xl font-semibold">Recommended for you</h2>
          <p className="text-slate-500 text-sm">
            Trending and AI-verified products.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-32 flex items-center justify-center text-slate-400">
                Product card
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="space-y-6 sticky top-24 h-fit">

        {/* PROFILE */}
        <Card className="text-center">
          <div className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto text-xl font-bold">
            {user?.name?.charAt(0)}
          </div>
          <h3 className="mt-3 font-semibold">{user?.name}</h3>
          <p className="text-sm text-slate-500">Buyer account</p>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="space-y-3">
          <h3 className="font-semibold">Quick actions</h3>

          <Button className="w-full" onClick={() => navigate("/market")}>
            Explore marketplace
          </Button>

          <Button variant="outline" className="w-full" onClick={() => navigate("/cart")}>
            View cart
          </Button>

          <Button variant="outline" className="w-full" onClick={() => navigate("/wishlist")}>
            Wishlist
          </Button>

          <Button variant="outline" className="w-full" onClick={() => navigate("/orders")}>
            My orders
          </Button>

          <Button variant="outline" className="w-full" onClick={() => navigate("/wallet")}>
            Wallet
          </Button>
        </Card>

        {/* WALLET SHORTCUT */}
        <Card>
          <p className="text-sm text-slate-500">Available balance</p>
          <h2 className="text-2xl font-bold mt-1">₹{wallet}</h2>

          <Button
            className="w-full mt-3"
            onClick={() => navigate("/wallet")}
          >
            Manage wallet
          </Button>
        </Card>
      </div>
    </div>
  );
}
