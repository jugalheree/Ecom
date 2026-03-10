import { useWishlistStore } from "../store/wishlistStore";
import { useCartStore } from "../store/cartStore";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const wishlist = useWishlistStore((s) => s.wishlist);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const addToCart = useCartStore((s) => s.addToCart);

  // ✅ EMPTY STATE (centered perfectly)
  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="container-app text-center">

          <div className="text-6xl mb-6">🤍</div>

          <h1 className="text-4xl font-display font-semibold text-ink-900">
            Your wishlist is empty
          </h1>

          <p className="text-ink-600 mt-3 text-lg">
            Save products you like and come back to them later.
          </p>

          <Link to="/market">
            <Button className="mt-8 text-base px-8 py-3">
              Browse marketplace
            </Button>
          </Link>

        </div>
      </div>
    );
  }

  // ✅ NORMAL WISHLIST GRID
  return (
    <div className="min-h-screen bg-white mt-12">
      <div className="container-app py-12">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-ink-900 mb-4">
            My wishlist
          </h1>
          <p className="text-xl text-ink-600">
            Products you’ve saved for later.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">

          {wishlist.map((p) => (
            <Card
              key={p.id}
              className="p-6 border-2 border-ink-200 hover:border-primary-300 transition"
            >
              <div className="h-40 rounded-2xl bg-ink-100 mb-4 flex items-center justify-center text-ink-400 text-sm">
                Image
              </div>

              <h3 className="font-semibold text-ink-900 leading-snug line-clamp-2">
                {p.name}
              </h3>

              <p className="text-sm text-ink-600 mt-2">
                AI {p.ai} • ₹{p.price}
              </p>

              <div className="flex gap-3 mt-5">
                <Button
                  onClick={() => addToCart(p)}
                  className="flex-1 text-sm py-3"
                >
                  Add to cart
                </Button>

                <Link to={`/product/${p.id}`} className="flex-1">
                  <Button variant="outline" className="w-full text-sm py-3">
                    View
                  </Button>
                </Link>
              </div>

              <button
                onClick={() => toggleWishlist(p)}
                className="block text-center text-sm text-red-500 hover:text-red-600 font-medium mt-4 w-full"
              >
                Remove from wishlist
              </button>
            </Card>
          ))}

        </div>
      </div>
    </div>
  );
}
