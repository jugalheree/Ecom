import { useWishlistStore } from "../store/wishlistStore";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const wishlist = useWishlistStore((s) => s.wishlist);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  return (
    <div className="container-app py-10">
      <h1>My Wishlist</h1>

      {wishlist.length === 0 && (
        <p className="text-slate-600 mt-4">
          You haven’t added any products yet.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        {wishlist.map((p) => (
          <Card key={p.id} className="p-3 space-y-2">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-slate-600">₹{p.price}</p>

            <div className="flex gap-2">
              <Link to={`/product/${p.id}`} className="flex-1">
                <Button className="w-full text-sm">View</Button>
              </Link>

              <Button
                variant="danger"
                className="text-sm"
                onClick={() => toggleWishlist(p)}
              >
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
