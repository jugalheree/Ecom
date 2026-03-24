import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { vendorAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

export default function VendorStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const showToast = useToastStore((s) => s.showToast);
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const highlightRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await vendorAPI.products();
      const raw = res.data?.data;
      setProducts(Array.isArray(raw) ? raw : raw?.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Scroll to highlighted product after load
  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, products]);

  const updateStock = async (id, change) => {
    setUpdating((s) => ({ ...s, [id]: true }));
    try {
      await vendorAPI.updateStock(id, change);
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, stock: (p.stock || 0) + change } : p));
      showToast({ message: `Stock ${change > 0 ? "increased" : "decreased"}`, type: "success" });
    } catch {
      showToast({ message: "Failed to update stock", type: "error" });
    } finally { setUpdating((s) => ({ ...s, [id]: false })); }
  };

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Stock Management</h1>
        <p className="text-ink-400 text-sm mt-0.5">Adjust inventory levels for your products</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-14 rounded-xl" /></div>)}</div>
      ) : products.length === 0 ? (
        <div className="card p-16 text-center"><div className="text-5xl mb-4">📦</div><p className="font-display font-bold text-ink-900 text-lg">No products</p></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-ink-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Product</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Current Stock</th>
                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {products.map((p) => (
                <tr key={p._id}
                  ref={p._id === highlightId ? highlightRef : null}
                  className="hover:bg-sand-50 transition-colors"
                  style={p._id === highlightId ? { background: "#fff8f5", outline: "2px solid #f05f00" } : {}}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                        {(p.image || p.primaryImage?.imageUrl) ? <img src={p.image || p.primaryImage?.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" /> : "📦"}
                      </div>
                      <div>
                        <p className="font-semibold text-ink-900 line-clamp-1">{p.title || p.name}</p>
                        {p._id === highlightId && <p className="text-[10px] text-orange-500 font-bold mt-0.5">From Vendor Marketplace</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`font-bold text-lg ${(p.stock || 0) <= 5 ? "text-danger-500" : (p.stock || 0) <= 20 ? "text-amber-600" : "text-emerald-600"}`}>
                      {p.stock ?? 0}
                    </span>
                    {(p.stock || 0) <= 5 && <span className="ml-2 text-[10px] text-danger-500 font-semibold">Low Stock!</span>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => updateStock(p._id, -1)} disabled={updating[p._id] || (p.stock || 0) === 0}
                        className="w-8 h-8 rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-100 font-bold transition-colors disabled:opacity-30">−</button>
                      <button onClick={() => updateStock(p._id, 1)} disabled={updating[p._id]}
                        className="w-8 h-8 rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-100 font-bold transition-colors">+</button>
                      <button onClick={() => updateStock(p._id, 10)} disabled={updating[p._id]}
                        className="btn-primary text-xs py-1.5 px-3">+10</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
