import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { vendorAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";

export default function VendorStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [directInput, setDirectInput] = useState({});
  const [search, setSearch] = useState("");
  const showToast = useToastStore((s) => s.showToast);
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const highlightRef = useRef(null);

  const load = async () => {
    setLoading(true);
    vendorAPI.products({ limit: 100 })
      .then((r) => {
        const d = r.data?.data;
        setProducts(Array.isArray(d) ? d : d?.products || []);
      })
      .catch((err) => { const msg = err?.response?.data?.message || ""; if (!msg.includes("not approved") && !msg.includes("vendor profile")) showToast({ message: "Failed to load stock", type: "error" }); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, products]);

  const adjustStock = async (id, change) => {
    setUpdating((s) => ({ ...s, [id]: true }));
    try {
      await vendorAPI.updateStock(id, change);
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, stock: Math.max(0, (p.stock || 0) + change) } : p));
      showToast({ message: `Stock ${change > 0 ? "increased" : "decreased"} by ${Math.abs(change)}`, type: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to update stock", type: "error" });
    } finally {
      setUpdating((s) => ({ ...s, [id]: false }));
    }
  };

  const setDirectStock = async (id, currentStock) => {
    const newVal = Number(directInput[id]);
    if (isNaN(newVal) || newVal < 0) { showToast({ message: "Enter a valid stock number", type: "error" }); return; }
    const diff = newVal - (currentStock || 0);
    if (diff === 0) return;
    await adjustStock(id, diff);
    setDirectInput((d) => ({ ...d, [id]: "" }));
  };

  const filtered = products.filter((p) =>
    !search || (p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = filtered.filter((p) => p.stock < 5);
  const outOfStock = filtered.filter((p) => p.stock === 0);

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="mb-6">
        <p className="section-label">Vendor</p>
        <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">Stock Management</h1>
        <p className="text-ink-400 text-sm mt-0.5">Monitor and adjust inventory levels for all your products</p>
      </div>

      {/* Alert banners */}
      {!loading && outOfStock.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <span className="text-xl">🚨</span>
          <p className="text-sm text-red-700 font-semibold">
            {outOfStock.length} product{outOfStock.length !== 1 ? "s" : ""} are <strong>out of stock</strong> — restock them to keep selling!
          </p>
        </div>
      )}
      {!loading && lowStock.length > 0 && outOfStock.length === 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-amber-700 font-semibold">
            {lowStock.length} product{lowStock.length !== 1 ? "s" : ""} have <strong>low stock</strong> (under 5 units).
          </p>
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Products", value: filtered.length, icon: "📦", color: "text-ink-900" },
            { label: "Low Stock",      value: lowStock.length, icon: "⚠️", color: "text-amber-600" },
            { label: "Out of Stock",   value: outOfStock.length, icon: "🚫", color: "text-red-600" },
          ].map((s, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-ink-400 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full max-w-sm px-4 py-2.5 rounded-xl border-2 border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-400"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map((i) => <div key={i} className="card p-5"><div className="skeleton h-14 rounded-xl" /></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="font-display font-bold text-ink-900 text-lg">No products found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-ink-100">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Product</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Current Stock</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400 hidden sm:table-cell">Quick Adjust</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-ink-400">Set Exact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((p) => {
                const isHighlight = p._id === highlightId;
                const isLow = p.stock < 5;
                const isOut = p.stock === 0;
                return (
                  <tr key={p._id}
                    ref={isHighlight ? highlightRef : null}
                    className={`hover:bg-sand-50 transition-colors ${isHighlight ? "outline outline-2 outline-brand-400 outline-offset-[-2px]" : ""}`}
                    style={isHighlight ? { background: "#fff8f5" } : {}}
                  >
                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.image || p.primaryImage?.imageUrl
                            ? <img src={p.image || p.primaryImage?.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                            : <span className="text-lg">📦</span>
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-ink-900 line-clamp-1">{p.title}</p>
                          {isHighlight && <p className="text-[10px] text-brand-500 font-bold mt-0.5">Highlighted from Marketplace</p>}
                        </div>
                      </div>
                    </td>

                    {/* Stock level */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-lg font-bold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-ink-900"}`}>
                          {p.stock}
                        </span>
                        <div className="w-16 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${isOut ? "bg-red-400" : isLow ? "bg-amber-400" : "bg-green-400"}`}
                            style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }} />
                        </div>
                        {isOut && <span className="text-[10px] text-red-500 font-bold">OUT OF STOCK</span>}
                        {isLow && !isOut && <span className="text-[10px] text-amber-500 font-bold">LOW STOCK</span>}
                      </div>
                    </td>

                    {/* Quick adjust */}
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-2">
                        {[-10, -5, -1].map((n) => (
                          <button key={n} onClick={() => adjustStock(p._id, n)}
                            disabled={updating[p._id] || p.stock + n < 0}
                            className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-30">
                            {n}
                          </button>
                        ))}
                        <div className="w-px h-5 bg-ink-200" />
                        {[+1, +5, +10].map((n) => (
                          <button key={n} onClick={() => adjustStock(p._id, n)}
                            disabled={updating[p._id]}
                            className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 text-green-600 text-xs font-bold hover:bg-green-100 transition-all disabled:opacity-50">
                            +{n}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Set exact */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number" min="0" placeholder={String(p.stock)}
                          value={directInput[p._id] || ""}
                          onChange={(e) => setDirectInput((d) => ({ ...d, [p._id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && setDirectStock(p._id, p.stock)}
                          className="w-20 text-center px-2 py-1.5 rounded-lg border-2 border-ink-200 text-sm focus:outline-none focus:border-brand-400"
                        />
                        <button onClick={() => setDirectStock(p._id, p.stock)}
                          disabled={!directInput[p._id] || updating[p._id]}
                          className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-all disabled:opacity-40">
                          {updating[p._id] ? "..." : "Set"}
                        </button>
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
  );
}
