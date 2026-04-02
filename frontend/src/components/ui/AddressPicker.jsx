/**
 * AddressPicker — Smart address input powered by Ola Maps Places Autocomplete.
 *
 * BEHAVIOUR:
 *  - Calls Ola Maps Autocomplete REST API as the user types (debounced 350ms).
 *  - On suggestion select, calls Ola Maps Place Details to get full address + lat/lng.
 *  - Falls back gracefully to manual input if the API key is missing or calls fail.
 *
 * Setup: set  VITE_OLA_MAPS_API_KEY  in your .env file.
 *   VITE_OLA_MAPS_API_KEY=your_ola_maps_key_here
 *
 * onSelect(addr) returns:
 *   { street, area, city, state, pincode, country, lat?, lng?, formattedAddress? }
 */

import { useEffect, useRef, useState, useCallback } from "react";

const OLA_API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY || "";
const AUTOCOMPLETE_URL = "https://api.olamaps.io/places/v1/autocomplete";
const DETAILS_URL      = "https://api.olamaps.io/places/v1/details";
const DEBOUNCE_MS      = 350;

// ── Parse Ola Maps address components into our address shape ────────────────
function parseOlaComponents(components = []) {
  const get = (type) =>
    components.find((c) => c.types?.includes(type))?.long_name || "";

  return {
    street:  [get("street_number"), get("route")].filter(Boolean).join(" ")
             || get("premise") || get("establishment") || "",
    area:    get("sublocality_level_1") || get("sublocality") || get("neighborhood") || "",
    city:    get("locality") || get("administrative_area_level_2") || "",
    state:   get("administrative_area_level_1") || "",
    pincode: get("postal_code") || "",
    country: get("country") || "India",
  };
}

// ── Ola Maps REST calls ─────────────────────────────────────────────────────
async function fetchSuggestions(input) {
  if (!input.trim() || !OLA_API_KEY) return [];
  const url = `${AUTOCOMPLETE_URL}?input=${encodeURIComponent(input)}&api_key=${OLA_API_KEY}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "X-Request-Id": crypto.randomUUID() },
  });
  if (!res.ok) throw new Error("Autocomplete failed");
  const data = await res.json();
  // Ola returns { predictions: [...] }
  return data.predictions || [];
}

async function fetchPlaceDetails(placeId) {
  if (!placeId || !OLA_API_KEY) return null;
  const url = `${DETAILS_URL}?place_id=${encodeURIComponent(placeId)}&api_key=${OLA_API_KEY}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "X-Request-Id": crypto.randomUUID() },
  });
  if (!res.ok) throw new Error("Place details failed");
  const data = await res.json();
  // Ola returns { result: { ... } }
  return data.result || null;
}

