import { useEffect, useState } from "react";
<<<<<<< HEAD
import { useParams, useNavigate } from "react-router-dom";
import { marketplaceAPI } from "../services/apis/index";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";
=======
import { useParams, useNavigate, Link } from "react-router-dom";
import { marketplaceAPI } from "../services/apis/index";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";
import { useWishlistStore } from "../store/wishlistStore";
import ProductCard from "../components/product/ProductCard";
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addToCart);
  const showToast = useToastStore((s) => s.showToast);
<<<<<<< HEAD
=======
  const { wishlist, toggleWishlist } = useWishlistStore();
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    setLoading(true);
=======
  const [adding, setAdding] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [tab, setTab] = useState("desc");

  const isWishlisted = wishlist?.some((w) => w._id === id);

  useEffect(() => {
    setLoading(true); setSimilar([]); setActiveImage(0);
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0
    marketplaceAPI.getProductDetails(id)
      .then((res) => {
        const data = res.data?.data;
        setProduct(data?.product || null);
        setVendor(data?.vendor || null);
        setAttributes(data?.attributes || []);
<<<<<<< HEAD
        // Build image list: primary first, then rest
        const imgs = [];
        if (data?.primaryImage?.imageUrl) imgs.push(data.primaryImage);
        (data?.images || []).forEach((img) => {
          if (!imgs.find((i) => i.imageUrl === img.imageUrl)) imgs.push(img);
        });
=======
        const imgs = [];
        if (data?.primaryImage?.imageUrl) imgs.push(data.primaryImage);
        (data?.images || []).forEach((img) => { if (!imgs.find((i) => i.imageUrl === img.imageUrl)) imgs.push(img); });
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0
        setImages(imgs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
<<<<<<< HEAD
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const result = await addToCart(product._id, quantity);
    setAddingToCart(false);
    if (result?.success !== false) showToast({ message: "Added to cart!", type: "success" });
    else showToast({ message: result.message || "Failed to add to cart", type: "error" });
  };

  if (loading) return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center mt-[72px]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-ink-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-display font-semibold uppercase tracking-widest text-ink-400">Loading</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center mt-[72px]">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-display font-bold text-ink-900 mb-2">Product not found</h2>
        <button onClick={() => navigate("/market")} className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
          ← Back to marketplace
        </button>
      </div>
    </div>
  );

  const stock = product.stock ?? 0;
  const stockInfo =
    stock === 0
      ? { label: "Out of Stock", color: "text-red-600 bg-red-50 border-red-200", bar: 0, msg: "Currently unavailable." }
      : stock <= 5
      ? { label: "Low Stock", color: "text-amber-600 bg-amber-50 border-amber-200", bar: 25, msg: `Only ${stock} left — order soon.` }
      : stock <= 15
      ? { label: "Limited Availability", color: "text-yellow-600 bg-yellow-50 border-yellow-200", bar: 50, msg: "Selling fast." }
      : { label: "In Stock", color: "text-emerald-600 bg-emerald-50 border-emerald-200", bar: 100, msg: "Available for immediate purchase." };

  return (
    <div className="min-h-screen bg-ink-50 mt-[72px]">
      <div className="container-app py-10">
        <button onClick={() => navigate("/market")} className="text-xs font-display font-semibold text-ink-400 hover:text-ink-700 mb-6 flex items-center gap-1.5 transition-colors">
          ← Back to marketplace
        </button>
=======
    marketplaceAPI.getSimilarProducts(id).then((res) => setSimilar(res.data?.data || [])).catch(() => {});
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    const result = await addToCart(product._id, quantity);
    setAdding(false);
    if (result?.success !== false) showToast({ message: "Added to cart!", type: "success" });
    else showToast({ message: result?.message || "Failed to add to cart", type: "error" });
  };

  const discount = product?.originalPrice && product?.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 py-10">
        <div className="container-app">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-6 w-1/3 rounded" />
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-5 w-1/4 rounded" />
              <div className="skeleton h-10 w-full rounded-xl mt-4" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-display font-bold text-ink-900">Product not found</h2>
          <Link to="/market"><button className="btn-primary mt-6 px-8 py-3">Browse Marketplace</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-ink-100">
        <div className="container-app py-3 text-xs text-ink-400 flex items-center gap-2">
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/market" className="hover:text-brand-600 transition-colors">Marketplace</Link>
          <span>/</span>
          <span className="text-ink-600 font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0

      <div className="container-app py-8">
        <div className="grid md:grid-cols-2 gap-10">

          {/* Images */}
<<<<<<< HEAD
          <div>
            <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden aspect-square flex items-center justify-center">
              {images.length > 0 ? (
                <img src={images[activeImage]?.imageUrl} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-ink-50">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d1d6" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                  <span className="text-xs text-ink-300 font-medium">No image available</span>
                </div>
=======
          <div className="space-y-3">
            <div className="relative bg-white rounded-2xl border border-ink-100 overflow-hidden aspect-square">
              {images.length > 0 ? (
                <img src={images[activeImage]?.imageUrl} alt={product.name} className="w-full h-full object-contain p-4" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl text-ink-200">🛍️</div>
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0
              )}
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">-{discount}%</span>
              )}
              <button onClick={() => { toggleWishlist(product); showToast({ message: isWishlisted ? "Removed from wishlist" : "Added to wishlist!", type: "success" }); }}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center hover:scale-110 transition-transform border border-ink-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "#f05f00" : "none"} stroke={isWishlisted ? "#f05f00" : "#8e8e9a"} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
            {images.length > 1 && (
<<<<<<< HEAD
              <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? "border-primary-500 shadow-sm" : "border-ink-200 hover:border-ink-400"
=======
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl border-2 flex-shrink-0 overflow-hidden bg-white transition-all ${
                      activeImage === i ? "border-brand-500 shadow-brand" : "border-ink-200 hover:border-ink-400"
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0
                    }`}>
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* Info */}
          <div className="bg-white rounded-2xl border border-ink-200 p-8">
            <div className="mb-4">
              {vendor && (
                <p
                  className="text-xs font-display font-semibold text-ink-400 mb-2 cursor-pointer hover:text-primary-600 transition-colors"
                  onClick={() => navigate(`/vendor/${product.vendorId}`)}
                >
                  {vendor.shopName} →
                </p>
              )}
              <h1 className="text-2xl font-display font-bold text-ink-900 leading-snug">{product.title}</h1>
            </div>

            {product.saleType && (
              <div className="mb-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                  product.saleType === "B2B"
                    ? "text-blue-700 bg-blue-50 border-blue-200"
                    : product.saleType === "BOTH"
                    ? "text-purple-700 bg-purple-50 border-purple-200"
                    : "text-ink-600 bg-ink-50 border-ink-200"
                }`}>
                  {product.saleType}
                </span>
=======
          {/* Details */}
          <div className="space-y-5">
            {product.category?.name && (
              <span className="badge-brand text-xs">{product.category.name}</span>
            )}
            <h1 className="text-2xl font-display font-bold text-ink-900 leading-snug">{product.name}</h1>

            {/* Rating */}
            {product.avgRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.round(product.avgRating) ? "#ff7d07" : "#d9d9de"} stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-ink-500">{product.avgRating?.toFixed(1)} ({product.reviewCount || 0} reviews)</span>
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-ink-900">₹{product.price?.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-base text-ink-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
                  <span className="badge-brand text-xs">{discount}% off</span>
                </>
              )}
            </div>

            {/* Stock */}
            {product.stock > 0 ? (
              <p className="text-sm text-success-600 font-medium flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                In Stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-sm text-danger-500 font-medium">Out of Stock</p>
            )}

<<<<<<< HEAD
            <p className="text-sm text-ink-600 leading-relaxed mb-6">{product.description}</p>

            {/* Delivery info */}
            {product.minDeliveryDays && (
              <p className="text-xs text-ink-500 mb-5">
                🚚 Delivered in {product.minDeliveryDays}–{product.maxDeliveryDays} days
              </p>
            )}

            {/* Qty */}
            <div className="flex items-center gap-3 mb-6">
              <p className="text-xs font-display font-bold uppercase tracking-widest text-ink-400">Qty</p>
              <div className="flex items-center border border-ink-200 rounded-xl overflow-hidden bg-ink-50">
                <button onClick={() => setQuantity((q) => Math.max(product.minOrderQty || 1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-ink-200 transition text-ink-600 text-lg">−</button>
                <span className="w-10 text-center font-display font-bold text-ink-900 text-sm">{quantity}</span>
                <button onClick={() => setQuantity((q) => q < stock ? q + 1 : q)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-ink-200 transition text-ink-600 text-lg">+</button>
=======
            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-ink-700">Quantity</span>
              <div className="flex items-center border border-ink-200 rounded-xl overflow-hidden bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3.5 py-2 text-ink-500 hover:bg-ink-50 text-lg transition-colors">−</button>
                <span className="px-4 py-2 text-sm font-semibold text-ink-900 min-w-[36px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3.5 py-2 text-ink-500 hover:bg-ink-50 text-lg transition-colors">+</button>
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0
              </div>
              {product.minOrderQty > 1 && (
                <span className="text-xs text-ink-400">Min. {product.minOrderQty}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
<<<<<<< HEAD
              <button
                onClick={handleAddToCart}
                disabled={stock === 0 || addingToCart}
                className="flex-1 bg-ink-900 text-white font-display font-semibold py-3.5 rounded-xl hover:bg-ink-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-sm"
              >
                {addingToCart ? "Adding..." : "Add to cart"}
=======
              <button onClick={handleAddToCart} disabled={adding || product.stock === 0}
                className="btn-primary flex-1 py-3.5 text-base">
                {adding ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : "Add to Cart"}
              </button>
              <button onClick={() => navigate("/checkout")} disabled={product.stock === 0}
                className="btn-outline flex-1 py-3.5 text-base">
                Buy Now
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0
              </button>
            </div>

            {/* Vendor */}
            {vendor && (
              <div className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-400 to-navy-600 text-white flex items-center justify-center font-bold text-sm">
                  {vendor.businessName?.[0] || "V"}
                </div>
                <div>
                  <p className="text-xs text-ink-400">Sold by</p>
                  <p className="font-semibold text-ink-900 text-sm">{vendor.businessName}</p>
                  {vendor.aiScore > 0 && <p className="text-xs text-brand-600">🤖 AI Score: {vendor.aiScore}/100</p>}
                </div>
              </div>
            )}

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🔒", label: "Secure Payment" },
                { icon: "↩️", label: "Easy Returns" },
                { icon: "🚚", label: "Fast Delivery" },
              ].map((b, i) => (
                <div key={i} className="bg-sand-50 rounded-xl p-3 text-center">
                  <span className="text-xl">{b.icon}</span>
                  <p className="text-xs text-ink-500 mt-1 font-medium">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Specifications */}
        {attributes.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-ink-200 p-8">
            <h2 className="font-display font-bold text-ink-900 mb-5">Product Specifications</h2>
            <div className="border border-ink-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {attributes.map((attr, i) => (
                    <tr key={attr._id || i} className={i % 2 === 0 ? "bg-ink-50" : "bg-white"}>
                      <td className="px-5 py-3.5 font-display font-semibold text-ink-700 w-1/3">
                        {attr.attributeCode}
                      </td>
                      <td className="px-5 py-3.5 text-ink-900">{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
=======
        {/* Tabs */}
        <div className="mt-12 card overflow-hidden">
          <div className="border-b border-ink-100 flex">
            {["desc", "specs", "reviews"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-4 text-sm font-semibold capitalize transition-all border-b-2 ${
                  tab === t ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-900"
                }`}>
                {t === "desc" ? "Description" : t === "specs" ? "Specifications" : "Reviews"}
              </button>
            ))}
          </div>
          <div className="p-6">
            {tab === "desc" && (
              <p className="text-ink-600 leading-relaxed text-sm">{product.description || "No description available."}</p>
            )}
            {tab === "specs" && (
              <div className="space-y-2">
                {attributes.length === 0 ? (
                  <p className="text-ink-400 text-sm">No specifications available.</p>
                ) : attributes.map((a, i) => (
                  <div key={i} className={`flex items-start gap-4 py-2.5 ${i !== 0 ? "border-t border-ink-100" : ""}`}>
                    <span className="w-32 flex-shrink-0 text-xs font-semibold text-ink-400 uppercase tracking-wide">{a.attribute?.name || a.name}</span>
                    <span className="text-sm text-ink-900">{a.value}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "reviews" && (
              <p className="text-ink-400 text-sm">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-ink-900">Similar Products</h2>
              <Link to="/market" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {similar.slice(0, 5).map((p) => <ProductCard key={p._id} product={p} />)}
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
