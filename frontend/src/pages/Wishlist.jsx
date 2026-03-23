import { Link } from "react-router-dom";
import { useWishlistStore } from "../store/wishlistStore";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const showToast = useToastStore((s) => s.showToast);

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-sand-100 rounded-full flex items-center justify-center text-5xl mb-6">🤍</div>
          <h2 className="text-2xl font-display font-bold text-ink-900">Your wishlist is empty</h2>
          <p className="text-ink-500 mt-2 mb-8 text-sm">Save products you love and come back to them anytime.</p>
          <Link to="/market"><button className="btn-primary px-8 py-3">Browse Marketplace →</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app">
        <div className="mb-8">
          <p className="section-label">Account</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">My Wishlist
            <span className="text-base font-sans font-normal text-ink-400 ml-3">({wishlist.length} saved)</span>
          </h1>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {wishlist.map((product) => (
            <div key={product._id} className="card overflow-hidden group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
              {/* Image */}
              <Link to={`/product/${product._id}`} className="block relative bg-sand-100 aspect-square overflow-hidden">
                {product.imageUrl || product.primaryImage?.imageUrl ? (
                  <img src={product.imageUrl || product.primaryImage?.imageUrl} alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-ink-200">🛍️</div>
                )}
              </Link>

              {/* Info */}
              <div className="p-4">
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-semibold text-ink-900 text-sm line-clamp-2 hover:text-brand-700 transition-colors">{product.name}</h3>
                </Link>
                <p className="text-base font-bold text-ink-900 mt-2">₹{product.price?.toLocaleString()}</p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={async () => {
                      const res = await addToCart(product._id, 1);
                      if (res?.success !== false) showToast({ message: "Added to cart!", type: "success" });
                    }}
                    className="btn-primary flex-1 text-xs py-2">
                    Add to Cart
                  </button>
                  <button
                    onClick={() => { toggleWishlist(product); showToast({ message: "Removed from wishlist", type: "info" }); }}
                    className="w-9 h-9 rounded-xl border-2 border-ink-200 hover:border-danger-500 hover:bg-red-50 flex items-center justify-center transition-all">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
