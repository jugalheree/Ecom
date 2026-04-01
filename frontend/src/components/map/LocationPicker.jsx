// /**
//  * LocationPicker.jsx — FIXED
//  *
//  * Uses Leaflet.js for the map (free, no API key in frontend).
//  * All geocoding/autocomplete goes through YOUR backend → Ola Maps API.
//  * GPS works via browser navigator.geolocation (no key needed).
//  */

// import { useState, useEffect, useRef, useCallback } from "react";
// import { locationAPI } from "../../services/apis/index";

// const DEFAULT_LAT = 23.0225; // Ahmedabad — change to your city
// const DEFAULT_LNG = 72.5714;

// // Inject Leaflet CSS + JS once
// function useLeaflet(onReady) {
//   useEffect(() => {
//     // Already loaded
//     if (window.L) { onReady(); return; }

//     const link = document.createElement("link");
//     link.rel = "stylesheet";
//     link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
//     document.head.appendChild(link);

//     const script = document.createElement("script");
//     script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
//     script.onload = onReady;
//     script.onerror = () => console.error("Leaflet failed to load");
//     document.head.appendChild(script);
//   }, []);
// }

// export default function LocationPicker({
//   onLocationSelect,
//   onClose,
//   initialLat,
//   initialLng,
// }) {
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const markerRef = useRef(null);

//   const [leafletReady, setLeafletReady] = useState(!!window.L);
//   const [mapError, setMapError] = useState("");

//   const latRef = useRef(initialLat || DEFAULT_LAT);
//   const lngRef = useRef(initialLng || DEFAULT_LNG);
//   const [displayLat, setDisplayLat] = useState(initialLat || DEFAULT_LAT);
//   const [displayLng, setDisplayLng] = useState(initialLng || DEFAULT_LNG);

//   const [query, setQuery] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [gpsLoading, setGpsLoading] = useState(false);
//   const [geocodingLoading, setGeocodingLoading] = useState(false);
//   const [addressInfo, setAddressInfo] = useState(null);

//   const debounceRef = useRef(null);

//   useLeaflet(() => setLeafletReady(true));

//   // ── Init Leaflet map ──
//   useEffect(() => {
//     if (!leafletReady || !mapRef.current || mapInstanceRef.current) return;

//     try {
//       const L = window.L;

//       const map = L.map(mapRef.current, {
//         center: [latRef.current, lngRef.current],
//         zoom: 15,
//         zoomControl: true,
//       });

//       // OpenStreetMap tiles — completely free, no key
//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution: "© OpenStreetMap contributors",
//         maxZoom: 19,
//       }).addTo(map);

//       // Custom red pin icon
//       const icon = L.divIcon({
//         className: "",
//         html: `<div style="
//           width:32px;height:42px;
//           background:url('https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png') no-repeat center/contain;
//           filter: hue-rotate(0deg);
//         "></div>`,
//         iconSize: [32, 42],
//         iconAnchor: [16, 42],
//       });

//       const marker = L.marker([latRef.current, lngRef.current], {
//         draggable: true,
//         icon,
//       }).addTo(map);

//       marker.on("dragend", () => {
//         const pos = marker.getLatLng();
//         latRef.current = pos.lat;
//         lngRef.current = pos.lng;
//         setDisplayLat(pos.lat);
//         setDisplayLng(pos.lng);
//         doReverseGeocode(pos.lat, pos.lng);
//       });

//       map.on("click", (e) => {
//         const { lat, lng } = e.latlng;
//         marker.setLatLng([lat, lng]);
//         latRef.current = lat;
//         lngRef.current = lng;
//         setDisplayLat(lat);
//         setDisplayLng(lng);
//         doReverseGeocode(lat, lng);
//       });

//       mapInstanceRef.current = map;
//       markerRef.current = marker;

//       // Initial reverse geocode for default location
//       doReverseGeocode(latRef.current, lngRef.current);

//       // Fix Leaflet sizing issue inside modals
//       setTimeout(() => map.invalidateSize(), 100);
//     } catch (err) {
//       console.error("Map init error:", err);
//       setMapError("Map could not be initialized.");
//     }

