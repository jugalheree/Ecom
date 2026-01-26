import { useWishlistStore } from "../store/wishlistStore";
import { useCartStore } from "../store/cartStore";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const wishlist = useWishlistStore((s) => s.wishlist);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const addToCart = useCartStore((s) => s.addToCart);

  // EMPTY STATE
  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Your wishlist is empty 🤍</h1>
        <p className="text-slate-600 mt-2">
          Save products you like and come back to them later.
        </p>

        <Link to="/market">
          <Button className="mt-6">Browse marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">
          My wishlist
        </h1>
        <p className="text-slate-600 mt-2">
          Products you’ve saved for later.
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

        {wishlist.map((p) => (
          <Card key={p.id} className="p-3 hover:shadow-md transition">

            {/* IMAGE */}
            <div className="h-32 rounded-lg bg-slate-100 mb-2 flex items-center justify-center text-slate-400 text-xs">
              Image
            </div>

            {/* INFO */}
            <h3 className="font-medium text-sm leading-snug line-clamp-2">
              {p.name}
            </h3>

            <p className="text-xs text-slate-500 mt-0.5">
              AI {p.ai} • ₹{p.price}
            </p>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-3">

              <button
                onClick={() => addToCart(p)}
                className="flex-1 text-xs py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Add
              </button>

              <Link
                to={`/product/${p.id}`}
                className="flex-1 text-xs py-2 rounded-md border text-center hover:bg-slate-50 transition"
              >
                View
              </Link>

            </div>

            <button
              onClick={() => toggleWishlist(p)}
              className="block text-center text-[11px] text-red-500 hover:underline mt-2 w-full"
            >
              Remove
            </button>

          </Card>
        ))}

      </div>
    </div>
  );
}
