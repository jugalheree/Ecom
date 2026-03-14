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
  const scoreColor = score >= 80 ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : score >= 60 ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-ink-500 bg-ink-50 border-ink-200";
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group bg-white rounded-2xl border border-ink-100 hover:border-ink-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden">
        <div className="h-48 bg-ink-50">
          <img
            src={product.image || product.images?.[0]?.url || product.primaryImage?.imageUrl || "https://images.unsplash.com/photo-1714578187218-d1828f5ebd6e?w=400&auto=format&fit=crop&q=60"}
            alt={product.title || product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
          />
        </div>
        {/* Actions overlay */}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm shadow-sm border border-ink-100 hover:scale-110 transition-transform duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={isWishlisted ? "text-red-500" : "text-ink-400"} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        {/* AI Score */}
        {score != null && (
          <div className={`absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-display font-bold border ${scoreColor}`}>
            ★ {score}
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/60 text-white text-xs font-display font-bold px-3 py-1 rounded-lg backdrop-blur-sm">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-medium text-ink-400 mb-1 truncate uppercase tracking-wider">
          {product.vendorId?.shopName || product.vendorName || "Verified Vendor"}
        </p>
        <h3 className="font-display font-semibold text-sm text-ink-900 line-clamp-2 mb-3 flex-1 leading-snug">
          {product.title || product.name}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <p className="text-xl font-display font-bold text-ink-900">₹{product.price?.toLocaleString()}</p>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg font-bold">
              {product.stock} left
            </span>
          )}
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => addToCart(product._id || product.id, 1)}
            disabled={isOutOfStock}
            className="flex-1 text-[11px] font-display font-semibold py-2.5 rounded-xl bg-ink-900 text-white hover:bg-ink-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            Add to cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 text-[11px] font-display font-semibold py-2.5 rounded-xl border border-ink-200 text-ink-700 hover:border-ink-300 hover:bg-ink-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            Buy now
          </button>
        </div>

        <Link
          to={`/product/${product._id || product.id}`}
          className="text-center text-[11px] font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          View details →
        </Link>
      </div>
    </div>
  );
}
