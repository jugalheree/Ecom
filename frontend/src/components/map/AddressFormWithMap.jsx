/**
 * AddressFormWithMap.jsx
 *
 * Reusable address form component that:
 *  - Has a "Pick on Map" button → opens LocationPicker modal
 *  - When location is selected, auto-fills all address fields
 *  - Also supports manual entry
 *  - Calls onSubmit(addressData) with full address + coordinates
 *
 * Props:
 *   onSubmit(data)   — called with complete address object
 *   onCancel()       — called when user cancels
 *   loading          — bool, disables submit button
 *   initialData      — optional pre-filled address fields
 *   submitLabel      — button label (default "Save Address")
 */

import { useState } from "react";
import LocationPicker from "./LocationPicker";

export default function AddressFormWithMap({
  onSubmit,
  onCancel,
  loading = false,
  initialData = {},
  submitLabel = "Save Address",
}) {
  const [showMap, setShowMap] = useState(false);
  const [locationPinned, setLocationPinned] = useState(
    !!(initialData.location?.lat && initialData.location?.lng)
  );

  const [form, setForm] = useState({
    addressType: initialData.addressType || "HOME",
    buildingNameOrNumber: initialData.buildingNameOrNumber || "",
    landmark: initialData.landmark || "",
    area: initialData.area || "",
    city: initialData.city || "",
    state: initialData.state || "",
    country: initialData.country || "India",
    pincode: initialData.pincode || "",
    location: initialData.location || { lat: null, lng: null },
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Called when user confirms location on map
  const handleLocationSelect = (data) => {
    setForm((f) => ({
      ...f,
      buildingNameOrNumber: data.buildingNameOrNumber || f.buildingNameOrNumber,
      area: data.area || f.area,
      city: data.city || f.city,
      state: data.state || f.state,
      country: data.country || f.country,
      pincode: data.pincode || f.pincode,
      location: { lat: data.lat, lng: data.lng },
    }));
    setLocationPinned(true);
    setShowMap(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <>
      {/* Map Modal */}
      {showMap && (
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMap(false)}
          initialLat={form.location?.lat}
          initialLng={form.location?.lng}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Address Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Address Type
          </label>
          <select
            value={form.addressType}
            onChange={(e) => set("addressType", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="HOME">Home</option>
            <option value="SHOP">Shop</option>
            <option value="WAREHOUSE">Warehouse</option>
          </select>
        </div>

        {/* Map Picker Button */}
        <div
          onClick={() => setShowMap(true)}
          className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition ${
            locationPinned
              ? "border-green-400 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          }`}
        >
          <div className="text-2xl">{locationPinned ? "✅" : "📍"}</div>
          <div className="flex-1">
            {locationPinned ? (
              <>
                <p className="text-sm font-medium text-green-700">Location pinned on map</p>
                <p className="text-xs text-green-600">
                  {form.location.lat?.toFixed(5)}, {form.location.lng?.toFixed(5)}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">Pin on map for better accuracy</p>
                <p className="text-xs text-gray-500">
                  Tap to open map — search or drag pin to your exact location
                </p>
              </>
            )}
          </div>
          <span className="text-xs font-medium text-black bg-white border border-gray-200 px-3 py-1 rounded-lg">
            {locationPinned ? "Edit" : "Open Map"}
          </span>
        </div>

        {/* Building / Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Building / Number *
          </label>
          <input
            type="text"
            required
            value={form.buildingNameOrNumber}
            onChange={(e) => set("buildingNameOrNumber", e.target.value)}
            placeholder="Shop No. / Building Name / Flat"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Landmark */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Landmark
          </label>
          <input
            type="text"
            value={form.landmark}
            onChange={(e) => set("landmark", e.target.value)}
            placeholder="Near school / hospital / park"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Area / Street *
          </label>
          <input
            type="text"
            required
            value={form.area}
            onChange={(e) => set("area", e.target.value)}
            placeholder="Area or street name"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* City + State */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
            <input
              type="text"
              required
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Pincode + Country */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
            <input
              type="text"
              required
              value={form.pincode}
              onChange={(e) => set("pincode", e.target.value)}
              placeholder="6 digits"
              maxLength={6}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </>
  );
}
