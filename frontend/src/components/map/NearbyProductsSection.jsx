/**
 * NearbyProductsSection.jsx — FIXED
 * GPS error handling improved, no API key needed in frontend.
 */

import { useState, useEffect } from "react";
import { locationAPI } from "../../services/apis/index";
import LocationPicker from "./LocationPicker";

const RADIUS_OPTIONS = [5, 10, 20, 50];

export default function NearbyProductsSection() {
  const [userLocation, setUserLocation] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [radius, setRadius] = useState(10);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ totalProducts: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("distance");
  const [gpsLoading, setGpsLoading] = useState(false);

  // Restore saved location
  useEffect(() => {
    const saved = sessionStorage.getItem("buyerLocation");
    if (saved) {
      try { setUserLocation(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    fetchNearbyProducts();
  }, [userLocation, radius, page, sort]);

  const fetchNearbyProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await locationAPI.getNearbyProducts({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius,
        page,
        limit: 20,
        sort,
        saleType: "B2C",
      });
      const d = res.data?.data;
      setProducts(d?.products || []);
      setPagination(d?.pagination || { totalProducts: 0, totalPages: 1, currentPage: 1 });
    } catch {
      setError("Failed to load nearby products.");
    } finally {
      setLoading(false);
    }
  };

  const saveLocation = (loc) => {
    setUserLocation(loc);
    sessionStorage.setItem("buyerLocation", JSON.stringify(loc));
    setPage(1);
  };

  const handleLocationSelect = (data) => {
    saveLocation({
      lat: data.lat,
      lng: data.lng,
      label: [data.area, data.city].filter(Boolean).join(", ") || data.formattedAddress || "Selected location",
    });
    setShowPicker(false);
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert("Your browser doesn't support location detection.");
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await locationAPI.reverseGeocode(lat, lng);
          const data = res.data?.data;
          saveLocation({
            lat,
            lng,
            label: [data?.area, data?.city].filter(Boolean).join(", ") || "My Location",
          });
        } catch {
          saveLocation({ lat, lng, label: "My Location" });
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          alert(
            "Location access denied.\n\nTo enable:\n• Click the 🔒 lock icon in address bar\n• Set Location → Allow\n• Reload the page"
          );
        } else {
          alert("Could not get your location. Please pick manually on the map.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="w-full">
      {showPicker && (
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowPicker(false)}
          initialLat={userLocation?.lat}
          initialLng={userLocation?.lng}
        />
      )}

      {/* Location bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5 flex-wrap">
              <span>📍</span>
              {userLocation ? (
                <>Showing vendors near <span className="font-semibold text-black">{userLocation.label}</span></>
              ) : (
                "Share your location to see products from nearby vendors"
              )}
            </p>
            {!userLocation && (
              <p className="text-xs text-gray-400 mt-0.5">We'll show products based on how close the vendor is to you</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleUseGPS}
              disabled={gpsLoading}
              className="flex items-center gap-1.5 text-xs font-medium border border-gray-300 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition disabled:opacity-50"
            >
              {gpsLoading ? "⌛" : "🎯"} {gpsLoading ? "Detecting..." : "GPS"}
            </button>
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 text-xs font-medium bg-black text-white hover:bg-gray-900 px-3 py-2 rounded-xl transition"
            >
              🗺️ {userLocation ? "Change" : "Pick on Map"}
            </button>
          </div>
        </div>

        {userLocation && (
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Radius:</span>
              <div className="flex gap-1">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRadius(r); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                      radius === r ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-500">Sort:</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="distance">Nearest first</option>
                <option value="newest">Newest</option>
                <option value="price_low_high">Price: Low → High</option>
                <option value="price_high_low">Price: High → Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {!userLocation ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🗺️</div>
          <p className="text-base font-medium text-gray-600">No location selected</p>
          <p className="text-sm mt-1">Use GPS or pick on map to find nearby vendors</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🏪</div>
          <p className="text-base font-medium text-gray-600">No vendors found within {radius} km</p>
          <p className="text-sm mt-1">Try a larger radius or change your location</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {pagination.totalProducts} product{pagination.totalProducts !== 1 ? "s" : ""} within {radius} km
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <NearbyProductCard key={product._id} product={product} />
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition"
              >← Prev</button>
              <span className="px-4 py-2 text-sm text-gray-600">{page} / {pagination.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition"
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NearbyProductCard({ product }) {
  const { deliveryInfo, distanceKm } = product;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden group cursor-pointer">
      <div className="aspect-square bg-gray-100 overflow-hidden relative">
        {product.image ? (
          <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">📦</div>
        )}
        <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)}m` : `${distanceKm.toFixed(1)} km`}
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 truncate mb-0.5">{deliveryInfo?.shopName}</p>
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{product.title}</p>
        <p className="text-base font-bold text-gray-900 mt-1.5">₹{product.price?.toLocaleString("en-IN")}</p>
        <div className="mt-1.5 text-[11px]">
          {deliveryInfo?.deliveryCharge === 0 ? (
            <span className="text-green-600 font-medium">✓ Free delivery</span>
          ) : deliveryInfo?.deliveryCharge > 0 ? (
            <span className="text-gray-500">🚚 ₹{deliveryInfo.deliveryCharge.toFixed(0)} delivery</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
