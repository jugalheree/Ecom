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
    APPROVED: { label: "Approved", dot: "#10b981", bg: "rgba(16,185,129,0.14)", color: "#059669", border: "rgba(16,185,129,0.3)" },
    PENDING:  { label: "Pending",  dot: "#f59e0b", bg: "rgba(245,158,11,0.14)", color: "#d97706", border: "rgba(245,158,11,0.3)" },
    REJECTED: { label: "Rejected", dot: "#ef4444", bg: "rgba(239,68,68,0.14)",  color: "#dc2626", border: "rgba(239,68,68,0.3)"  },
  }[raw] || { label: raw, dot: "#8b8b9a", bg: "rgba(139,139,154,0.14)", color: "#6b6b7e", border: "rgba(139,139,154,0.3)" };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, backdropFilter: "blur(12px)" }}
      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }} />
      {cfg.label}
    </span>
  );
};

const SkeletonCard = () => (
  <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid #ebebef" }}>
    <div className="animate-pulse" style={{ height: 200, background: "linear-gradient(135deg,#f5f5f7,#ebebef)" }} />
    <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="animate-pulse" style={{ height: 14, borderRadius: 8, background: "#f0f0f4", width: "70%" }} />
      <div className="animate-pulse" style={{ height: 11, borderRadius: 8, background: "#f0f0f4", width: "40%" }} />
      <div style={{ display: "flex", gap: 6, paddingTop: 4 }}>
        {[1,2,3].map(i => <div key={i} className="animate-pulse" style={{ height: 36, flex: 1, borderRadius: 10, background: "#f0f0f4" }} />)}
      </div>
    </div>
  </div>
);

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [stockUpdating, setStockUpdating] = useState({});
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/vendor/allProducts");
      const raw = res.data?.data;
      const list = Array.isArray(raw) ? raw : raw?.products || [];
      setProducts(list);
      const imageResults = await Promise.allSettled(
        list.map((p) => api.get(`/api/vendor/products/${p._id || p.id}/images`))
      );
      const map = {};
      imageResults.forEach((result, i) => {
        const pid = list[i]._id || list[i].id;
        if (result.status === "fulfilled") {
          const imgs = result.value?.data?.data;
          const imgArr = Array.isArray(imgs) ? imgs : [];
          const primary = imgArr.find((img) => img.isPrimary) || imgArr[0];
          if (primary) map[pid] = primary.imageUrl || primary.url;
        }
        const embedded = list[i].images;
        if (!map[pid] && Array.isArray(embedded) && embedded.length > 0)
          map[pid] = embedded[0].imageUrl || embedded[0].url;
      });
      setImageMap(map);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/api/vendor/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id && p.id !== id));
    } catch (err) { alert(err?.message || "Failed to delete"); }
  };

  const updateStock = async (id, change) => {
    setStockUpdating((s) => ({ ...s, [id]: true }));
    try {
      await api.patch(`/api/vendor/products/${id}/stock`, { change });
      await fetchProducts();
    } catch (err) { alert(err?.message || "Failed to update stock"); }
    finally { setStockUpdating((s) => ({ ...s, [id]: false })); }
  };

  const totalProducts = products.length;
  const approvedCount = products.filter(p => (p.approvalStatus || p.status || "").toUpperCase() === "APPROVED").length;
  const pendingCount  = products.filter(p => (p.approvalStatus || p.status || "").toUpperCase() === "PENDING").length;
  const rejectedCount = totalProducts - approvedCount - pendingCount;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8fa" }}>

      {/* ── Top Header ── */}
      <div style={{ background: "white", borderBottom: "1px solid #ebebef", padding: "28px 36px" }}>
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: "#0d9488", textTransform: "uppercase", marginBottom: 6 }}>
              Vendor Console · Catalog
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111114", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              My Products
            </h1>
            <p style={{ fontSize: 13, color: "#8b8b9a", marginTop: 4 }}>
              Manage your listings, inventory and product details.
            </p>
          </div>
          <button
            onClick={() => navigate("/vendor/products/add")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#111114 0%,#2d2d36 100%)",
              color: "white", padding: "11px 22px", borderRadius: 14,
              fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(17,17,20,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(17,17,20,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(17,17,20,0.22)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </button>
        </div>

        {/* Stats pills */}
        {!loading && totalProducts > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total",    value: totalProducts, c: "#6366f1", bg: "#eef2ff", bc: "#c7d2fe" },
              { label: "Live",     value: approvedCount, c: "#059669", bg: "#f0fdf4", bc: "#bbf7d0" },
              { label: "Pending",  value: pendingCount,  c: "#d97706", bg: "#fffbeb", bc: "#fde68a" },
              { label: "Rejected", value: rejectedCount, c: "#dc2626", bg: "#fff5f5", bc: "#fecaca" },
            ].filter(s => s.value >= 0).map(stat => (
              <div key={stat.label} style={{
                background: stat.bg, border: `1px solid ${stat.bc}`,
                borderRadius: 100, padding: "5px 14px",
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: stat.c }}>{stat.value}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: stat.c, opacity: 0.75 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div style={{ padding: "28px 36px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 40px",
            background: "white", borderRadius: 24, border: "2px dashed #e0e0e8",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: "0 auto 20px",
              background: "linear-gradient(135deg,#f0f0f8,#e8e8f4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9898aa" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111114", marginBottom: 8 }}>No products yet</h3>
            <p style={{ fontSize: 13, color: "#8b8b9a", marginBottom: 24 }}>Start building your catalog by adding your first product.</p>
            <button onClick={() => navigate("/vendor/products/add")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#111114", color: "white", padding: "11px 22px",
                borderRadius: 14, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
              }}>
              + Add Your First Product
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
            {products.map((product) => {
              const pid = product._id || product.id;
              const imgSrc = imageMap[pid];
              const [g1, g2] = placeholderGradient(pid);
              const isHovered = hoveredId === pid;
              const isUpdating = stockUpdating[pid];

              return (
                <div
                  key={pid}
                  onMouseEnter={() => setHoveredId(pid)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    background: "white", borderRadius: 24, overflow: "hidden",
                    border: isHovered ? "1px solid #c8c8d8" : "1px solid #ebebef",
                    boxShadow: isHovered
                      ? "0 20px 52px rgba(0,0,0,0.11), 0 4px 14px rgba(0,0,0,0.06)"
                      : "0 2px 8px rgba(0,0,0,0.04)",
                    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                    transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    display: "flex", flexDirection: "column",
                  }}
                >
                  {/* ── Image ── */}
                  <div style={{ height: 210, position: "relative", overflow: "hidden" }}>
                    {imgSrc ? (
                      <>
                        <img
                          src={imgSrc}
                          alt={product.title || product.name}
                          style={{
                            width: "100%", height: "100%", objectFit: "cover",
                            transform: isHovered ? "scale(1.07)" : "scale(1)",
                            transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)",
                            display: "block",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.querySelector(".img-fallback").style.display = "flex";
                          }}
                        />
                        <div style={{
                          position: "absolute", inset: 0,
                          background: "linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, transparent 35%, rgba(0,0,0,0.38) 100%)",
                          pointerEvents: "none",
                        }} />
                        {/* Hidden fallback for broken img */}
                        <div className="img-fallback" style={{
                          display: "none", position: "absolute", inset: 0,
                          background: `linear-gradient(135deg,${g1},${g2})`,
                          alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10,
                        }}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2">
                            <rect x="3" y="3" width="18" height="18" rx="3"/>
                            <circle cx="8.5" cy="8.5" r="1.5" fill="rgba(255,255,255,0.6)" stroke="none"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>No image</span>
                        </div>
                      </>
                    ) : (
                      <div style={{
                        width: "100%", height: "100%",
                        background: `linear-gradient(135deg,${g1},${g2})`,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
                      }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2">
                          <rect x="3" y="3" width="18" height="18" rx="3"/>
                          <circle cx="8.5" cy="8.5" r="1.5" fill="rgba(255,255,255,0.55)" stroke="none"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.04em" }}>No image uploaded</span>
                      </div>
                    )}

                    {/* Status badge */}
                    <div style={{ position: "absolute", top: 12, left: 12 }}>
                      <StatusChip product={product} />
                    </div>

                    {/* Price pill over image */}
                    <div style={{
                      position: "absolute", bottom: 12, right: 12,
                      background: "rgba(10,10,14,0.78)", backdropFilter: "blur(14px)",
                      color: "white", padding: "5px 13px", borderRadius: 100,
                      fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em",
                      border: "1px solid rgba(255,255,255,0.13)",
                    }}>
                      ₹{product.price?.toLocaleString()}
                    </div>
                  </div>

                  {/* ── Body ── */}
                  <div style={{ padding: "15px 17px 17px", display: "flex", flexDirection: "column", flex: 1 }}>
                    {/* Title row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                      <h3 style={{
                        fontSize: 14, fontWeight: 700, color: "#111114",
                        lineHeight: 1.35, flex: 1, margin: 0,
                        overflow: "hidden", display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      }}>
                        {product.title || product.name}
                      </h3>
                      {/* Stock badge */}
                      <div style={{
                        flexShrink: 0,
                        background: product.stock > 10 ? "#f0fdf4" : product.stock > 0 ? "#fffbeb" : "#fff5f5",
                        color: product.stock > 10 ? "#15803d" : product.stock > 0 ? "#b45309" : "#b91c1c",
                        border: `1px solid ${product.stock > 10 ? "#bbf7d0" : product.stock > 0 ? "#fde68a" : "#fecaca"}`,
                        borderRadius: 8, padding: "3px 8px",
                        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                      }}>
                        {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
                      </div>
                    </div>

                    {/* Category */}
                    {product.categoryId?.name && (
                      <p style={{ fontSize: 10, fontWeight: 600, color: "#9898aa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                        {product.categoryId.name}
                      </p>
                    )}

                    <div style={{ flex: 1 }} />
                    <div style={{ height: 1, background: "#f0f0f4", marginBottom: 13 }} />

                    {/* Action row */}
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {/* Stock stepper */}
                      <div style={{
                        display: "flex", alignItems: "center",
                        background: "#f5f5f8", border: "1px solid #e5e5ec",
                        borderRadius: 10, overflow: "hidden", flex: 1, height: 36,
                      }}>
                        <button
                          onClick={() => updateStock(pid, -1)} disabled={isUpdating}
                          style={{
                            flex: 1, height: "100%", background: "transparent", border: "none",
                            cursor: "pointer", fontSize: 18, fontWeight: 400, color: "#6b6b7e",
                            lineHeight: 1, transition: "background 0.15s", display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "#e8e8ef"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >−</button>
                        <div style={{ width: 1, height: 16, background: "#dddde8" }} />
                        <span style={{ flex: 1.5, textAlign: "center", fontSize: 9.5, fontWeight: 800, color: "#5b5b6e", letterSpacing: "0.07em" }}>
                          {isUpdating ? "···" : "STOCK"}
                        </span>
                        <div style={{ width: 1, height: 16, background: "#dddde8" }} />
                        <button
                          onClick={() => updateStock(pid, 1)} disabled={isUpdating}
                          style={{
                            flex: 1, height: "100%", background: "transparent", border: "none",
                            cursor: "pointer", fontSize: 18, fontWeight: 400, color: "#6b6b7e",
                            lineHeight: 1, transition: "background 0.15s", display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "#e8e8ef"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >+</button>
                      </div>

                      {/* Edit */}
                      <button
                        onClick={() => navigate(`/vendor/products/edit/${pid}`)}
                        style={{
                          height: 36, padding: "0 14px", borderRadius: 10, fontSize: 12,
                          fontWeight: 700, border: "1px solid #c7d2fe", background: "#eef2ff",
                          color: "#4f46e5", cursor: "pointer", transition: "all 0.15s",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#4f46e5"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "#4f46e5"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.color = "#4f46e5"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
                      >Edit</button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteProduct(pid)}
                        style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: "1px solid #fee2e2", background: "#fff5f5",
                          color: "#ef4444", cursor: "pointer", transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "#ef4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#fee2e2"; }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
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
