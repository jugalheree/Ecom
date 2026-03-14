import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marketplaceAPI } from "../services/apis/index";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addToCart);
  const showToast = useToastStore((s) => s.showToast);

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    setLoading(true);
    marketplaceAPI.getProductDetails(id)
      .then((res) => {
        const data = res.data?.data;
        setProduct(data?.product || null);
        setVendor(data?.vendor || null);
        setAttributes(data?.attributes || []);
        // Build image list: primary first, then rest
        const imgs = [];
        if (data?.primaryImage?.imageUrl) imgs.push(data.primaryImage);
        (data?.images || []).forEach((img) => {
          if (!imgs.find((i) => i.imageUrl === img.imageUrl)) imgs.push(img);
        });
        setImages(imgs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
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
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? "border-primary-500 shadow-sm" : "border-ink-200 hover:border-ink-400"
                    }`}>
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

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
              </div>
            )}

            <p className="text-3xl font-display font-bold text-ink-900 mb-5">₹{product.price?.toLocaleString()}</p>

            {/* Stock */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-display font-bold px-2.5 py-1 rounded-lg border ${stockInfo.color}`}>{stockInfo.label}</span>
              </div>
              <div className="w-full h-1.5 bg-ink-100 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500" style={{ width: `${stockInfo.bar}%` }} />
              </div>
              <p className="text-xs text-ink-400">{stockInfo.msg}</p>
            </div>

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
              </div>
              {product.minOrderQty > 1 && (
                <span className="text-xs text-ink-400">Min. {product.minOrderQty}</span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={stock === 0 || addingToCart}
                className="flex-1 bg-ink-900 text-white font-display font-semibold py-3.5 rounded-xl hover:bg-ink-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-sm"
              >
                {addingToCart ? "Adding..." : "Add to cart"}
              </button>
            </div>
          </div>
        </div>

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
