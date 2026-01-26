import { Link, useNavigate } from "react-router-dom";
import Card from "../ui/Card";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

export default function ProductCard({ product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const navigate = useNavigate();

  const wishlist = useWishlistStore((s) => s.wishlist);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const isWishlisted = wishlist.some((p) => p.id === product.id);

  const handleBuyNow = () => {
    addToCart(product);
    navigate("/checkout");
  };

  return (
    <Card className="p-3 hover:shadow-md transition relative">

      {/* WISHLIST ICON */}
      <button
        onClick={() => toggleWishlist(product)}
        className="absolute top-3 right-3 text-lg"
        title="Add to wishlist"
      >
        {isWishlisted ? "❤️" : "🤍"}
      </button>

      {/* IMAGE */}
      <div className="h-36 rounded-lg bg-slate-100 mb-2 flex items-center justify-center text-slate-400 text-xs">
        Image
      </div>

      {/* INFO */}
      <h3 className="font-medium text-sm leading-snug line-clamp-2">
        {product.name}
      </h3>

      <p className="text-xs text-slate-500 mt-0.5">
        AI {product.ai} • ₹{product.price}
      </p>

      {/* ACTIONS */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => addToCart(product)}
          className="flex-1 text-xs font-medium py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition"
        >
          Add
        </button>

        <button
          onClick={handleBuyNow}
          className="flex-1 text-xs py-2 rounded-md border hover:bg-slate-50 transition"
        >
          Buy
        </button>
      </div>

      <Link
        to={`/product/${product.id}`}
        className="block text-center text-[11px] text-slate-500 hover:text-slate-800 mt-2"
      >
        View
      </Link>
    </Card>
  );
}
