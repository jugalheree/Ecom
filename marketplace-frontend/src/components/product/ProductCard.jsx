import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { Link } from "react-router-dom";
import { useWishlistStore } from "../../store/wishlistStore";
import { useToastStore } from "../../store/toastStore";


export default function ProductCard({ product }) {
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);
  const showToast = useToastStore((s) => s.showToast);


  const liked = isWishlisted(product.id);

  return (
    <Card className="p-3 flex flex-col hover:shadow-md transition relative">
      {/* HEART */}
      <button
        className="absolute top-2 right-2 text-xl"
        onClick={() => {
          toggleWishlist({
            id: product.id,
            name: product.name,
            price: product.price,
            ai: product.ai,
          });
        
          showToast({
            type: liked ? "info" : "success",
            message: liked ? "Removed from wishlist" : "Added to wishlist",
          });
        }}
        
      >
        {liked ? "❤️" : "🤍"}
      </button>

      <div className="h-36 bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-400 text-sm">
        Product image
      </div>

      <h3 className="text-sm font-semibold">{product.name}</h3>

      <div className="flex items-center justify-between mt-2">
        <span className="font-bold">₹{product.price}</span>
        <Badge type="info">AI {product.ai}</Badge>
      </div>

      <Link to={`/product/${product.id}`}>
        <Button className="mt-3 text-sm w-full">View</Button>
      </Link>
    </Card>
  );
}
