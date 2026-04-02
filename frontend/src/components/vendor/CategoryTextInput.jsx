import { useState, useEffect, useRef } from "react";
import { categoryAPI } from "../../services/apis/index";

/**
 * CategoryTextInput
 * Replaces the category dropdown with a free-text input that:
 *  1. Debounces 350ms and calls /api/categories/suggest?q=...
 *  2. Shows a suggestion dropdown of matching categories
 *  3. Shows a spell-correction banner ("Did you mean: Electronics?")
 *  4. Shows an AI auto-detect hint based on keywords
 */
export function CategoryTextInput({ categories, value, onChange, onCategorySelect }) {
  const [typed, setTyped]           = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [correction, setCorrection] = useState(null);   // { from, to }
  const [autoHint, setAutoHint]     = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading]       = useState(false);
  const debounceRef = useRef(null);
  const wrapRef     = useRef(null);

  // Sync display when parent clears the value
  useEffect(() => {
    if (!value) { setTyped(""); }
  }, [value]);

  // Pre-fill when categories load and value already exists
  useEffect(() => {
    if (value && categories.length) {
      const found = categories.find(c => c._id === value);
      if (found && typed !== found.name) setTyped(found.name);
    }
  }, [value, categories]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleTyping = (e) => {
    const val = e.target.value;
    setTyped(val);
    setCorrection(null);
    setAutoHint(null);

    // Clear parent selection when user edits
    if (value) onChange("");

    if (!val.trim()) { setSuggestions([]); setShowDropdown(false); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await categoryAPI.suggest(val.trim(), "", "");
        const data = res.data?.data || {};

        let matched = [];

        // DB fuzzy match result
        if (data.dbMatch) {
          const matchedCat = categories.find(
            c => c._id?.toString() === data.dbMatch.categoryId?.toString()
          );
          if (matchedCat) matched.push({ ...matchedCat, confidence: data.dbMatch.confidence });

          if (data.dbMatch.correction) {
            setCorrection({ from: val.trim(), to: data.dbMatch.correction });
          }
        }

        // Also add local substring matches not already in list
        const localMatches = categories
          .filter(c =>
            c.name.toLowerCase().includes(val.toLowerCase()) &&
            !matched.find(m => m._id === c._id)
          )
          .slice(0, 5);

        matched = [...matched, ...localMatches].slice(0, 6);
        setSuggestions(matched);
        setShowDropdown(matched.length > 0);

        if (data.autoHint) setAutoHint(data.autoHint);
      } catch {
        // Fallback: pure local filter
        const local = categories
          .filter(c => c.name.toLowerCase().includes(val.toLowerCase()))
          .slice(0, 6);
        setSuggestions(local);
        setShowDropdown(local.length > 0);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const selectCategory = (cat) => {
    setTyped(cat.name);
    onChange(cat._id);
    if (onCategorySelect) onCategorySelect(cat);
    setSuggestions([]);
    setShowDropdown(false);
    setCorrection(null);
    setAutoHint(null);
  };

  const acceptCorrection = () => {
    if (!correction) return;
    const correctedCat = categories.find(
      c => c.name.toLowerCase() === correction.to.toLowerCase()
    );
    if (correctedCat) selectCategory(correctedCat);
    else { setTyped(correction.to); setCorrection(null); }
  };

  const isValid = !!value;

  return (
    <div ref={wrapRef} className="relative">
      {/* Main text input */}
      <div className="relative">
        <input
          type="text"
          value={typed}
          onChange={handleTyping}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          placeholder="Type category name e.g. Electronics, Clothing…"
          autoComplete="off"
          className={`w-full rounded-xl border-2 px-4 py-3 pr-10 text-sm text-ink-900
            placeholder:text-ink-300 focus:outline-none transition-all duration-200
            ${isValid
              ? "border-emerald-400 bg-emerald-50/40 focus:border-emerald-500"
              : "border-ink-200 bg-white focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5 hover:border-ink-300"
            }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <svg className="animate-spin w-4 h-4 text-ink-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          )}
          {isValid && !loading && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="9" fill="#10b981"/>
              <path d="M5.5 9l2.5 2.5L12.5 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>

      {/* Spell-correction banner */}
      {correction && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-amber-300 bg-amber-50">
          <span className="text-lg">⚠️</span>
          <span className="text-xs text-amber-800 flex-1">
            Did you mean <strong className="font-bold">"{correction.to}"</strong>?
          </span>
          <button
            type="button"
            onClick={acceptCorrection}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors active:scale-95"
          >
            Use it ✓
          </button>
          <button
            type="button"
            onClick={() => setCorrection(null)}
            className="text-xs text-amber-500 hover:text-amber-800 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Auto-hint from keyword detection */}
      {autoHint && !isValid && !correction && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-blue-200 bg-blue-50">
          <span className="text-lg">🤖</span>
          <span className="text-xs text-blue-700 flex-1">
            Auto-detected: <strong className="font-bold">{autoHint}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              const c = categories.find(x =>
                x.name.toLowerCase().includes(autoHint.toLowerCase())
              );
              if (c) selectCategory(c);
            }}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors active:scale-95"
          >
            Apply
          </button>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full rounded-2xl border-2 border-ink-200 bg-white shadow-2xl overflow-hidden">
          <div className="px-3 py-2 border-b border-ink-100 bg-ink-50">
            <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Matching Categories</p>
          </div>
          {suggestions.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => selectCategory(cat)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-brand-50 transition-colors border-b border-ink-50 last:border-b-0 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-900 group-hover:text-brand-700">{cat.name}</span>
                {cat.isLeaf
                  ? <span className="text-[10px] text-emerald-600 font-bold px-1.5 py-0.5 rounded-full bg-emerald-50">✓ Selectable</span>
                  : <span className="text-[10px] text-ink-400 px-1.5 py-0.5 rounded-full bg-ink-100">Parent</span>
                }
              </div>
              {cat.confidence && (
                <span className="text-[10px] text-ink-400 shrink-0">{cat.confidence}% match</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No match hint */}
      {typed.length > 2 && !loading && suggestions.length === 0 && !isValid && (
        <p className="text-[11px] text-ink-400 mt-1.5">
          No categories found. Ask your admin to add this category first.
        </p>
      )}
    </div>
  );
}
