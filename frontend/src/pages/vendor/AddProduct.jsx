import { useState, useEffect, useRef, useCallback } from "react";
import { vendorAPI, categoryAPI } from "../../services/apis/index";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";

const FloatingOrbs = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-[0.04]"
      style={{ background: "radial-gradient(circle, #ff7d07, transparent 70%)" }} />
    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.03]"
      style={{ background: "radial-gradient(circle, #d946ef, transparent 70%)" }} />
  </div>
);

const STEPS = [
  { id: 1, label: "Details",    icon: "◈", desc: "Core product info" },
  { id: 2, label: "Attributes", icon: "⬡", desc: "Category specs" },
  { id: 3, label: "Images",     icon: "▣", desc: "Visual assets" },
  { id: 4, label: "Review",     icon: "◉", desc: "Final check" },
];

const CLOTH_STANDARDS = `You are a textile quality auditor for TradeSphere marketplace. Evaluate cloth products against these standards:
- Fabric composition must be clearly mentioned (e.g., 100% cotton, 60% polyester/40% cotton)
- Color fastness rating should be mentioned (ISO 105-A02: Grade 4 or above preferred)
- Thread count for bedding/upholstery: minimum 200TC
- GSM (grams per square metre) must be specified for all fabric products
- No misleading terms like "pure" without certification
- Eco-friendly/organic claims require certification mention (GOTS, OEKO-TEX, etc.)
- Size guide or standard sizing reference must be present for apparel
- Care instructions should be mentioned
Based on the product description, give a score 1-5 and list standards met vs missing.
Respond ONLY with JSON: { "score": number, "met": string[], "missing": string[], "recommendation": string }`;

