import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

export default function ProductCard({ product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const navigate = useNavigate();
  const wishlist = useWishlistStore((s) => s.wishlist);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = wishlist.some((p) => (p._id || p.id) === (product._id || product.id));

  const handleBuyNow = async () => {
    await addToCart(product._id || product.id, 1);
    navigate("/checkout");
  };

  const score = product.aiScore ?? product.ai;
  const scoreColor = score >= 80 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : score >= 60 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-ink-500 bg-ink-50 border-ink-200";

  return (
    <div className="group bg-white rounded-2xl border-2 border-ink-100 hover:border-primary-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-ink-50 to-ink-100 overflow-hidden">
          <img
            src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1714578187218-d1828f5ebd6e?w=400&auto=format&fit=crop&q=60"}
            alt={product.title || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        {/* Wishlist btn */}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm shadow-sm border border-ink-100 hover:scale-110 transition-transform duration-200"
        >
          <span className="text-base">{isWishlisted ? "❤️" : "🤍"}</span>
        </button>
        {/* AI Score badge */}
        {score != null && (
          <div className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-display font-bold border ${scoreColor}`}>
            <span>★</span>
            <span>{score}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-ink-400 font-medium mb-1 truncate">
          {product.vendorId?.shopName || product.vendorName || "Verified Vendor"}
        </p>
        <h3 className="font-display font-semibold text-sm text-ink-900 line-clamp-2 mb-3 flex-1 leading-snug">
          {product.title || product.name}
        </h3>

        <div className="flex items-center justify-between mb-4">
          <p className="text-xl font-display font-bold text-ink-900">₹{product.price?.toLocaleString()}</p>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg font-medium">
              {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg font-medium">
              Sold out
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => addToCart(product._id || product.id, 1)}
            disabled={product.stock === 0}
            className="flex-1 text-xs font-display font-semibold py-2.5 rounded-xl bg-ink-900 text-white hover:bg-ink-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            Add to cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="flex-1 text-xs font-display font-semibold py-2.5 rounded-xl border-2 border-ink-200 text-ink-700 hover:border-ink-400 hover:bg-ink-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            Buy now
          </button>
        </div>

        <Link
          to={`/product/${product._id || product.id}`}
          className="mt-3 text-center text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          View details →
        </Link>
      </div>
    </div>
  );
}
