import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const placeholderGradient = (id = "") => {
  const gradients = [
    ["#667eea", "#764ba2"], ["#f093fb", "#f5576c"], ["#4facfe", "#00f2fe"],
    ["#43e97b", "#38f9d7"], ["#fa709a", "#fee140"], ["#a18cd1", "#fbc2eb"],
    ["#ffecd2", "#fcb69f"], ["#a1c4fd", "#c2e9fb"],
  ];
  const idx = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradients.length;
  return gradients[idx];
};

const StatusChip = ({ product }) => {
  const raw = (product.approvalStatus || product.status || "pending").toUpperCase();
  const cfg = {
    APPROVED: { label: "Live",     dot: "#10b981", bg: "rgba(16,185,129,0.1)",  color: "#059669", border: "rgba(16,185,129,0.2)" },
    PENDING:  { label: "Pending",  dot: "#f59e0b", bg: "rgba(245,158,11,0.1)",  color: "#d97706", border: "rgba(245,158,11,0.2)" },
    REJECTED: { label: "Rejected", dot: "#ef4444", bg: "rgba(239,68,68,0.1)",   color: "#dc2626", border: "rgba(239,68,68,0.2)"  },
  }[raw] || { label: raw, dot: "#8b8b9a", bg: "rgba(139,139,154,0.1)", color: "#6b6b7e", border: "rgba(139,139,154,0.2)" };

  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    }}
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md">
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: cfg.dot,
        boxShadow: `0 0 0 2px ${cfg.dot}33`,
      }} />
      {cfg.label}
    </span>
  );
};