function StepRail({ currentStep, completedSteps }) {
  return (
    <div className="relative flex items-start gap-0 mb-12">
      {STEPS.map((step, idx) => {
        const isActive = currentStep === step.id;
        const isDone = completedSteps.includes(step.id);
        const isLast = idx === STEPS.length - 1;
        return (
          <div key={step.id} className="flex items-start flex-1">
            <div className="flex flex-col items-center" style={{ minWidth: 0 }}>
              <div className="relative flex items-center justify-center w-11 h-11 rounded-full text-sm font-bold transition-all duration-500"
                style={{
                  background: isDone ? "linear-gradient(135deg,#f05f00,#ff7d07)" : isActive ? "linear-gradient(135deg,#131318,#3e3e48)" : "transparent",
                  border: isDone ? "2px solid #ff7d07" : isActive ? "2px solid #131318" : "2px solid #d9d9de",
                  color: isDone || isActive ? "#fff" : "#8e8e9a",
                  boxShadow: isActive ? "0 0 0 4px rgba(19,19,24,0.08),0 4px 16px rgba(19,19,24,0.15)" : isDone ? "0 0 0 4px rgba(255,125,7,0.12)" : "none",
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                }}>
                {isDone ? (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>) : <span className="font-mono text-xs">{step.icon}</span>}
              </div>
              <div className="mt-2.5 text-center px-1">
                <p className={`text-xs font-semibold transition-colors duration-300 ${isActive ? "text-ink-900" : isDone ? "text-brand-600" : "text-ink-400"}`}>{step.label}</p>
                <p className={`text-[10px] mt-0.5 transition-colors duration-300 ${isActive ? "text-ink-500" : "text-ink-300"}`}>{step.desc}</p>
              </div>
            </div>
            {!isLast && (
              <div className="flex-1 h-[2px] mt-[22px] mx-2 rounded-full overflow-hidden bg-ink-200">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: isDone ? "100%" : "0%", background: "linear-gradient(90deg,#f05f00,#ff7d07)" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldLabel({ children, required, hint }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <label style={{ letterSpacing: "0.04em", fontSize: "11px" }} className="text-xs font-bold uppercase tracking-widest text-ink-500">
        {children}{required && <span className="text-brand-500 ml-1">*</span>}
      </label>
      {hint && <span className="text-[11px] text-ink-400">{hint}</span>}
    </div>
  );
}

function StyledInput({ className = "", ...props }) {
  return <input {...props} className={`w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 text-sm placeholder:text-ink-300 focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all duration-200 hover:border-ink-300 ${className}`} />;
}
function StyledTextarea({ className = "", ...props }) {
  return <textarea {...props} className={`w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 text-sm placeholder:text-ink-300 resize-none focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all duration-200 ${className}`} />;
}
function StyledSelect({ children, className = "", ...props }) {
  return <select {...props} className={`w-full rounded-xl border-2 border-ink-200 bg-white px-4 py-3 text-ink-900 text-sm focus:outline-none focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 transition-all duration-200 appearance-none cursor-pointer ${className}`}>{children}</select>;
}
function PrimaryButton({ children, loading, onClick, type = "button", disabled }) {
  return (
    <button type={type} onClick={onClick} disabled={loading || disabled}
      className="relative w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
      style={{ background: loading || disabled ? "#8e8e9a" : "linear-gradient(135deg,#131318 0%,#3e3e48 100%)", boxShadow: loading || disabled ? "none" : "0 4px 20px rgba(19,19,24,0.25),inset 0 1px 0 rgba(255,255,255,0.08)" }}>
      <span className="flex items-center justify-center gap-2">
        {loading && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
        {children}
      </span>
    </button>
  );
}
function GhostButton({ children, onClick }) {
  return <button type="button" onClick={onClick} className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-ink-600 border-2 border-ink-200 hover:border-ink-400 hover:text-ink-900 transition-all duration-200 active:scale-[0.98]">{children}</button>;
}
function SaleTypeSelector({ value, onChange }) {
  const options = [
    { value: "B2C", label: "B2C", sub: "Consumer retail" },
    { value: "B2B", label: "B2B", sub: "Business buyers" },
    { value: "BOTH", label: "Both", sub: "All channels" },
  ];
  return (
    <div className="flex gap-3">
      {options.map((opt) => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className="flex-1 py-3 px-4 rounded-xl border-2 text-center transition-all duration-200 active:scale-[0.97]"
          style={{ borderColor: value === opt.value ? "#131318" : "#d9d9de", background: value === opt.value ? "#131318" : "white", color: value === opt.value ? "white" : "#70707e", boxShadow: value === opt.value ? "0 4px 12px rgba(19,19,24,0.15)" : "none" }}>
          <div className="text-sm font-bold">{opt.label}</div>
          <div className="text-[10px] mt-0.5 opacity-70">{opt.sub}</div>
        </button>
      ))}
    </div>
  );
}

function ImageDropZone({ images, onAdd, onRemove }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")).slice(0, 5 - images.length);
    if (files.length) onAdd(files);
  }, [images, onAdd]);
  return (
    <div className="space-y-4">
      <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => inputRef.current?.click()}
        className="relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300"
        style={{ borderColor: dragOver ? "#ff7d07" : "#d9d9de", background: dragOver ? "rgba(255,125,7,0.04)" : "#f7f7f8" }}>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
          onChange={(e) => { const files = Array.from(e.target.files).slice(0, 5 - images.length); onAdd(files); }} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300"
            style={{ background: dragOver ? "rgba(255,125,7,0.1)" : "white", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transform: dragOver ? "scale(1.08)" : "scale(1)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "#f05f00" : "#8e8e9a"} strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
              <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-700">{dragOver ? "Drop images here" : "Upload product images"}</p>
            <p className="text-xs text-ink-400 mt-1">Drag & drop or click · PNG, JPG, WebP · Up to 5 images</p>
          </div>
        </div>
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-ink-200">
              <img src={URL.createObjectURL(img)} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && <div className="absolute top-1.5 left-1.5"><span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "linear-gradient(135deg,#f05f00,#ff7d07)", color: "white" }}>MAIN</span></div>}
              <button type="button" onClick={() => onRemove(i)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs font-bold">×</button>
            </div>
          ))}
          {images.length < 5 && (
            <button type="button" onClick={() => inputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-ink-200 flex items-center justify-center text-ink-300 hover:border-ink-400 hover:text-ink-500 transition-all duration-200">
              <span className="text-2xl font-light">+</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ClothQualityChecker({ description, title }) {
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [open, setOpen] = useState(false);

  const runCheck = async () => {
    if (!description && !title) return;
    setChecking(true);
    setOpen(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: CLOTH_STANDARDS,
          messages: [{ role: "user", content: `Product Title: ${title}\nDescription: ${description || "(none)"}` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed);
    } catch {
      setResult({ score: 0, met: [], missing: ["Could not run quality check — check connection"], recommendation: "Please try again." });
    } finally { setChecking(false); }
  };

  const scoreColor = result ? (result.score >= 4 ? "#10b981" : result.score >= 3 ? "#f59e0b" : "#ef4444") : "#8e8e9a";

  return (
    <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: open ? "#f05f00" : "#e8d5c4" }}>
      <div className="flex items-center justify-between px-5 py-4 cursor-pointer"
        style={{ background: open ? "linear-gradient(135deg,#fff7f0,#fff3e8)" : "#fffbf8" }}
        onClick={() => !checking && setOpen(o => !o)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg,#f05f00,#ff7d07)" }}>🧵</div>
          <div>
            <p className="text-sm font-bold text-ink-900">Cloth Quality Standard Checker</p>
            <p className="text-xs text-ink-500 mt-0.5">AI audits listing against TradeSphere textile standards</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {result && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ background: `${scoreColor}15` }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= result.score ? scoreColor : "#d9d9de"} stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
              <span className="text-xs font-bold ml-1" style={{ color: scoreColor }}>{result.score}/5</span>
            </div>
          )}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
            <path d="M4 6l4 4 4-4" stroke="#8e8e9a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {open && (
        <div className="px-5 pb-5 pt-1" style={{ background: "#fffbf8" }}>
          {!result && !checking && (
            <div className="text-center py-6">
              <p className="text-sm text-ink-500 mb-4 leading-relaxed">
                For cloth/textile products, TradeSphere maintains quality standards.<br />
                Missing standards will reduce your product's marketplace rating.
              </p>
              <button type="button" onClick={runCheck} disabled={!description && !title}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg,#f05f00,#ff7d07)", opacity: (!description && !title) ? 0.5 : 1 }}>
                Run Quality Check
              </button>
              {!description && !title && <p className="text-xs text-ink-400 mt-2">Add title and description first</p>}
            </div>
          )}
          {checking && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
              <p className="text-sm text-ink-500 font-medium">Auditing against textile standards…</p>
            </div>
          )}
          {result && !checking && (
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-400">Quality Score</span>
                  <span className="text-sm font-bold" style={{ color: scoreColor }}>{result.score}/5 Stars</span>
                </div>
                <div className="h-2.5 rounded-full bg-ink-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(result.score / 5) * 100}%`, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}cc)` }} />
                </div>
              </div>
              {result.met?.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">✓ Standards Met</p>
                  <ul className="space-y-1">{result.met.map((m, i) => <li key={i} className="text-xs text-emerald-700 flex items-start gap-2"><span className="mt-0.5 flex-shrink-0">•</span>{m}</li>)}</ul>
                </div>
              )}
              {result.missing?.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-700 mb-2">⚠ Standards Missing (will reduce rating)</p>
                  <ul className="space-y-1">{result.missing.map((m, i) => <li key={i} className="text-xs text-orange-700 flex items-start gap-2"><span className="mt-0.5 flex-shrink-0">•</span>{m}</li>)}</ul>
                </div>
              )}
              {result.recommendation && (
                <div className="rounded-xl p-4" style={{ background: "#f8f8fa", border: "1px solid #e2e2e8" }}>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-1">Recommendation</p>
                  <p className="text-sm text-ink-700 leading-relaxed">{result.recommendation}</p>
                </div>
              )}
              <button type="button" onClick={runCheck} className="w-full py-2.5 rounded-xl text-xs font-semibold text-orange-600 border-2 border-orange-200 hover:bg-orange-50 transition-all">Re-run Check</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewPanel({ form, images, attributes, categoryAttributes, categories }) {
  const selectedCategory = categories.find((c) => c._id === form.categoryId);
  const isCloth = selectedCategory?.name?.toLowerCase().match(/cloth|textile|fabric|apparel|garment|fashion|wear/);
  const rows = [
    ["Title", form.title], ["Category", selectedCategory?.name || "—"],
    ["Description", form.description || "—"], ["Price", `₹${form.price}`],
    ["Stock", `${form.stock} units`], ["Sale Type", form.saleType],
    ["Delivery", `${form.minDeliveryDays}–${form.maxDeliveryDays} days`],
    ["Mfg. Date", form.manufacturingDate || "—"], ["Expiry Date", form.expiryDate || "—"],
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-ink-50 border border-ink-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-200 bg-white"><p className="text-xs font-bold uppercase tracking-widest text-ink-400">Product Info</p></div>
        <div className="p-5 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <span className="text-xs text-ink-400 font-medium shrink-0">{label}</span>
              <span className="text-sm text-ink-900 font-semibold text-right truncate max-w-[200px]">{value}</span>
            </div>
          ))}
        </div>
      </div>
      {categoryAttributes.length > 0 && Object.values(attributes).some(Boolean) && (
        <div className="rounded-2xl bg-ink-50 border border-ink-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-ink-200 bg-white"><p className="text-xs font-bold uppercase tracking-widest text-ink-400">Attributes</p></div>
          <div className="p-5 space-y-3">
            {categoryAttributes.filter((a) => attributes[a.code]).map((attr) => (
              <div key={attr.code} className="flex justify-between items-center gap-4">
                <span className="text-xs text-ink-400 font-medium">{attr.label}</span>
                <span className="text-sm text-ink-900 font-semibold">{attributes[attr.code]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-2xl bg-ink-50 border border-ink-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-200 bg-white"><p className="text-xs font-bold uppercase tracking-widest text-ink-400">Images ({images.length}/5)</p></div>
        <div className="p-5">
          {images.length === 0 ? <p className="text-sm text-ink-400">No images uploaded</p> : (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-ink-200">
                  <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
                  {i === 0 && <div className="absolute inset-0 bg-brand-600/20 flex items-end justify-center pb-0.5"><span className="text-[8px] font-bold text-white">MAIN</span></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isCloth && (
        <div className="rounded-2xl p-4 border-2" style={{ borderColor: "#fed7aa", background: "#fff7ed" }}>
          <div className="flex items-start gap-2">
            <span className="text-lg">🧵</span>
            <div>
              <p className="text-sm font-bold text-orange-800">Cloth Quality Note</p>
              <p className="text-xs text-orange-600 mt-0.5 leading-relaxed">Textile products with missing quality standards will receive a reduced initial marketplace rating. Update your description to improve your score.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddProduct() {
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const [categories, setCategories] = useState([]);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", price: "", stock: "",
    categoryId: "", saleType: "B2C",
    minDeliveryDays: "1", maxDeliveryDays: "5",
    manufacturingDate: "", expiryDate: "",
  });
  const [attributes, setAttributes] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [createdProductId, setCreatedProductId] = useState(null);

  const selectedCategory = categories.find((c) => c._id === form.categoryId);
  const isClothCategory = selectedCategory?.name?.toLowerCase().match(/cloth|textile|fabric|apparel|garment|fashion|wear/);

  useEffect(() => {
    categoryAPI.getAll().then((res) => {
      const all = res.data?.data || [];
      setCategories(all.filter((c) => c.isLeaf));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.categoryId) { setCategoryAttributes([]); setAttributes({}); return; }
    categoryAPI.getAttributes(form.categoryId).then((res) => {
      const attrs = res.data?.data || [];
      setCategoryAttributes(attrs);
      const defaults = {};
      attrs.forEach((a) => (defaults[a.code] = ""));
      setAttributes(defaults);
    }).catch(() => setCategoryAttributes([]));
  }, [form.categoryId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const markDone = (stepId) => setCompletedSteps((prev) => [...new Set([...prev, stepId])]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.stock || !form.categoryId) {
      showToast({ message: "Please fill all required fields", type: "error" }); return;
    }
    if (form.manufacturingDate && form.expiryDate && new Date(form.expiryDate) <= new Date(form.manufacturingDate)) {
      showToast({ message: "Expiry date must be after manufacturing date", type: "error" }); return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title, description: form.description,
        price: Number(form.price), stock: Number(form.stock),
        categoryId: form.categoryId, saleType: form.saleType,
        minDeliveryDays: Number(form.minDeliveryDays), maxDeliveryDays: Number(form.maxDeliveryDays),
      };
      if (form.manufacturingDate) payload.manufacturingDate = form.manufacturingDate;
      if (form.expiryDate) payload.expiryDate = form.expiryDate;
      const res = await vendorAPI.createProduct(payload);
      const productId = res.data?.data?._id;
      setCreatedProductId(productId);
      markDone(1);
      showToast({ message: "Product created! Add attributes next.", type: "success" });
      if (categoryAttributes.length > 0) { setStep(2); } else { markDone(2); setStep(3); }
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to create product", type: "error" });
    } finally { setLoading(false); }
  };

  const handleAddAttributes = async () => {
    const attrsArray = Object.entries(attributes).filter(([, v]) => v !== "").map(([code, value]) => ({ code, value }));
    if (attrsArray.length === 0) { markDone(2); setStep(3); return; }
    setLoading(true);
    try {
      await vendorAPI.addProductAttributes(createdProductId, { attributes: attrsArray });
      markDone(2);
      showToast({ message: "Attributes saved!", type: "success" });
      setStep(3);
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to save attributes", type: "error" });
    } finally { setLoading(false); }
  };

  const handleImagesDone = async () => {
    if (images.length === 0) { markDone(3); setStep(4); return; }
    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));
    setLoading(true);
    try {
      await vendorAPI.uploadProductImages(createdProductId, formData);
      markDone(3);
      showToast({ message: "Images uploaded!", type: "success" });
      setStep(4);
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Image upload failed", type: "error" });
    } finally { setLoading(false); }
  };

  const handleFinish = () => {
    showToast({ message: "🎉 Product listed on TradeSphere!", type: "success" });
    navigate("/vendor/products");
  };

  return (
    <div className="min-h-screen relative" style={{ background: "#f7f7f8" }}>
      <FloatingOrbs />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        <button onClick={() => navigate("/vendor/products")} className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 mb-8 transition-colors duration-200 group">
          <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>Back to Products
        </button>
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: "linear-gradient(135deg,#131318,#3e3e48)" }}>+</div>
            <h1 className="text-3xl font-bold text-ink-900 font-display tracking-tight">New Product</h1>
          </div>
          <p className="text-ink-500 text-sm">Complete all steps to list your product on TradeSphere marketplace.</p>
        </div>
        <StepRail currentStep={step} completedSteps={completedSteps} />
        <div className="bg-white rounded-3xl shadow-sm border border-ink-200 overflow-hidden">
          <div className="px-8 pt-8 pb-6 border-b border-ink-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-1">Step {step} of {STEPS.length}</p>
                <h2 className="text-xl font-bold text-ink-900 font-display">{STEPS[step - 1].label}</h2>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#f0fdfa", border: "2px solid #ccfbf1" }}>
                <span className="text-lg text-brand-600">{STEPS[step - 1].icon}</span>
              </div>
            </div>
          </div>
          <div className="px-8 py-8">
            {step === 1 && (
              <form onSubmit={handleCreateProduct} className="space-y-6">
                <div>
                  <FieldLabel required>Product Title</FieldLabel>
                  <StyledInput type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Premium Organic Cotton T-Shirt" required />
                </div>
                <div>
                  <FieldLabel required>Category</FieldLabel>
                  <div className="relative">
                    <StyledSelect name="categoryId" value={form.categoryId} onChange={handleChange} required>
                      <option value="">Select a category</option>
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </StyledSelect>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="#8e8e9a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <FieldLabel required>Sale Channel</FieldLabel>
                  <SaleTypeSelector value={form.saleType} onChange={(v) => setForm({ ...form, saleType: v })} />
                </div>
                <div>
                  <FieldLabel hint="Optional">Description</FieldLabel>
                  <StyledTextarea name="description" rows={4} value={form.description} onChange={handleChange} placeholder="Describe your product — materials, key features, use cases..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required hint="₹ INR">Price</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm font-semibold">₹</span>
                      <StyledInput type="number" name="price" value={form.price} onChange={handleChange} placeholder="0.00" min="0" className="pl-8" required />
                    </div>
                  </div>
                  <div>
                    <FieldLabel required hint="units">Stock</FieldLabel>
                    <StyledInput type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="0" min="0" required />
                  </div>
                </div>

                {/* ── Manufacturing & Expiry Dates ── */}
                <div>
                  <FieldLabel hint="Required for perishables">Product Dates</FieldLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-ink-400 mb-1.5">Manufacturing Date</div>
                      <StyledInput type="date" name="manufacturingDate" value={form.manufacturingDate} onChange={handleChange} max={new Date().toISOString().split("T")[0]} />
                    </div>
                    <div>
                      <div className="text-xs text-ink-400 mb-1.5">Expiry / Best Before</div>
                      <StyledInput type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} min={form.manufacturingDate || new Date().toISOString().split("T")[0]} />
                    </div>
                  </div>
                  <p className="text-[11px] text-ink-400 mt-2">⚠ Near-expiry products can be listed in the <strong>Vendor Marketplace</strong> for B2B clearance sales.</p>
                </div>

                <div>
                  <FieldLabel required>Delivery Window</FieldLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-ink-400 mb-1.5">Minimum days</div>
                      <StyledInput type="number" name="minDeliveryDays" value={form.minDeliveryDays} onChange={handleChange} min="1" required />
                    </div>
                    <div>
                      <div className="text-xs text-ink-400 mb-1.5">Maximum days</div>
                      <StyledInput type="number" name="maxDeliveryDays" value={form.maxDeliveryDays} onChange={handleChange} min="1" required />
                    </div>
                  </div>
                </div>

                {isClothCategory && (
                  <ClothQualityChecker description={form.description} title={form.title} />
                )}

                <div className="pt-2">
                  <PrimaryButton type="submit" loading={loading}>
                    {loading ? "Creating product..." : "Continue → Add Attributes"}
                  </PrimaryButton>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {categoryAttributes.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center mx-auto mb-4"><span className="text-2xl text-ink-300">⬡</span></div>
                    <p className="text-ink-500 text-sm">No attributes for this category.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-ink-500 leading-relaxed">Provide detailed specs to help buyers find your product.</p>
                    {categoryAttributes.map((attr) => (
                      <div key={attr.code}>
                        <FieldLabel required={attr.required} hint={attr.unit || undefined}>{attr.label}</FieldLabel>
                        {attr.dataType === "enum" ? (
                          <div className="relative">
                            <StyledSelect value={attributes[attr.code] || ""} onChange={(e) => setAttributes({ ...attributes, [attr.code]: e.target.value })}>
                              <option value="">Select {attr.label}</option>
                              {attr.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                            </StyledSelect>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="#8e8e9a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                          </div>
                        ) : attr.dataType === "boolean" ? (
                          <div className="flex gap-3">
                            {["true", "false"].map((v) => (
                              <button key={v} type="button" onClick={() => setAttributes({ ...attributes, [attr.code]: v })}
                                className="flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200"
                                style={{ borderColor: attributes[attr.code] === v ? "#131318" : "#d9d9de", background: attributes[attr.code] === v ? "#131318" : "white", color: attributes[attr.code] === v ? "white" : "#70707e" }}>
                                {v === "true" ? "Yes" : "No"}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <StyledInput type={attr.dataType === "number" ? "number" : "text"} value={attributes[attr.code] || ""} onChange={(e) => setAttributes({ ...attributes, [attr.code]: e.target.value })} placeholder={`Enter ${attr.label}${attr.unit ? ` (${attr.unit})` : ""}`} />
                        )}
                      </div>
                    ))}
                  </>
                )}
                <div className="flex gap-3 pt-2">
                  <GhostButton onClick={() => { markDone(2); setStep(3); }}>Skip</GhostButton>
                  <PrimaryButton loading={loading} onClick={handleAddAttributes}>
                    {loading ? "Saving..." : "Continue → Upload Images"}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <p className="text-sm text-ink-500">Great images dramatically increase conversions. Upload up to 5 high-quality photos.</p>
                <ImageDropZone images={images} onAdd={(files) => setImages((prev) => [...prev, ...files].slice(0, 5))} onRemove={(idx) => setImages((prev) => prev.filter((_, i) => i !== idx))} />
                {images.length > 0 && (
                  <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-brand-50 border border-brand-100">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#f05f00" strokeWidth="1.5" /><path d="M7 5v4M7 3.5v.5" stroke="#f05f00" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    <span className="text-xs text-brand-700 font-medium">First image will be the primary product photo</span>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <GhostButton onClick={() => { markDone(3); setStep(4); }}>Skip (no images)</GhostButton>
                  <PrimaryButton loading={loading} onClick={handleImagesDone}>
                    {loading ? "Uploading..." : images.length > 0 ? `Upload ${images.length} Image${images.length > 1 ? "s" : ""} →` : "Continue →"}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <p className="text-sm text-ink-500">Review your product before it goes live for admin approval.</p>
                <ReviewPanel form={form} images={images} attributes={attributes} categoryAttributes={categoryAttributes} categories={categories} />
                <div className="rounded-2xl p-5 border-2" style={{ borderColor: "#ccfbf1", background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "white" }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#f05f00" strokeWidth="1.5" /><path d="M5 8l2.5 2.5L11 5" stroke="#f05f00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-800">Ready for Admin Review</p>
                      <p className="text-xs text-brand-600 mt-1 leading-relaxed">Your product will be reviewed by TradeSphere admins. Once approved, it'll be visible to buyers in the marketplace.</p>
                    </div>
                  </div>
                </div>
                <PrimaryButton onClick={handleFinish}>🎉 Confirm & List Product</PrimaryButton>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-ink-400 mt-6">All products go through admin verification before going live.</p>
      </div>
    </div>
  );
}