//     return () => {
//       if (mapInstanceRef.current) {
//         mapInstanceRef.current.remove();
//         mapInstanceRef.current = null;
//         markerRef.current = null;
//       }
//     };
//   }, [leafletReady]);

//   // ── Reverse geocode via backend ──
//   const doReverseGeocode = useCallback(async (lat, lng) => {
//     setGeocodingLoading(true);
//     try {
//       const res = await locationAPI.reverseGeocode(lat, lng);
//       const data = res.data?.data;
//       if (data) {
//         setAddressInfo(data);
//         setQuery(data.formattedAddress || "");
//       }
//     } catch (err) {
//       // Silently fail — user can still confirm coordinates
//       console.warn("Reverse geocode failed:", err?.response?.data || err.message);
//     } finally {
//       setGeocodingLoading(false);
//     }
//   }, []);

//   // ── Move map to new coords ──
//   const flyTo = (lat, lng, zoom = 16) => {
//     if (mapInstanceRef.current && markerRef.current) {
//       mapInstanceRef.current.setView([lat, lng], zoom);
//       markerRef.current.setLatLng([lat, lng]);
//     }
//     latRef.current = lat;
//     lngRef.current = lng;
//     setDisplayLat(lat);
//     setDisplayLng(lng);
//   };

//   // ── Autocomplete search ──
//   const handleSearchChange = (e) => {
//     const val = e.target.value;
//     setQuery(val);
//     setShowSuggestions(true);

//     if (debounceRef.current) clearTimeout(debounceRef.current);

//     if (val.length < 2) { setSuggestions([]); return; }

//     debounceRef.current = setTimeout(async () => {
//       setSearchLoading(true);
//       try {
//         const res = await locationAPI.autocomplete(val, latRef.current, lngRef.current);
//         setSuggestions(res.data?.data || []);
//       } catch {
//         setSuggestions([]);
//       } finally {
//         setSearchLoading(false);
//       }
//     }, 400);
//   };

//   // ── Suggestion selected ──
//   const handleSuggestionSelect = async (suggestion) => {
//     setQuery(suggestion.description);
//     setSuggestions([]);
//     setShowSuggestions(false);
//     setGeocodingLoading(true);

//     try {
//       const res = await locationAPI.geocodePlaceId(suggestion.placeId);
//       const data = res.data?.data;
//       if (data) {
//         flyTo(data.lat, data.lng);
//         setAddressInfo(data);
//         setQuery(data.formattedAddress || suggestion.description);
//       }
//     } catch (err) {
//       console.warn("Geocode failed:", err?.response?.data || err.message);
//     } finally {
//       setGeocodingLoading(false);
//     }
//   };

//   // ── GPS — use browser geolocation ──
//   const handleUseMyLocation = () => {
//     if (!navigator.geolocation) {
//       alert("Your browser doesn't support GPS location.");
//       return;
//     }

//     setGpsLoading(true);

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const { latitude, longitude } = pos.coords;
//         flyTo(latitude, longitude, 16);
//         doReverseGeocode(latitude, longitude);
//         setGpsLoading(false);
//       },
//       (err) => {
//         setGpsLoading(false);
//         // Give a useful message based on the actual error code
//         if (err.code === 1) {
//           alert(
//             "Location access was denied.\n\n" +
//             "To fix this:\n" +
//             "• Click the 🔒 lock icon in your browser address bar\n" +
//             "• Set Location → Allow\n" +
//             "• Then try again"
//           );
//         } else if (err.code === 2) {
//           alert("Could not detect your location. Try searching your area manually.");
//         } else {
//           alert("Location request timed out. Please try again.");
//         }
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
//     );
//   };

//   // ── Confirm ──
//   const handleConfirm = () => {
//     onLocationSelect({
//       lat: latRef.current,
//       lng: lngRef.current,
//       formattedAddress: addressInfo?.formattedAddress || query || "",
//       buildingNameOrNumber: addressInfo?.buildingNameOrNumber || "",
//       area: addressInfo?.area || "",
//       city: addressInfo?.city || "",
//       state: addressInfo?.state || "",
//       country: addressInfo?.country || "India",
//       pincode: addressInfo?.pincode || "",
//     });
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
//       <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl flex flex-col shadow-2xl"
//            style={{ maxHeight: "92vh" }}>