const SkeletonCard = () => (
  <div style={{
    background: "white",
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid #f0f0f4",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  }}>
    <div className="animate-pulse" style={{ height: 220, background: "linear-gradient(135deg,#f8f8fa,#f0f0f4)" }} />
    <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="animate-pulse" style={{ height: 13, borderRadius: 6, background: "#f0f0f4", width: "65%" }} />
      <div className="animate-pulse" style={{ height: 10, borderRadius: 6, background: "#f5f5f8", width: "35%" }} />
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {[1, 2].map(i => <div key={i} className="animate-pulse" style={{ height: 34, flex: 1, borderRadius: 8, background: "#f5f5f8" }} />)}
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, color, bg, border, icon }) => (
  <div style={{
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 120,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: `${color}15`,
      border: `1px solid ${color}25`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, fontWeight: 600, color, opacity: 0.65, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [stockUpdating, setStockUpdating] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null); // pid being confirmed
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/vendor/allProducts");
      const raw = res.data?.data;
      const list = Array.isArray(raw) ? raw : raw?.products || [];
      setProducts(list);
      // Images are embedded in the aggregation response (primaryImage field)
      const map = {};
      list.forEach((p) => {
        const pid = p._id || p.id;
        if (p.primaryImage?.imageUrl) {
          map[pid] = p.primaryImage.imageUrl;
        } else if (Array.isArray(p.images) && p.images.length > 0) {
          const primary = p.images.find((img) => img.isPrimary) || p.images[0];
          if (primary?.imageUrl) map[pid] = primary.imageUrl;
        }
      });
      setImageMap(map);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id) => {
    try {
      // NOTE: DELETE /api/vendor/products/:id is not yet implemented in the backend.
      await api.delete(`/api/vendor/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id && p.id !== id));
    } catch (err) { alert(err?.message || "Delete not yet supported by the backend"); }
    finally { setDeleteConfirm(null); }
  };

  const updateStock = async (id, change) => {
    setStockUpdating((s) => ({ ...s, [id]: true }));
    try {
      // NOTE: PATCH /api/vendor/products/:id/stock is not yet implemented in the backend.
      await api.patch(`/api/vendor/products/${id}/stock`, { change });
      await fetchProducts();
    } catch (err) { alert(err?.message || "Stock update not yet supported by the backend"); }
    finally { setStockUpdating((s) => ({ ...s, [id]: false })); }
  };

  const totalProducts = products.length;
  const approvedCount = products.filter(p => (p.approvalStatus || p.status || "").toUpperCase() === "APPROVED").length;
  const pendingCount  = products.filter(p => (p.approvalStatus || p.status || "").toUpperCase() === "PENDING").length;
  const rejectedCount = totalProducts - approvedCount - pendingCount;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f9", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Inline styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .vp-btn-icon:hover { opacity: 0.85; }
        .vp-delete-confirm { animation: scaleIn 0.18s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .vp-card { transition: box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease; }
        .vp-card:hover { transform: translateY(-3px) !important; }
        .vp-card .vp-img { transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94); }
        .vp-card:hover .vp-img { transform: scale(1.05) !important; }
        .vp-action-btn { transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease; }
        .vp-stock-btn { transition: background 0.12s ease; }
        .vp-stock-btn:hover:not(:disabled) { background: #e8e8ef !important; }
        .vp-edit-btn:hover { background: #111114 !important; color: white !important; border-color: #111114 !important; box-shadow: 0 3px 10px rgba(17,17,20,0.2) !important; }
        .vp-del-btn:hover { background: #fef2f2 !important; border-color: #fca5a5 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #ebebef",
        padding: "26px 40px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em",
                color: "#0d9488", textTransform: "uppercase",
                background: "#f0fdfa", border: "1px solid #99f6e4",
                padding: "3px 8px", borderRadius: 5,
              }}>
                Vendor Console
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8c8d8" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              <span style={{ fontSize: 9.5, fontWeight: 600, color: "#9898aa", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Catalog
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0d0d10", letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0 }}>
              My Products
            </h1>
            <p style={{ fontSize: 13, color: "#9898aa", marginTop: 5, fontWeight: 450, margin: "5px 0 0" }}>
              Manage listings, track inventory and review approval status.
            </p>
          </div>

          <button
            onClick={() => navigate("/vendor/products/add")}
            className="vp-action-btn"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "#0d0d10",
              color: "white",
              padding: "10px 20px",
              borderRadius: 10,
              fontSize: 13, fontWeight: 650,
              border: "1px solid #222228",
              cursor: "pointer",
              letterSpacing: "-0.01em",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.07)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a1a22"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#0d0d10"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.07)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </button>
        </div>

        {/* ── Stats row ── */}
        {!loading && totalProducts > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
            <StatCard label="Total" value={totalProducts} color="#6366f1" bg="#fafafa" border="#ebebef"
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>}
            />
            <StatCard label="Live" value={approvedCount} color="#059669" bg="#fafafa" border="#ebebef"
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
            />
            <StatCard label="Pending" value={pendingCount} color="#d97706" bg="#fafafa" border="#ebebef"
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            />
            <StatCard label="Rejected" value={rejectedCount} color="#dc2626" bg="#fafafa" border="#ebebef"
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
            />
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div style={{ padding: "28px 40px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "90px 40px",
            background: "white", borderRadius: 16,
            border: "1.5px dashed #e4e4ec",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: "0 auto 18px",
              background: "#f5f5f8", border: "1px solid #ebebef",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b0b0c4" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 750, color: "#0d0d10", marginBottom: 6, letterSpacing: "-0.02em" }}>No products yet</h3>
            <p style={{ fontSize: 13, color: "#9898aa", marginBottom: 24 }}>Start building your catalog by adding your first product.</p>
            <button onClick={() => navigate("/vendor/products/add")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "#0d0d10", color: "white",
                padding: "10px 20px", borderRadius: 10,
                fontSize: 13, fontWeight: 650, border: "none", cursor: "pointer",
                letterSpacing: "-0.01em",
              }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Your First Product
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {products.map((product) => {
              const pid = product._id || product.id;
              const imgSrc = imageMap[pid];
              const [g1, g2] = placeholderGradient(pid);
              const isHovered = hoveredId === pid;
              const isUpdating = stockUpdating[pid];
              const isConfirming = deleteConfirm === pid;

              const stockStatus = product.stock > 10
                ? { label: `${product.stock} in stock`, color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" }
                : product.stock > 0
                ? { label: `${product.stock} left`, color: "#d97706", bg: "#fffbeb", border: "#fde68a" }
                : { label: "Out of stock", color: "#dc2626", bg: "#fff5f5", border: "#fecaca" };

              return (
                <div
                  key={pid}
                  className="vp-card"
                  onMouseEnter={() => setHoveredId(pid)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    background: "white",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: isHovered ? "1px solid #d8d8e8" : "1px solid #efeff3",
                    boxShadow: isHovered
                      ? "0 12px 40px rgba(0,0,0,0.1), 0 2px 10px rgba(0,0,0,0.05)"
                      : "0 1px 4px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >

                  {/* ── Image ── */}
                  <div style={{
                    height: 220,
                    position: "relative",
                    overflow: "hidden",
                    background: "#f2f2f5",
                  }}>
                    {imgSrc ? (
                      <>
                        {/* Full-coverage blurred bg — scaled way up to eliminate grey edges */}
                        <img
                          aria-hidden="true"
                          src={imgSrc}
                          style={{
                            position: "absolute",
                            inset: "-30px",
                            width: "calc(100% + 60px)",
                            height: "calc(100% + 60px)",
                            objectFit: "cover",
                            filter: "blur(22px) brightness(1.05) saturate(0.55)",
                            opacity: 0.55,
                            pointerEvents: "none",
                            zIndex: 0,
                          }}
                        />
                        {/* Clean white-ish overlay so bg doesn't overpower */}
                        <div style={{
                          position: "absolute", inset: 0,
                          background: "rgba(248,248,250,0.45)",
                          zIndex: 1, pointerEvents: "none",
                        }} />

                        {/* Product image — full, centered, never cropped */}
                        <img
                          src={imgSrc}
                          alt={product.title || product.name}
                          className="vp-img"
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            padding: "16px",
                            zIndex: 2,
                            filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.14))",
                          }}
                          onError={(e) => {
                            // hide all layers, show fallback
                            Array.from(e.target.parentElement.children).forEach(c => c.style.display = "none");
                            e.target.parentElement.querySelector(".img-fallback").style.display = "flex";
                          }}
                        />

                        <div className="img-fallback" style={{
                          display: "none", position: "absolute", inset: 0, zIndex: 3,
                          background: `linear-gradient(135deg,${g1},${g2})`,
                          alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8,
                        }}>
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2">
                            <rect x="3" y="3" width="18" height="18" rx="3"/>
                            <circle cx="8.5" cy="8.5" r="1.5" fill="rgba(255,255,255,0.55)" stroke="none"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: `linear-gradient(135deg,${g1},${g2})`,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 8,
                      }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2">
                          <rect x="3" y="3" width="18" height="18" rx="3"/>
                          <circle cx="8.5" cy="8.5" r="1.5" fill="rgba(255,255,255,0.5)" stroke="none"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span style={{ fontSize: 11, fontWeight: 550, color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em" }}>No image</span>
                      </div>
                    )}

                    {/* Status */}
                    <div style={{ position: "absolute", top: 12, left: 12, zIndex: 4 }}>
                      <StatusChip product={product} />
                    </div>

                    {/* Price */}
                    <div style={{
                      position: "absolute", bottom: 10, right: 10, zIndex: 4,
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      color: "#0d0d10",
                      padding: "4px 10px",
                      borderRadius: 7,
                      fontSize: 13, fontWeight: 780,
                      letterSpacing: "-0.02em",
                      border: "1px solid rgba(0,0,0,0.07)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
                    }}>
                      ₹{product.price?.toLocaleString()}
                    </div>
                  </div>

                  {/* ── Body ── */}
                  <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", flex: 1 }}>

                    {/* Title + Price (no image case) */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                        <h3 style={{
                          fontSize: 14.5, fontWeight: 700,
                          color: "#0d0d10",
                          lineHeight: 1.38, flex: 1, margin: 0,
                          letterSpacing: "-0.015em",
                          overflow: "hidden", display: "-webkit-box",
                          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        }}>
                          {product.title || product.name}
                        </h3>
                        {!imgSrc && (
                          <span style={{
                            flexShrink: 0, fontSize: 14, fontWeight: 750,
                            color: "#0d0d10", letterSpacing: "-0.02em",
                          }}>
                            ₹{product.price?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        {product.categoryId?.name && (
                          <span style={{
                            fontSize: 10.5, fontWeight: 600, color: "#9898aa",
                            letterSpacing: "0.06em", textTransform: "uppercase",
                          }}>
                            {product.categoryId.name}
                          </span>
                        )}
                        {product.categoryId?.name && (
                          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#d8d8e0", flexShrink: 0 }} />
                        )}
                        <span style={{
                          fontSize: 10.5, fontWeight: 650,
                          color: stockStatus.color,
                          background: stockStatus.bg,
                          border: `1px solid ${stockStatus.border}`,
                          padding: "2px 7px", borderRadius: 5,
                        }}>
                          {stockStatus.label}
                        </span>
                      </div>
                    </div>

                    <div style={{ flex: 1 }} />

                    {/* Divider */}
                    <div style={{ height: 1, background: "#f0f0f4", margin: "10px 0 13px" }} />

                    {/* ── Actions ── */}
                    {isConfirming ? (
                      /* Delete confirmation inline */
                      <div className="vp-delete-confirm" style={{
                        background: "#fff5f5",
                        border: "1px solid #fecaca",
                        borderRadius: 10, padding: "12px 14px",
                        display: "flex", flexDirection: "column", gap: 10,
                      }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#7f1d1d", margin: 0, lineHeight: 1.4 }}>
                          Delete this product? This action cannot be undone.
                        </p>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => deleteProduct(pid)}
                            style={{
                              flex: 1, height: 32, background: "#dc2626", color: "white",
                              border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700,
                              cursor: "pointer", letterSpacing: "-0.01em",
                            }}
                          >
                            Yes, delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              flex: 1, height: 32, background: "white", color: "#555566",
                              border: "1px solid #e4e4ec", borderRadius: 7, fontSize: 12, fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>

                        {/* Stock stepper */}
                        <div style={{
                          display: "flex", alignItems: "center",
                          background: "#f7f7f9",
                          border: "1px solid #e8e8f0",
                          borderRadius: 9, overflow: "hidden",
                          flex: 1, height: 34,
                        }}>
                          <button
                            className="vp-stock-btn"
                            onClick={() => updateStock(pid, -1)}
                            disabled={isUpdating}
                            style={{
                              flex: 1, height: "100%", background: "transparent",
                              border: "none", cursor: isUpdating ? "not-allowed" : "pointer",
                              fontSize: 16, fontWeight: 400, color: "#6b6b7e",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              opacity: isUpdating ? 0.4 : 1,
                            }}
                          >−</button>
                          <div style={{ width: 1, height: 14, background: "#dddde8" }} />
                          <span style={{
                            flex: 2, textAlign: "center",
                            fontSize: 9, fontWeight: 750, color: "#8888a0",
                            letterSpacing: "0.1em", textTransform: "uppercase",
                          }}>
                            {isUpdating ? "···" : "STOCK"}
                          </span>
                          <div style={{ width: 1, height: 14, background: "#dddde8" }} />
                          <button
                            className="vp-stock-btn"
                            onClick={() => updateStock(pid, 1)}
                            disabled={isUpdating}
                            style={{
                              flex: 1, height: "100%", background: "transparent",
                              border: "none", cursor: isUpdating ? "not-allowed" : "pointer",
                              fontSize: 16, fontWeight: 400, color: "#6b6b7e",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              opacity: isUpdating ? 0.4 : 1,
                            }}
                          >+</button>
                        </div>

                        {/* Edit */}
                        <button
                          className="vp-action-btn vp-edit-btn"
                          onClick={() => navigate(`/vendor/products/edit/${pid}`)}
                          style={{
                            height: 34, padding: "0 14px", borderRadius: 9,
                            fontSize: 12, fontWeight: 650,
                            border: "1px solid #e4e4ec",
                            background: "#f7f7f9", color: "#3b3b4f",
                            cursor: "pointer", whiteSpace: "nowrap",
                            letterSpacing: "-0.01em",
                          }}
                        >Edit</button>

                        {/* Delete trigger */}
                        <button
                          className="vp-action-btn vp-del-btn"
                          onClick={() => setDeleteConfirm(pid)}
                          style={{
                            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid #f0d0d0",
                            background: "#fdf5f5",
                            color: "#e05555", cursor: "pointer",
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}