// ── Manual address form ─────────────────────────────────────────────────────
function ManualFields({ value, onChange }) {
  const field = (name, label, placeholder, opts = {}) => (
    <div className={opts.full ? "col-span-2" : ""}>
      <label className="block text-xs font-semibold text-ink-700 mb-1">
        {label} {opts.required && <span className="text-red-400">*</span>}
      </label>
      <input
        value={value[name] || ""}
        onChange={e => onChange({ ...value, [name]: e.target.value })}
        placeholder={placeholder}
        className="input-base text-sm"
      />
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      {field("buildingNameOrNumber", "Building / Flat No.", "e.g. 204, Sunrise Apt", { full: true, required: true })}
      {field("area",    "Area / Locality", "e.g. Navrangpura",  { required: true })}
      {field("city",    "City",            "e.g. Ahmedabad",    { required: true })}
      {field("state",   "State",           "e.g. Gujarat",      { required: true })}
      {field("pincode", "Pincode",         "e.g. 380009",       { required: true })}
      {field("country", "Country",         "India")}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function AddressPicker({
  onSelect,
  placeholder = "Search address, area, city…",
  className = "",
  showManualFields = false,
}) {
  const [query, setQuery]             = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [selected, setSelected]       = useState(false); // true after a suggestion is picked
  const [error, setError]             = useState("");
  const [open, setOpen]               = useState(false);
  const [manualAddr, setManualAddr]   = useState({
    buildingNameOrNumber: "", area: "", city: "", state: "", pincode: "", country: "India",
  });

  const debounceTimer = useRef(null);
  const wrapperRef    = useRef(null);
  const noApiKey      = !OLA_API_KEY;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    if (!query.trim() || query.length < 3 || selected) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const results = await fetchSuggestions(query);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch {
        setError("Search unavailable — fill fields manually.");
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceTimer.current);
  }, [query, selected]);

  // Handle suggestion selection
  const handleSelect = useCallback(async (suggestion) => {
    setSelected(true);
    setOpen(false);
    setQuery(suggestion.description || suggestion.structured_formatting?.main_text || "");
    setSuggestions([]);
    setLoading(true);

    try {
      const detail = await fetchPlaceDetails(suggestion.place_id);
      if (!detail) throw new Error("No detail");

      const components = detail.address_components || [];
      const parsed     = parseOlaComponents(components);
      const lat        = detail.geometry?.location?.lat;
      const lng        = detail.geometry?.location?.lng;
      const formatted  = detail.formatted_address || suggestion.description || "";

      // Auto-fill manual fields
      setManualAddr(prev => ({
        ...prev,
        area:    parsed.area    || prev.area,
        city:    parsed.city    || prev.city,
        state:   parsed.state   || prev.state,
        pincode: parsed.pincode || prev.pincode,
        country: parsed.country || prev.country,
      }));

      onSelect?.({ ...parsed, lat, lng, formattedAddress: formatted });
    } catch {
      setError("Could not get address details — fill fields manually.");
    } finally {
      setLoading(false);
    }
  }, [onSelect]);

  // Manual field changes bubble up to parent
  const handleManualChange = useCallback((addr) => {
    setManualAddr(addr);
    onSelect?.({
      street:  addr.buildingNameOrNumber || "",
      area:    addr.area,
      city:    addr.city,
      state:   addr.state,
      pincode: addr.pincode,
      country: addr.country || "India",
    });
  }, [onSelect]);

  const handleQueryChange = (e) => {
    setSelected(false);
    setQuery(e.target.value);
    if (!e.target.value.trim()) setSuggestions([]);
  };

  return (
    <div className={className} ref={wrapperRef}>

      {/* ── Search bar (hidden if no API key) ── */}
      {!noApiKey && (
        <div className="relative">
          {/* Pin icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none z-10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>

          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={placeholder}
            className="input-base pl-9 pr-9"
            autoComplete="off"
          />

          {/* Spinner */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-ink-200 border-t-brand-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Clear button */}
          {query && !loading && (
            <button
              type="button"
              onClick={() => { setQuery(""); setSuggestions([]); setSelected(false); setOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-600 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}

          {/* Suggestions dropdown */}
          {open && suggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-ink-100 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sand-50 border-b border-ink-100">
                {/* Ola Maps attribution */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-400">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
                <span className="text-[10px] text-ink-400 font-medium">Powered by Ola Maps</span>
              </div>
              <ul className="max-h-60 overflow-y-auto divide-y divide-ink-50">
                {suggestions.map((s) => {
                  const main      = s.structured_formatting?.main_text    || s.description || "";
                  const secondary = s.structured_formatting?.secondary_text || "";
                  return (
                    <li key={s.place_id}>
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                        className="w-full text-left px-4 py-3 hover:bg-sand-50 transition-colors flex items-start gap-3 group"
                      >
                        <span className="mt-0.5 text-ink-300 group-hover:text-brand-500 flex-shrink-0 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink-900 truncate">{main}</p>
                          {secondary && (
                            <p className="text-xs text-ink-400 truncate mt-0.5">{secondary}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {!error && (
            <p className="text-xs text-ink-400 mt-1 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Search to auto-fill the fields below, or fill them manually.
            </p>
          )}
        </div>
      )}

      {/* ── No API key notice ── */}
      {noApiKey && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 flex-shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <p className="text-xs text-amber-700">
            Set <code className="font-mono font-bold">VITE_OLA_MAPS_API_KEY</code> in your <code className="font-mono">.env</code> to enable address search.
          </p>
        </div>
      )}

      {/* ── Error notice ── */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl mt-1 mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* ── Manual fields (shown when: always-on flag, no API key, or a selection was made to confirm) ── */}
      {(showManualFields || noApiKey || selected || error) && (
        <ManualFields value={manualAddr} onChange={handleManualChange} />
      )}
    </div>
  );
}
