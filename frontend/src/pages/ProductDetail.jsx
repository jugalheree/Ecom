import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCartStore } from "../store/cartStore";

export default function ProductDetail() {
  const { id } = useParams();
  const addToCart = useCartStore((s) => s.addToCart);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/api/products/${id}`).then((res) => {
      setProduct(res.data.data);
    });
  }, [id]);

  if (!product) return <div className="p-20">Loading...</div>;

  const getStockInfo = () => {
    if (product.stock === 0) {
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-700",
        progress: 0,
        message: "This product is currently unavailable.",
      };
    }

    if (product.stock <= 5) {
      return {
        label: "Low Stock",
        color: "bg-amber-100 text-amber-700",
        progress: 25,
        message: `Only ${product.stock} left. Order soon.`,
      };
    }

    if (product.stock <= 15) {
      return {
        label: "Limited Availability",
        color: "bg-yellow-100 text-yellow-700",
        progress: 50,
        message: "Selling fast.",
      };
    }

    return {
      label: "In Stock",
      color: "bg-emerald-100 text-emerald-700",
      progress: 100,
      message: "Available for immediate purchase.",
    };
  };

  const stockInfo = getStockInfo();

  return (
    <div className="min-h-screen bg-white mt-20">
      <div className="container-app py-16 grid md:grid-cols-2 gap-16">
        {/* IMAGE SECTION */}
        <div>
          <img
            src={
              product.images?.[activeImage]?.url ||
              "https://via.placeholder.com/600"
            }
            alt={product.name}
            className="w-full rounded-2xl border"
          />

          {product.images?.length > 1 && (
            <div className="flex gap-4 mt-4">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt=""
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${
                    activeImage === i ? "border-black" : "border-stone-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* INFO SECTION */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          <p className="text-stone-500 mb-4">
            Sold by{" "}
            <span
              className="font-medium cursor-pointer hover:underline"
              onClick={() => navigate(`/vendor/${product.vendorId}`)}
            >
              {product.vendorName}
            </span>
          </p>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-500">★</span>
            <span>{product.ai}/100</span>
          </div>

          <p className="text-3xl font-semibold mb-6">₹{product.price}</p>

          {/* SMART STOCK SECTION */}
          <div className="mb-6">
            <span
              className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-3 ${stockInfo.color}`}
            >
              {stockInfo.label}
            </span>

            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-black transition-all duration-500"
                style={{ width: `${stockInfo.progress}%` }}
              />
            </div>

            <p className="text-sm text-stone-500">{stockInfo.message}</p>
          </div>

          <p className="text-stone-600 mb-6">{product.description}</p>

          {/* QUANTITY */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-4 py-2 border rounded-lg"
            >
              -
            </button>

            <span className="text-lg">{quantity}</span>

            <button
              onClick={() =>
                setQuantity((q) => (q < product.stock ? q + 1 : q))
              }
              className="px-4 py-2 border rounded-lg"
            >
              +
            </button>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4">
            <button
              onClick={() => addToCart({ ...product, quantity })}
              disabled={product.stock === 0}
              className="flex-1 bg-black text-white py-3 rounded-xl hover:bg-stone-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>

            <button
              disabled={product.stock === 0}
              className="flex-1 border border-stone-300 py-3 rounded-xl hover:bg-stone-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
