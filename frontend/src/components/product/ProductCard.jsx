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
    <Card className="p-5 overflow-hidden group relative border-2 border-stone-200 hover:border-primary-300 transition-all duration-300 hover:-translate-y-1">
      <button
        onClick={() => toggleWishlist(product)}
        className="absolute top-4 right-4 text-xl z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg hover:scale-110 transition-transform duration-300 border-2 border-stone-200 hover:border-primary-300"
        title="Add to wishlist"
      >
        {isWishlisted ? "❤️" : "🤍"}
      </button>

      <div className="h-48 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 mb-4 flex items-center justify-center text-stone-400 text-sm group-hover:from-primary-50 group-hover:to-primary-100 transition-all duration-300 border-2 border-stone-200">
        <img
          src={
            product.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1714578187218-d1828f5ebd6e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGxhY2Vob2xkZXIlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D"
          }
          alt={product.name}
        />
      </div>

      <h3 className="font-semibold text-base leading-snug line-clamp-2 text-stone-900 mb-2">
        {product.name}
      </h3>

      <p className="text-xs text-stone-500 mb-2">
        Sold by {product.vendorName}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-stone-500 mb-1">AI Score</p>
          <p className="text-lg font-bold text-stone-900">{product.ai}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-500 mb-1">Price</p>
          <p className="text-lg font-bold text-stone-900">₹{product.price}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => addToCart(product)}
          className="flex-1 text-sm font-semibold py-3 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-all duration-300 active:scale-[0.98]"
        >
          Add to cart
        </button>

        <button
          onClick={handleBuyNow}
          className="flex-1 text-sm font-semibold py-3 rounded-xl border-2 border-stone-300 hover:bg-stone-50 hover:border-stone-400 transition-all duration-300 active:scale-[0.98]"
        >
          Buy now
        </button>
      </div>

      <Link
        to={`/product/${product.id}`}
        className="block text-center text-sm text-primary-600 hover:text-primary-700 font-semibold"
      >
        View details →
      </Link>
    </Card>
  );
}