//         {/* Header */}
//         <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-900">Pin your location</h2>
//             <p className="text-xs text-gray-500 mt-0.5">Search, drag the pin, or tap on the map</p>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl font-light"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Search */}
//         <div className="px-4 pt-3 pb-1 relative flex-shrink-0" style={{ zIndex: 1000 }}>
//           <div className="relative">
//             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
//             <input
//               type="text"
//               value={query}
//               onChange={handleSearchChange}
//               onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
//               onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
//               placeholder="Search for area, street or building..."
//               className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
//             />
//             {searchLoading && (
//               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs animate-pulse">...</span>
//             )}
//           </div>

//           {/* Suggestions */}
//           {showSuggestions && suggestions.length > 0 && (
//             <div className="absolute left-4 right-4 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
//                  style={{ zIndex: 9999 }}>
//               {suggestions.map((s) => (
//                 <button
//                   key={s.placeId}
//                   onMouseDown={() => handleSuggestionSelect(s)}
//                   className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-start gap-2"
//                 >
//                   <span className="text-sm flex-shrink-0 mt-0.5">📍</span>
//                   <div className="min-w-0">
//                     <p className="text-sm font-medium text-gray-800 truncate">{s.mainText}</p>
//                     <p className="text-xs text-gray-500 truncate">{s.secondaryText}</p>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* GPS button */}
//         <div className="px-4 pb-2 flex-shrink-0">
//           <button
//             onClick={handleUseMyLocation}
//             disabled={gpsLoading}
//             className="flex items-center gap-2 text-sm font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl transition disabled:opacity-60"
//           >
//             <span>{gpsLoading ? "⌛" : "🎯"}</span>
//             {gpsLoading ? "Detecting location..." : "Use my current location"}
//           </button>
//         </div>

//         {/* Map */}
//         <div className="relative flex-1 mx-4 mb-2 rounded-xl overflow-hidden border border-gray-200"
//              style={{ minHeight: 260 }}>
//           {!leafletReady && (
//             <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
//               <div className="text-center">
//                 <div className="text-3xl mb-2 animate-bounce">🗺️</div>
//                 <p className="text-sm text-gray-500">Loading map...</p>
//               </div>
//             </div>
//           )}
//           {mapError && (
//             <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
//               <p className="text-sm text-red-500 text-center px-4">{mapError}</p>
//             </div>
//           )}
//           <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: 260 }} />
//         </div>

//         {/* Address preview */}
//         <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex-shrink-0" style={{ minHeight: 52 }}>
//           {geocodingLoading ? (
//             <p className="text-sm text-gray-400 animate-pulse">Fetching address...</p>
//           ) : addressInfo ? (
//             <div className="flex items-start gap-2">
//               <span className="text-green-500 text-sm mt-0.5">✓</span>
//               <div className="min-w-0">
//                 <p className="text-sm font-medium text-gray-800 truncate">
//                   {[addressInfo.buildingNameOrNumber, addressInfo.area].filter(Boolean).join(", ") || addressInfo.formattedAddress}
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {[addressInfo.city, addressInfo.state, addressInfo.pincode].filter(Boolean).join(", ")}
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <p className="text-sm text-gray-400">Tap anywhere on the map to pin your location</p>
//           )}
//         </div>

//         {/* Confirm */}
//         <div className="px-4 pb-5 pt-2 flex-shrink-0">
//           <button
//             onClick={handleConfirm}
//             className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition"
//           >
//             Confirm this location
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }






















