import { useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";

export default function ProductDetail() {
  const { id } = useParams();
  const addToCart = useCartStore((s) => s.addToCart);
  const showToast = useToastStore((s) => s.showToast);

  // temporary dummy product
  const product = {
    id,
    name: "Wireless Headphones",
    price: 2499,
    ai: 87,
    desc: "High quality wireless headphones with noise cancellation and long battery life.",
  };

  return (
    <div className="container-app py-10 grid md:grid-cols-2 gap-10">
      {/* IMAGE */}
      <div className="bg-white rounded-xl border h-96 flex items-center justify-center text-slate-400">
        Product Image
      </div>

      {/* INFO */}
      <div>
        <Badge type="info">AI Score: {product.ai}</Badge>
        <h1 className="mt-3">{product.name}</h1>
        <p className="text-2xl font-bold mt-2">₹{product.price}</p>

        <p className="text-slate-600 mt-4">{product.desc}</p>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => {
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
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
          <Card>
            <h3>Secure Wallet</h3>
            <p className="text-sm text-slate-600 mt-1">
              Payment protected through escrow wallet.
            </p>
          </Card>

          <Card>
            <h3>Verified Vendor</h3>
            <p className="text-sm text-slate-600 mt-1">
              Trusted supplier with stock tracking.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
