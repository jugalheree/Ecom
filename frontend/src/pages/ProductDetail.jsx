import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { categoryAPI } from "../services/apis/index";
import { useCartStore } from "../store/cartStore";

export default function ProductDetail() {
  const { id } = useParams();
  const addToCart = useCartStore((s) => s.addToCart);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/api/products/${id}`).then((res) => {
      const p = res.data.data;
      setProduct(p);
      const catId = p?.categoryId?._id || p?.categoryId;
      if (catId) categoryAPI.getAttributes(catId).then((r) => setAttributes(r.data?.data || [])).catch(() => {});
    });
  }, [id]);

  if (!product) return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center mt-[72px]">
      <div className="text-center"><div className="w-8 h-8 border-2 border-ink-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" /><p className="text-xs font-display font-semibold uppercase tracking-widest text-ink-400">Loading</p></div>
    </div>
  );

  const stock = product.stock ?? 0;
  const stockInfo = stock === 0 ? { label: "Out of Stock", color: "text-red-600 bg-red-50 border-red-200", bar: 0, msg: "Currently unavailable." }
    : stock <= 5 ? { label: "Low Stock", color: "text-amber-600 bg-amber-50 border-amber-200", bar: 25, msg: `Only ${stock} left — order soon.` }
    : stock <= 15 ? { label: "Limited Availability", color: "text-yellow-600 bg-yellow-50 border-yellow-200", bar: 50, msg: "Selling fast." }
    : { label: "In Stock", color: "text-emerald-600 bg-emerald-50 border-emerald-200", bar: 100, msg: "Available for immediate purchase." };

  const getAttrValue = (code) => product.attributes?.find((a) => a.code === code)?.value ?? "—";

  return (
    <div className="min-h-screen bg-ink-50 mt-[72px]">
      <div className="container-app py-10">
        <button onClick={() => navigate(-1)} className="text-xs font-display font-semibold text-ink-400 hover:text-ink-700 mb-6 flex items-center gap-1.5 transition-colors">
          ← Back
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden aspect-square flex items-center justify-center">
              <img src={product.images?.[activeImage]?.url || "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=60"} alt={product.title} className="w-full h-full object-cover" />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? "border-primary-500 shadow-sm" : "border-ink-200 hover:border-ink-400"}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl border border-ink-200 p-8">
            <div className="mb-4">
              <p className="text-xs font-display font-semibold text-ink-400 mb-2 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => navigate(`/vendor/${product.vendorId?._id || product.vendorId}`)}>
                {product.vendorId?.shopName || "Verified Vendor"} →
              </p>
              <h1 className="text-2xl font-display font-bold text-ink-900 leading-snug">{product.title || product.name}</h1>
            </div>

            {(product.aiScore ?? product.ai) != null && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-display font-bold bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-1 rounded-lg">★ AI Score: {product.aiScore ?? product.ai}/100</span>
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

            {/* Qty */}
            <div className="flex items-center gap-3 mb-6">
              <p className="text-xs font-display font-bold uppercase tracking-widest text-ink-400">Qty</p>
              <div className="flex items-center border border-ink-200 rounded-xl overflow-hidden bg-ink-50">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-ink-200 transition text-ink-600 text-lg">−</button>
                <span className="w-10 text-center font-display font-bold text-ink-900 text-sm">{quantity}</span>
                <button onClick={() => setQuantity((q) => q < stock ? q + 1 : q)} className="w-10 h-10 flex items-center justify-center hover:bg-ink-200 transition text-ink-600 text-lg">+</button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => addToCart(product._id || product.id, quantity)} disabled={stock === 0}
                className="flex-1 bg-ink-900 text-white font-display font-semibold py-3.5 rounded-xl hover:bg-ink-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-sm">
                Add to cart
              </button>
              <button disabled={stock === 0}
                className="flex-1 border-2 border-ink-200 text-ink-700 font-display font-semibold py-3.5 rounded-xl hover:border-ink-400 hover:bg-ink-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-sm">
                Buy now
              </button>
            </div>
          </div>
        </div>

        {/* Specs */}
        {attributes.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-ink-200 p-8">
            <h2 className="font-display font-bold text-ink-900 mb-5">Product Specifications</h2>
            <div className="border border-ink-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {attributes.map((attr, i) => (
                    <tr key={attr.code} className={i % 2 === 0 ? "bg-ink-50" : "bg-white"}>
                      <td className="px-5 py-3.5 font-display font-semibold text-ink-700 w-1/3">
                        {attr.label}{attr.unit && <span className="text-ink-400 font-normal ml-1">({attr.unit})</span>}
                      </td>
                      <td className="px-5 py-3.5 text-ink-900">{getAttrValue(attr.code)}</td>
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