/**
 * LocationPicker.jsx — with Smart GPS Accuracy
 *
 * GPS improvements:
 *  - Uses watchPosition instead of getCurrentPosition
 *  - Keeps watching until accuracy <= 80m (good) or 10s passes
 *  - Shows a blue accuracy circle on the map so user can see how precise it is
 *  - If accuracy is poor (>200m), shows a warning and lets user drag pin manually
 *  - Shows live accuracy meter while detecting
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { locationAPI } from "../../services/apis/index";

const DEFAULT_LAT = 23.0225;
const DEFAULT_LNG = 72.5714;
const GOOD_ACCURACY_METERS = 80;   // accept immediately if this accurate
const MAX_WAIT_MS = 12000;          // stop watching after 12 seconds no matter what

function useLeaflet(onReady) {
  useEffect(() => {
    if (window.L) { onReady(); return; }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = onReady;
    script.onerror = () => console.error("Leaflet failed to load");
    document.head.appendChild(script);
  }, []);
}

export default function LocationPicker({ onLocationSelect, onClose, initialLat, initialLng }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const accuracyCircleRef = useRef(null); // blue accuracy circle
  const watchIdRef = useRef(null);        // geolocation watch id
  const watchTimerRef = useRef(null);     // fallback timeout
  const bestPositionRef = useRef(null);   // best reading so far

  const [leafletReady, setLeafletReady] = useState(!!window.L);
  const [mapError, setMapError] = useState("");

  const latRef = useRef(initialLat || DEFAULT_LAT);
  const lngRef = useRef(initialLng || DEFAULT_LNG);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [addressInfo, setAddressInfo] = useState(null);
  const debounceRef = useRef(null);

  // GPS state
  const [gpsState, setGpsState] = useState("idle"); // idle | watching | done | error
  const [gpsAccuracy, setGpsAccuracy] = useState(null); // meters
  const [gpsWarning, setGpsWarning] = useState(""); // shown if accuracy is poor

  useLeaflet(() => setLeafletReady(true));

  // ── Init map ──
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return;

    try {
      const L = window.L;
      const map = L.map(mapRef.current, { center: [latRef.current, lngRef.current], zoom: 15 });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([latRef.current, lngRef.current], { draggable: true }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        updatePosition(pos.lat, pos.lng);
        doReverseGeocode(pos.lat, pos.lng);
      });

      map.on("click", (e) => {
        marker.setLatLng([e.latlng.lat, e.latlng.lng]);
        updatePosition(e.latlng.lat, e.latlng.lng);
        doReverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      doReverseGeocode(latRef.current, lngRef.current);
      setTimeout(() => map.invalidateSize(), 100);
    } catch (err) {
      console.error("Map init error:", err);
      setMapError("Map could not be initialized.");
    }

    return () => {
      stopWatching();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [leafletReady]);

  const updatePosition = (lat, lng) => {
    latRef.current = lat;
    lngRef.current = lng;
  };

  const flyTo = (lat, lng, zoom = 16) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoom);
      markerRef.current.setLatLng([lat, lng]);
    }
    updatePosition(lat, lng);
  };

  // ── Draw/update blue accuracy circle on map ──
  const drawAccuracyCircle = (lat, lng, accuracyMeters) => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    // Remove old circle
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove();
      accuracyCircleRef.current = null;
    }

    // Only draw if accuracy is meaningful
    if (accuracyMeters && accuracyMeters < 5000) {
      accuracyCircleRef.current = L.circle([lat, lng], {
        radius: accuracyMeters,
        color: "#4A90E2",
        fillColor: "#4A90E2",
        fillOpacity: 0.12,
        weight: 2,
        dashArray: "6 4",
      }).addTo(mapInstanceRef.current);
    }
  };

  // ── Stop watching GPS ──
  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (watchTimerRef.current) {
      clearTimeout(watchTimerRef.current);
      watchTimerRef.current = null;
    }
  };

  // ── Accept a GPS position (best we have) ──
  const acceptPosition = (lat, lng, accuracy) => {
    stopWatching();
    flyTo(lat, lng, 17);
    drawAccuracyCircle(lat, lng, accuracy);
    setGpsAccuracy(Math.round(accuracy));
    setGpsState("done");

    // Warn user if accuracy is poor so they know to drag the pin
    if (accuracy > 200) {
      setGpsWarning(
        `GPS accuracy is ~${Math.round(accuracy)}m — your device has no GPS chip (desktop/laptop). ` +
        `The blue circle shows the uncertainty area. Drag the pin to your exact spot.`
      );
    } else if (accuracy > 80) {
      setGpsWarning(`Accuracy: ~${Math.round(accuracy)}m. You can drag the pin to fine-tune.`);
    } else {
      setGpsWarning("");
    }

    doReverseGeocode(lat, lng);
  };

  // ── Main GPS handler ──
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser doesn't support location detection.");
      return;
    }

    // Stop any existing watch
    stopWatching();
    bestPositionRef.current = null;
    setGpsState("watching");
    setGpsAccuracy(null);
    setGpsWarning("");

    // Remove old accuracy circle
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove();
      accuracyCircleRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        // Update live accuracy display
        setGpsAccuracy(Math.round(accuracy));

        // Keep track of best reading
        if (
          !bestPositionRef.current ||
          accuracy < bestPositionRef.current.accuracy
        ) {
          bestPositionRef.current = { latitude, longitude, accuracy };
        }

        // Move map live as we get readings (so user sees it homing in)
        flyTo(latitude, longitude, 16);

        // If accuracy is good enough → accept immediately
        if (accuracy <= GOOD_ACCURACY_METERS) {
          acceptPosition(latitude, longitude, accuracy);
        }
      },
      (err) => {
        stopWatching();
        setGpsState("error");
        setGpsAccuracy(null);

        if (err.code === 1) {
          alert(
            "Location access denied.\n\n" +
            "To fix:\n" +
            "• Click the 🔒 lock icon in the address bar\n" +
            "• Set Location → Allow\n" +
            "• Reload the page and try again"
          );
        } else if (err.code === 2) {
          alert("Could not detect location. Try searching manually.");
        } else {
          // Timeout — use best reading if we have one
          if (bestPositionRef.current) {
            const b = bestPositionRef.current;
            acceptPosition(b.latitude, b.longitude, b.accuracy);
          } else {
            alert("Location timed out. Please search manually.");
          }
        }
      },
      { enableHighAccuracy: true, timeout: MAX_WAIT_MS, maximumAge: 0 }
    );

    // Fallback: after MAX_WAIT_MS, stop watching and use best position so far
    watchTimerRef.current = setTimeout(() => {
      if (watchIdRef.current !== null) {
        // Still watching → force-accept best reading
        if (bestPositionRef.current) {
          const b = bestPositionRef.current;
          acceptPosition(b.latitude, b.longitude, b.accuracy);
        } else {
          stopWatching();
          setGpsState("idle");
        }
      }
    }, MAX_WAIT_MS + 500);
  };

  // ── Reverse geocode ──
  const doReverseGeocode = useCallback(async (lat, lng) => {
    setGeocodingLoading(true);
    try {
      const res = await locationAPI.reverseGeocode(lat, lng);
      const data = res.data?.data;
      if (data) { setAddressInfo(data); setQuery(data.formattedAddress || ""); }
    } catch (err) {
      console.warn("Reverse geocode failed:", err?.response?.data || err.message);
    } finally {
      setGeocodingLoading(false);
    }
  }, []);

  // ── Autocomplete ──
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await locationAPI.autocomplete(val, latRef.current, lngRef.current);
        setSuggestions(res.data?.data || []);
      } catch { setSuggestions([]); }
      finally { setSearchLoading(false); }
    }, 400);
  };

  const handleSuggestionSelect = async (suggestion) => {
    setQuery(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
    setGeocodingLoading(true);
    try {
      const res = await locationAPI.geocodePlaceId(suggestion.placeId);
      const data = res.data?.data;
      if (data) {
        flyTo(data.lat, data.lng);
        setAddressInfo(data);
        setQuery(data.formattedAddress || suggestion.description);
        // Remove accuracy circle when user manually picks
        if (accuracyCircleRef.current) { accuracyCircleRef.current.remove(); accuracyCircleRef.current = null; }
        setGpsWarning("");
      }
    } catch (err) { console.warn("Geocode failed:", err?.response?.data || err.message); }
    finally { setGeocodingLoading(false); }
  };

  const handleConfirm = () => {
    onLocationSelect({
      lat: latRef.current,
      lng: lngRef.current,
      formattedAddress: addressInfo?.formattedAddress || query || "",
      buildingNameOrNumber: addressInfo?.buildingNameOrNumber || "",
      area: addressInfo?.area || "",
      city: addressInfo?.city || "",
      state: addressInfo?.state || "",
      country: addressInfo?.country || "India",
      pincode: addressInfo?.pincode || "",
    });
  };

  // GPS button label / state
  const gpsButtonContent = () => {
    if (gpsState === "watching") {
      return (
        <span className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 animate-ping" />
          {gpsAccuracy
            ? `Improving accuracy... ~${gpsAccuracy}m`
            : "Detecting location..."}
        </span>
      );
    }
    if (gpsState === "done") {
      return <span>🎯 Location found ({gpsAccuracy}m accuracy) — tap to retry</span>;
    }
    return <span>🎯 Use my current location</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl flex flex-col shadow-2xl"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pin your location</h2>
            <p className="text-xs text-gray-500 mt-0.5">Search, drag the pin, or tap on the map</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl">✕</button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-1 relative flex-shrink-0" style={{ zIndex: 1000 }}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search for area, street or building..."
              className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            {searchLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs animate-pulse">...</span>}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-4 right-4 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden" style={{ zIndex: 9999 }}>
              {suggestions.map((s) => (
                <button key={s.placeId} onMouseDown={() => handleSuggestionSelect(s)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-start gap-2">
                  <span className="text-sm flex-shrink-0 mt-0.5">📍</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.mainText}</p>
                    <p className="text-xs text-gray-500 truncate">{s.secondaryText}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS button */}
        <div className="px-4 pb-2 flex-shrink-0 space-y-2">
          <button
            onClick={handleUseMyLocation}
            disabled={gpsState === "watching"}
            className={`flex items-center gap-2 text-sm font-medium border px-4 py-2 rounded-xl transition disabled:opacity-70 ${
              gpsState === "done"
                ? "bg-green-50 border-green-300 text-green-800"
                : gpsState === "watching"
                ? "bg-blue-50 border-blue-300 text-blue-800"
                : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
            }`}
          >
            {gpsButtonContent()}
          </button>

          {/* Accuracy warning */}
          {gpsWarning && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <span className="text-amber-500 text-sm flex-shrink-0">⚠️</span>
              <p className="text-xs text-amber-800 leading-relaxed">{gpsWarning}</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="relative flex-1 mx-4 mb-2 rounded-xl overflow-hidden border border-gray-200" style={{ minHeight: 260 }}>
          {!leafletReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="text-3xl mb-2 animate-bounce">🗺️</div>
                <p className="text-sm text-gray-500">Loading map...</p>
              </div>
            </div>
          )}
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
              <p className="text-sm text-red-500 text-center px-4">{mapError}</p>
            </div>
          )}
          <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: 260 }} />
        </div>

        {/* Address preview */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex-shrink-0" style={{ minHeight: 52 }}>
          {geocodingLoading ? (
            <p className="text-sm text-gray-400 animate-pulse">Fetching address...</p>
          ) : addressInfo ? (
            <div className="flex items-start gap-2">
              <span className="text-green-500 text-sm mt-0.5">✓</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {[addressInfo.buildingNameOrNumber, addressInfo.area].filter(Boolean).join(", ") || addressInfo.formattedAddress}
                </p>
                <p className="text-xs text-gray-500">
                  {[addressInfo.city, addressInfo.state, addressInfo.pincode].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Tap anywhere on the map to pin your location</p>
          )}
        </div>

        {/* Confirm */}
        <div className="px-4 pb-5 pt-2 flex-shrink-0">
          <button
            onClick={handleConfirm}
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition"
          >
            Confirm this location
          </button>
        </div>
      </div>
    </div>
  );
}