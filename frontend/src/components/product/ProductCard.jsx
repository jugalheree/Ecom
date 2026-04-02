import { Link } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useToastStore } from "../../store/toastStore";
import { useState } from "react";
import ProductScoreBadge from "./ProductScoreBadge";

export default function ProductCard({ product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const { isWishlisted, toggleWishlist } = useWishlistStore();
  const showToast = useToastStore((s) => s.showToast);
  const [adding, setAdding] = useState(false);

  if (!product) return null;

  const wishlisted = isWishlisted(product._id);
  const imageUrl = product.image || product.primaryImage?.imageUrl || product.imageUrl || null;
  const productName = product.title || product.name || "Product";

  // Effective price from backend (accounts for vendor + festival discounts)
  const effectivePrice = product.effectivePrice ?? product.price;
  const discountPercent = product.totalDiscountPercent || 0;
  const hasDiscount = discountPercent > 0 && effectivePrice < product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      const productData = {
        title: productName,
        price: effectivePrice,
        imageUrl,
        vendor: product.vendor || product.vendorId?.shopName || "",
      };
      const res = await addToCart(product._id, 1, productData);
      if (res?.success !== false) showToast({ message: "Added to cart!", type: "success" });
      else showToast({ message: res?.message || "Failed to add", type: "error" });
    } catch {
      showToast({ message: "Failed to add to cart", type: "error" });
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleWishlist(product);
    const added = result === true || result === null; // null means optimistic
    showToast({ message: wishlisted ? "Removed from wishlist" : "Added to wishlist!", type: "success" });
  };

  return (
    <Link to={`/product/${product._id}`} className="group block">
      <div className="card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">

        {/* Image */}
        <div className="relative overflow-hidden bg-sand-100 aspect-square">
          {imageUrl ? (
            <img src={imageUrl} alt={productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-ink-300 bg-sand-100">🛍️</div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <span className="absolute top-2.5 left-2.5 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              -{discountPercent}%
            </span>
          )}

          {/* Festival badge */}
          {product.festivalDiscountPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
              🎉 -{discountPercent}%
            </span>
          )}

          {/* Wishlist */}
          <button onClick={handleWishlist}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center hover:scale-110 transition-transform">
            <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlisted ? "#f05f00" : "none"} stroke={wishlisted ? "#f05f00" : "#8e8e9a"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          {/* AI verified badge */}
          {product.aiVerified && (
            <span className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur text-[10px] font-semibold text-navy-700 px-2 py-0.5 rounded-full border border-navy-200 flex items-center gap-1">
              🤖 AI Verified
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5">
          <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mb-1">
            {product.category?.name || product.categoryId?.name || "Product"}
          </p>
          <h3 className="text-sm font-semibold text-ink-900 line-clamp-2 leading-snug">{productName}</h3>

          {/* Score badge — shows aiScore + ratingScore combined */}
          {(product.aiScore > 0 || product.ratingScore > 0 || product.avgRating > 0) && (
            <div className="mt-1.5">
              <ProductScoreBadge
                aiScore={product.aiScore || 0}
                ratingScore={product.ratingScore || (product.avgRating ? (product.avgRating / 5) * 2.5 : 0)}
                reviewCount={product.reviewCount || 0}
                size="sm"
              />
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-bold text-ink-900">₹{effectivePrice?.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-xs text-ink-400 line-through">₹{product.price?.toLocaleString()}</span>
            )}
          </div>

          {/* Stock warning */}
          {product.stock === 0 ? (
            <p className="text-xs font-semibold text-danger-500 mt-1">Out of stock</p>
          ) : product.stock <= 5 && (
            <p className="text-xs font-semibold text-amber-500 mt-1">Only {product.stock} left</p>
          )}

          {/* Add to cart */}
          <button onClick={handleAddToCart} disabled={adding || product.stock === 0}
            className="w-full mt-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200
              bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-600 hover:text-white hover:border-brand-600
              disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]">
            {adding ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-brand-300 border-t-white rounded-full animate-spin" />
                Adding...
              </span>
            ) : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}
