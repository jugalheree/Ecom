import { useState } from "react";
import { vendorAPI, userAPI } from "../../services/apis/index";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

export default function VendorSetup() {
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);

  const [step, setStep] = useState(1);
  const [vendorId, setVendorId] = useState(null);
  const [addressId, setAddressId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    shopName: "",
    businessType: "RETAIL",
    panNumber: "",
    gstNumber: "",
    freeDeliveryDistanceKm: "5",
    deliveryChargePerKm: "10",
  });

  const [address, setAddress] = useState({
    addressType: "SHOP",
    buildingNameOrNumber: "",
    landmark: "",
    area: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });

  const [documents, setDocuments] = useState([]);

  // Step 1: Create vendor profile
  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!profile.shopName || !profile.panNumber || !profile.gstNumber) {
      showToast({ message: "Please fill all required fields", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await vendorAPI.createProfile({
        ...profile,
        freeDeliveryDistanceKm: Number(profile.freeDeliveryDistanceKm),
        deliveryChargePerKm: Number(profile.deliveryChargePerKm),
      });
      setVendorId(res.data?.data?._id);
      showToast({ message: "Profile created! Now add your shop address.", type: "success" });
      setStep(2);
    } catch (err) {
      showToast({ message: err.message || "Failed to create profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create and attach address
  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!address.buildingNameOrNumber || !address.area || !address.city || !address.state || !address.pincode) {
      showToast({ message: "Please fill all required address fields", type: "error" });
      return;
    }

    if (!/^\d{6}$/.test(address.pincode)) {
      showToast({ message: "Enter valid 6-digit pincode", type: "error" });
      return;
    }

    setLoading(true);
    try {
      // Create address
      const addrRes = await userAPI.createAddress(address);
      const newAddressId = addrRes.data?.data?._id;
      setAddressId(newAddressId);

      // Attach to vendor
      await vendorAPI.attachAddress(vendorId, { addressId: newAddressId });

      showToast({ message: "Address attached! Now upload your documents.", type: "success" });
      setStep(3);
    } catch (err) {
      if (err.status === 409) {
        showToast({ message: "Address already exists", type: "error" });
      } else {
        showToast({ message: err.message || "Failed to save address", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Upload documents
  const handleUploadDocuments = async () => {
    if (documents.length === 0) {
      showToast({ message: "Please upload at least one document", type: "error" });
      return;
    }

    const formData = new FormData();
    documents.forEach((doc) => formData.append("documents", doc));

    setLoading(true);
    try {
      await vendorAPI.uploadDocuments(formData);
      showToast({
        message: "Documents submitted! Your account is under review. You'll be notified once approved.",
        type: "success",
      });
      navigate("/vendor/dashboard");
    } catch (err) {
      showToast({ message: err.message || "Document upload failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Business Profile", "Shop Address", "Verification Docs"];

  return (
    <div className="min-h-screen bg-ink-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-ink-900 mb-2">
            Set up your vendor profile
          </h1>
          <p className="text-ink-500">
            Complete these steps to start selling on TradeSphere.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === i + 1
                      ? "bg-black text-white"
                      : step > i + 1
                      ? "bg-emerald-500 text-white"
                      : "bg-ink-200 text-ink-500"
                  }`}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className="text-xs text-ink-500 mt-1 whitespace-nowrap">{label}</span>
              </div>
              {i < 2 && <div className="w-12 h-px bg-ink-300 mb-4" />}
            </div>
          ))}
        </div>

        <Card className="p-10 border-2 border-ink-200">
          {/* STEP 1: Profile */}
          {step === 1 && (
            <form onSubmit={handleCreateProfile} className="space-y-6">
              <h2 className="text-xl font-semibold text-ink-900">Business Profile</h2>

              <Input
                label="Shop Name *"
                placeholder="Your shop or business name"
                value={profile.shopName}
                onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Business Type *
                </label>
                <select
                  value={profile.businessType}
                  onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
                  className="w-full rounded-xl border border-ink-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                >
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="MANUFACTURER">Manufacturer</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </div>

              <Input
                label="PAN Number *"
                placeholder="e.g. ABCDE1234F"
                value={profile.panNumber}
                onChange={(e) => setProfile({ ...profile, panNumber: e.target.value.toUpperCase() })}
              />

              <Input
                label="GST Number *"
                placeholder="e.g. 22AAAAA0000A1Z5"
                value={profile.gstNumber}
                onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value.toUpperCase() })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Free delivery distance (km)"
                  type="number"
                  min="0"
                  value={profile.freeDeliveryDistanceKm}
                  onChange={(e) => setProfile({ ...profile, freeDeliveryDistanceKm: e.target.value })}
                />
                <Input
                  label="Delivery charge per km (₹)"
                  type="number"
                  min="0"
                  value={profile.deliveryChargePerKm}
                  onChange={(e) => setProfile({ ...profile, deliveryChargePerKm: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-ink-900 transition disabled:opacity-50"
              >
                {loading ? "Creating profile..." : "Next: Add address →"}
              </button>
            </form>
          )}

          {/* STEP 2: Address */}
          {step === 2 && (
            <form onSubmit={handleCreateAddress} className="space-y-5">
              <h2 className="text-xl font-semibold text-ink-900">Shop Address</h2>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Address Type
                </label>
                <select
                  value={address.addressType}
                  onChange={(e) => setAddress({ ...address, addressType: e.target.value })}
                  className="w-full rounded-xl border border-ink-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="SHOP">Shop</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="HOME">Home</option>
                </select>
              </div>

              <Input
                label="Building / Number *"
                placeholder="Shop No. / Building Name"
                value={address.buildingNameOrNumber}
                onChange={(e) => setAddress({ ...address, buildingNameOrNumber: e.target.value })}
              />
              <Input
                label="Landmark"
                placeholder="Near school / park"
                value={address.landmark}
                onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
              />
              <Input
                label="Area / Street *"
                placeholder="Area or street name"
                value={address.area}
                onChange={(e) => setAddress({ ...address, area: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City *"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
                <Input
                  label="State *"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Pincode *"
                  placeholder="6 digits"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                />
                <Input
                  label="Country"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-ink-900 transition disabled:opacity-50"
              >
                {loading ? "Saving address..." : "Next: Upload documents →"}
              </button>
            </form>
          )}

          {/* STEP 3: Documents */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-ink-900">Verification Documents</h2>
              <p className="text-ink-500 text-sm">
                Upload business documents for verification (GST certificate, trade license, etc.). Max 5 files.
              </p>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Documents (JPEG, PNG, WEBP)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => setDocuments(Array.from(e.target.files).slice(0, 5))}
                  className="block w-full text-sm text-ink-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-ink-800"
                />
                {documents.length > 0 && (
                  <p className="text-sm text-emerald-600 mt-2">
                    ✓ {documents.length} file{documents.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>Note:</strong> Your account will be under review after submission. You'll be notified once admin approves your profile.
              </div>

              <button
                onClick={handleUploadDocuments}
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-ink-900 transition disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit for verification"}
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
