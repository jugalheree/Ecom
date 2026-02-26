import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useOrderStore } from "../../store/orderStore";
import { useWalletStore } from "../../store/walletStore";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import TrustCard from "../../components/trust/TrustCard";
import OrdersChart from "../../components/charts/OrdersChart";

const SPENDING_DATA = [
  { month: "Sep", orders: 3 },
  { month: "Oct", orders: 5 },
  { month: "Nov", orders: 4 },
  { month: "Dec", orders: 7 },
  { month: "Jan", orders: 6 },
  { month: "Feb", orders: 4 },
];

export default function BuyerDashboard() {
  const { user } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const wishlist = useWishlistStore((s) => s.wishlist);
  const orders = useOrderStore((s) => s.orders);
  const wallet = useWalletStore((s) => s.balance);

  const navigate = useNavigate();

  const statCards = [
    { label: "Wallet balance", value: `₹${wallet}`, icon: "💰", gradient: "from-emerald-500 to-emerald-600" },
    { label: "My orders", value: orders.length, icon: "📦", gradient: "from-blue-500 to-blue-600" },
    { label: "Wishlist", value: wishlist.length, icon: "❤️", gradient: "from-pink-500 to-pink-600" },
    { label: "Cart items", value: cart.length, icon: "🛒", gradient: "from-primary-500 to-primary-600" },
  ];

  return (
    <div className="min-h-screen bg-white mt-16">
      <div className="container-app py-12 space-y-10">

        {/* HEADER */}
        <div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-4">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-xl text-stone-600">
            Here’s what’s happening with your account.
          </p>
        </div>

        {/* STATS GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statCards.map((stat, i) => (
            <Card key={i} className="p-8 border-2 border-stone-200 group hover:border-primary-300 transition">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition`}>
                {stat.icon}
              </div>
              <p className="text-sm text-stone-600 font-medium uppercase tracking-wide mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-stone-900">
                {stat.value}
              </p>
            </Card>
          ))}
        </div>

        {/* TRUST + PERFORMANCE */}
        <div className="grid md:grid-cols-3 gap-8">
          <TrustCard title="Buyer rating" rating={4.7} reviews={56} badge="Reliable buyer" />

          <Card className="p-8 border-2 border-stone-200">
            <p className="text-sm text-stone-600 uppercase tracking-wide mb-2">
              Orders completed
            </p>
            <p className="text-4xl font-bold text-stone-900">42</p>
          </Card>

          <Card className="p-8 border-2 border-stone-200">
            <p className="text-sm text-stone-600 uppercase tracking-wide mb-2">
              Wishlist items
            </p>
            <p className="text-4xl font-bold text-stone-900">11</p>
          </Card>
        </div>

        {/* ORDER CHART */}
        <Card className="p-10 border-2 border-stone-200">
          <h3 className="text-2xl font-semibold text-stone-900 mb-2">
            Order activity
          </h3>
          <p className="text-stone-600 mb-6">
            Orders placed per month
          </p>
          <OrdersChart data={SPENDING_DATA} />
        </Card>

        {/* RECENT ORDERS */}
        <Card className="p-10 border-2 border-stone-200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-semibold text-stone-900 mb-2">
                Recent orders
              </h3>
              <p className="text-stone-600">
                Your latest transactions
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/orders")}>
              View all
            </Button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-lg text-stone-600">
                You haven’t placed any orders yet.
              </p>
              <Button className="mt-6" onClick={() => navigate("/market")}>
                Start shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((o, i) => (
                <div key={i} className="flex justify-between items-center p-5 border-2 border-stone-200 rounded-xl hover:border-primary-300 transition">
                  <div>
                    <p className="font-semibold text-stone-900">
                      Order #{i + 1}
                    </p>
                    <p className="text-sm text-stone-600 mt-1">
                      Completed
                    </p>
                  </div>
                  <p className="text-xl font-bold text-stone-900">
                    ₹{o.total}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* RECOMMENDED */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-stone-900 mb-2">
                Recommended for you
              </h2>
              <p className="text-stone-600">
                Trending and AI-verified products
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/market")}>
              View all
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-48 flex items-center justify-center text-stone-400 border-2 border-stone-200 hover:border-primary-300 transition cursor-pointer group">
                <div className="text-center">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition">
                    🛍️
                  </div>
                  <p className="text-sm font-medium">
                    Product card
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
