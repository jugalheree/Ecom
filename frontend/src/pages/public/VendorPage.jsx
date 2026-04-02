import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marketplaceAPI } from "../../services/apis/index";
import { useCartStore } from "../../store/cartStore";
import { useToastStore } from "../../store/toastStore";

export default function VendorPage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addToCart);
  const showToast = useToastStore((s) => s.showToast);

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState(null);

  const flattenTree = (nodes, depth = 0) => {
    const result = [];
    for (const node of nodes) {
      result.push({ ...node, depth });
      if (node.children?.length) result.push(...flattenTree(node.children, depth + 1));
    }
    return result;
  };

  useEffect(() => {
    if (!vendorId) return;
    setProfileLoading(true);
    marketplaceAPI.getVendorPublicProfile(vendorId)
      .then((res) => setVendorProfile(res.data?.data || null))
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [vendorId]);

  useEffect(() => {
    setCatLoading(true);
    marketplaceAPI.getCategoryTree()
      .then((res) => {
        const tree = res.data?.data || [];
        const flat = flattenTree(tree);
        setCategories(flat);
        if (flat.length > 0) {
          const firstLeaf = flat.find((c) => !c.hasChildren) || flat[0];
          setSelectedCategoryId(firstLeaf._id);
        }
      })
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;
    setLoading(true);
    setProducts([]);
    marketplaceAPI.getProductsByCategory(selectedCategoryId, { page, limit: 50, sort })
      .then((res) => {
        const data = res.data?.data;
        const allProducts = data?.products || [];
        const vendorProducts = allProducts.filter(
          (p) => p.vendorId?.toString() === vendorId || p.vendorId === vendorId
        );
        setProducts(vendorProducts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategoryId, page, sort, vendorId]);

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    setAddingToCartId(productId);
    const result = await addToCart(productId, 1);
    setAddingToCartId(null);
    if (result?.success !== false) showToast({ message: "Added to cart!", type: "success" });
    else showToast({ message: result.message || "Failed to add to cart", type: "error" });
  };

  const leafCategories = categories.filter((c) => !c.hasChildren);
  const vendorAddr = vendorProfile?.address;
  const vendorName = vendorProfile?.shopName || (profileLoading ? "" : "Unknown Vendor");

  return (
    <div className="min-h-screen bg-ink-50 mt-[72px]">
      {/* ── Vendor Header with Address at top ── */}
      <div className="bg-white border-b border-ink-100">
        <div className="container-app py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <p className="text-xs font-display font-bold uppercase tracking-widest text-brand-600 mb-2">
                Vendor Store
              </p>

              {profileLoading ? (
                <div className="space-y-3">
                  <div className="h-10 bg-ink-100 rounded-xl w-64 animate-pulse" />
                  <div className="h-16 bg-ink-100 rounded-2xl w-96 animate-pulse" />
                </div>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-ink-900 leading-tight">
                    {vendorName}
                  </h1>

                  {/* Address — prominently at top */}
                  {vendorAddr ? (
                    <div className="flex items-start gap-3 mt-4 p-4 bg-sand-50 rounded-2xl border border-ink-200 max-w-lg">
                      <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-lg">📍</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">Store Address</p>
                        {vendorAddr.line1 && (
                          <p className="text-sm font-semibold text-ink-800">{vendorAddr.line1}</p>
                        )}
                        <p className="text-sm text-ink-700">
                          {[vendorAddr.area, vendorAddr.city].filter(Boolean).join(", ")}
                        </p>
                        <p className="text-sm text-ink-500">
                          {[vendorAddr.state, vendorAddr.pincode].filter(Boolean).join(" — ")}
                        </p>
                        {vendorAddr.landmark && (
                          <p className="text-xs text-ink-400 mt-1">Near: {vendorAddr.landmark}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-400 mt-3 italic">No address listed</p>
                  )}

                  {/* Quick stats */}
                  {(vendorProfile?.productCount > 0 || vendorProfile?.totalOrders > 0 || vendorProfile?.vendorScore != null) && (
                    <div className="flex items-center gap-6 mt-4 flex-wrap">
                      {vendorProfile.productCount > 0 && (
                        <div>
                          <p className="text-xl font-display font-bold text-ink-900">{vendorProfile.productCount}</p>
                          <p className="text-xs text-ink-400 font-medium">Products</p>
                        </div>
                      )}
                      {vendorProfile.totalOrders > 0 && (
                        <div>
                          <p className="text-xl font-display font-bold text-ink-900">{vendorProfile.totalOrders}</p>
                          <p className="text-xs text-ink-400 font-medium">Orders Fulfilled</p>
                        </div>
                      )}
                      {vendorProfile.vendorScore != null && (
                        <div>
                          <p className="text-xl font-display font-bold text-brand-600">{vendorProfile.vendorScore}/100</p>
                          <p className="text-xs text-ink-400 font-medium">Vendor Score</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {!loading && (
                <p className="text-ink-400 mt-3 text-sm">
                  {products.length} product{products.length !== 1 ? "s" : ""} in this category
                </p>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-4 py-2.5 border-2 border-ink-200 rounded-xl text-sm outline-none focus:border-brand-500 bg-white text-ink-900 font-medium self-start"
            >
              <option value="newest">Newest first</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container-app py-8 flex gap-8">
        {/* ── Sidebar: Categories ── */}
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl border border-ink-100 p-4 sticky top-24">
            <p className="text-xs font-display font-bold uppercase tracking-widest text-ink-400 mb-3 px-1">
              Categories
            </p>
            {catLoading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-8 bg-ink-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-0.5">
                {leafCategories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => { setSelectedCategoryId(cat._id); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                      selectedCategoryId === cat._id
                        ? "bg-ink-900 text-white font-semibold"
                        : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                    }`}
                    style={{ paddingLeft: `${12 + cat.depth * 12}px` }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ── Products Grid ── */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-ink-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-ink-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-ink-100 rounded w-4/5" />
                    <div className="h-4 bg-ink-100 rounded w-2/5" />
                    <div className="h-8 bg-ink-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-ink-100">
              <div className="text-5xl mb-4">🏪</div>
              <h2 className="text-xl font-display font-bold text-ink-900 mb-2">No products in this category</h2>
              <p className="text-ink-500 text-sm text-center max-w-xs">
                This vendor hasn't listed any products here yet. Try another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="bg-white rounded-2xl border border-ink-100 overflow-hidden group hover:border-ink-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-ink-50">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d1d6" strokeWidth="1.5">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                      </div>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute top-2 left-2 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-md">Low Stock</span>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-500 bg-white px-2 py-1 rounded-lg border border-red-200">Out of Stock</span>
                      </div>
                    )}
                    {product.saleType === "B2B" && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-md">B2B</span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-xs font-display font-semibold text-ink-900 leading-snug line-clamp-2 mb-1.5 flex-1">{product.title}</p>
                    <p className="text-sm font-display font-bold text-ink-900 mb-3">₹{product.price?.toLocaleString()}</p>
                    <button
                      onClick={(e) => handleAddToCart(e, product._id)}
                      disabled={addingToCartId === product._id || product.stock === 0}
                      className="w-full text-xs font-display font-semibold py-2 rounded-xl bg-ink-900 text-white hover:bg-ink-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
                    >
                      {addingToCartId === product._id ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
