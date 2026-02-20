import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Loader from "../components/ui/Loader";
import api from "../services/api";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";

export default function ProductDetail() {
  const { id } = useParams();
  const addToCart = useCartStore((s) => s.addToCart);
  const showToast = useToastStore((s) => s.showToast);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    api
      .get(`/api/products/${id}`)
      .then((res) => {
        if (!isMounted) return;
        setProduct(res.data.data);
        setError("");
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Product not found");
        setProduct(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white mt-20 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen bg-white mt-20 flex items-center justify-center">
        <div className="container-app text-center">
          <h1 className="text-3xl font-display font-semibold text-stone-900 mb-2">
            Product not found
          </h1>
          <p className="text-stone-600">{error || "The product is unavailable."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-12 grid md:grid-cols-2 gap-12 mt-20">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card h-96 flex items-center justify-center text-stone-400">
        Product Image
      </div>

      <div>
        <Badge type="info">AI Score: {product.ai}</Badge>
        <h1 className="mt-4 text-stone-900">{product.name}</h1>
        <p className="text-2xl font-bold mt-2 text-stone-900">₹{product.price}</p>

        <p className="text-stone-600 mt-4 leading-relaxed">{product.description}</p>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => {
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                ai: product.ai,
              });
              showToast({
                type: "success",
                message: "Added to cart",
              });
            }}
          >
            Add to Cart
          </Button>
          <Button variant="outline">Buy Now</Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <Card className="p-5">
            <h3 className="text-stone-900 font-semibold">Secure Wallet</h3>
            <p className="text-sm text-stone-600 mt-1">Payment protected through escrow wallet.</p>
          </Card>
          <Card className="p-5">
            <h3 className="text-stone-900 font-semibold">Verified Vendor</h3>
            <p className="text-sm text-stone-600 mt-1">Trusted supplier with stock tracking.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
