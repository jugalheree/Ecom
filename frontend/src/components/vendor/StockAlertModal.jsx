import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * StockAlertModal
 * Shows when vendor has products at or below their minStockAlert threshold.
 * Gives vendor two actions:
 *   1. Go to Stock page (manage their own stock)
 *   2. Go to Vendor Marketplace (buy from other vendors)
 */
export default function StockAlertModal({ products, onClose }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (!products || products.length === 0 || dismissed) return null;

  const handleGoToStock = (productId) => {
    onClose?.();
    navigate(`/vendor/stock${productId ? `?highlight=${productId}` : ""}`);
  };

  const handleGoToMarketplace = (product) => {
    onClose?.();
    // Navigate directly to vendor marketplace with the product title pre-searched
    navigate(`/vendor/trade?search=${encodeURIComponent(product.title)}`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">⚠️</div>
            <div>
              <h2 className="text-white font-display font-bold text-lg">Low Stock Alert</h2>
              <p className="text-white/80 text-xs mt-0.5">
                {products.length} product{products.length > 1 ? "s" : ""} running low
              </p>
            </div>
          </div>
          <button
            onClick={() => { setDismissed(true); onClose?.(); }}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Product list */}
        <div className="max-h-72 overflow-y-auto divide-y divide-ink-100">
          {products.map((product) => (
            <div key={product._id} className="flex items-center gap-4 px-6 py-4 hover:bg-sand-50 transition-colors">

              {/* Product image */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-sand-100 flex-shrink-0 border border-ink-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-900 text-sm truncate">{product.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    {product.stock} left
                  </span>
                  <span className="text-xs text-ink-400">
                    Alert at ≤ {product.minStockAlert}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleGoToStock(product._id)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  Update Stock
                </button>
                <button
                  onClick={() => handleGoToMarketplace(product)}
                  className="text-xs font-semibold text-ink-600 hover:text-ink-700 bg-ink-50 hover:bg-ink-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  Buy from Market
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-sand-50 border-t border-ink-100 flex items-center justify-between">
          <p className="text-xs text-ink-400">You can update alert thresholds on the Stock page.</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleGoToStock()}
              className="btn-primary text-xs px-4 py-2"
            >
              Manage All Stock →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
