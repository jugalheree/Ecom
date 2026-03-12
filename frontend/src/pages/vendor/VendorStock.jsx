import { useEffect, useState } from "react";
import { vendorAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

export default function VendorStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await vendorAPI.products();
      const raw = res.data?.data;
      setProducts(Array.isArray(raw) ? raw : raw?.products || []);
    } catch (err) {
      showToast({ message: err.message || "Failed to load products", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id, change) => {
    setUpdating((s) => ({ ...s, [id]: true }));
    try {
      await vendorAPI.updateStock(id, change);
      await fetchProducts();
    } catch (err) {
      showToast({ message: err.message || "Stock update not yet supported by the backend", type: "error" });
    } finally {
      setUpdating((s) => ({ ...s, [id]: false }));
    }
  };

  const getStockStyle = (stock) => {
    if (stock === 0) return { bar: "bg-red-400", text: "text-red-600", bg: "bg-red-50 border-red-200", label: "Out of stock" };
    if (stock <= 5)  return { bar: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Low stock" };
    return { bar: "bg-emerald-400", text: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "In stock" };
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="bg-white border-b border-ink-100 px-8 py-7">
        <p className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-primary-600 mb-1">Vendor Console</p>
        <h1 className="text-2xl font-display font-bold text-ink-900">Stock Management</h1>
        <p className="text-ink-400 text-sm mt-0.5">Manage your product inventory in real time.</p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center gap-3 p-6 text-ink-400 text-sm">
            <div className="w-4 h-4 border-2 border-ink-200 border-t-primary-500 rounded-full animate-spin" />
            Loading inventory...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-ink-100 text-ink-400 text-sm">
            No products found. Add a product first.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50">
                  <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Product</th>
                  <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Stock Level</th>
                  <th className="text-left px-5 py-3 text-[11px] font-display font-bold uppercase tracking-widest text-ink-400">Adjust</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const id = p._id || p.id;
                  const style = getStockStyle(p.stock ?? 0);
                  const isUpdating = updating[id];
                  const barWidth = Math.min(((p.stock ?? 0) / 50) * 100, 100);

                  return (
                    <tr key={id} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-ink-900">{p.title || p.name}</p>
                        <p className="text-xs text-ink-400 mt-0.5">₹{p.price?.toLocaleString()}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 w-48">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${style.bar}`} style={{ width: `${barWidth}%` }} />
                          </div>
                          <span className={`text-sm font-display font-bold w-8 text-right ${style.text}`}>{p.stock ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStock(id, -1)}
                            disabled={isUpdating || (p.stock ?? 0) === 0}
                            className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 font-bold text-lg flex items-center justify-center hover:bg-red-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >−</button>
                          <button
                            onClick={() => updateStock(id, 1)}
                            disabled={isUpdating}
                            className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-lg flex items-center justify-center hover:bg-emerald-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >+</button>
                          {isUpdating && <div className="w-3 h-3 border-2 border-ink-200 border-t-primary-500 rounded-full animate-spin" />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
