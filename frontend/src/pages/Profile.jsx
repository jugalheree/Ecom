import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import { userAPI } from "../services/apis/index";
import api from "../services/api";
import AddressPicker from "../components/ui/AddressPicker";

const ADDRESS_TYPES = ["HOME", "WORK", "SHOP", "OTHER"];

const emptyAddr = {
  addressType: "HOME", buildingNameOrNumber: "", landmark: "", area: "", city: "", state: "", country: "India", pincode: "",
};

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const showToast = useToastStore((s) => s.showToast);

  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState(emptyAddr);
  const [savingAddr, setSavingAddr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (user) setProfile({ name: user.name || "", phone: user.phone || "" });
    api.get("/api/user/profile").then((r) => {
      const u = r.data?.data;
      if (u) setProfile({ name: u.name || "", phone: u.phone || "" });
    }).catch(() => {});
    userAPI.getAddresses().then((r) => setAddresses(r.data?.data || [])).catch(() => {});
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { showToast({ message: "Name is required", type: "error" }); return; }
    setSaving(true);
    try {
      const res = await api.patch("/api/user/profile", profile);
      const updated = res.data?.data;
      if (updated && setUser) setUser({ ...user, ...updated });
      showToast({ message: "Profile updated!", type: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Update failed", type: "error" });
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) { showToast({ message: "Password must be at least 6 characters", type: "error" }); return; }
    if (passwords.newPassword !== passwords.confirm) { showToast({ message: "Passwords don't match", type: "error" }); return; }
    setSaving(true);
    try {
      await api.post("/api/user/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      showToast({ message: "Password changed!", type: "success" });
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to change password", type: "error" });
    } finally { setSaving(false); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await userAPI.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      showToast({ message: "Address removed", type: "info" });
    } catch {
      showToast({ message: "Could not remove address", type: "error" });
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.buildingNameOrNumber || !newAddr.city || !newAddr.state || !newAddr.pincode) {
      showToast({ message: "Please fill in all required fields", type: "error" });
      return;
    }
    setSavingAddr(true);
    try {
      const res = await userAPI.createAddress(newAddr);
      const saved = res.data?.data;
      setAddresses((prev) => [...prev, saved]);
      setShowAddressForm(false);
      setNewAddr(emptyAddr);
      showToast({ message: "Address saved!", type: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Could not save address", type: "error" });
    } finally {
      setSavingAddr(false);
    }
  };

  const pwStrength = (() => {
    const p = passwords.newPassword;
    if (!p) return null;
    if (p.length < 6) return { label: "Too short", color: "bg-red-400", w: "25%" };
    if (p.length < 8) return { label: "Weak", color: "bg-orange-400", w: "50%" };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: "Strong", color: "bg-green-500", w: "100%" };
    return { label: "Fair", color: "bg-yellow-400", w: "75%" };
  })();

  const TABS = [
    { key: "profile", label: "Profile", icon: "👤" },
    { key: "password", label: "Password", icon: "🔒" },
    { key: "addresses", label: "Addresses", icon: "📍" },
  ];

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-app max-w-3xl">
        <div className="mb-8">
          <p className="section-label">Account</p>
          <h1 className="text-3xl font-display font-bold text-ink-900 mt-1">Settings</h1>
          <p className="text-ink-500 text-sm mt-1">Manage your profile, password and saved addresses</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-ink-200 rounded-2xl p-1.5 w-fit">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? "bg-ink-900 text-white shadow-sm" : "text-ink-500 hover:text-ink-800"}`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === "profile" && (
          <div className="card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-2xl font-bold text-white select-none">
                {profile.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-ink-900">{profile.name || "Your Name"}</h2>
                <p className="text-sm text-ink-400">{user?.email || user?.phone}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 capitalize mt-1 inline-block">
                  {user?.role?.toLowerCase() || "buyer"}
                </span>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Full Name *</label>
                <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name" className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Phone</label>
                <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="10-digit mobile number" type="tel" className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Email</label>
                <input value={user?.email || ""} disabled className="input-base opacity-50 cursor-not-allowed" />
                <p className="text-xs text-ink-400 mt-1">Email cannot be changed</p>
              </div>
              <button type="submit" disabled={saving}
                className="btn-primary px-8 py-3 text-sm disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {tab === "password" && (
          <div className="card p-8">
            <h2 className="text-lg font-display font-bold text-ink-900 mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Current Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={passwords.currentPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Your current password" className="input-base pr-16" />
                  <button type="button" onClick={() => setShowPw((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-400 hover:text-ink-700">{showPw ? "Hide" : "Show"}</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">New Password</label>
                <input type={showPw ? "text" : "password"} value={passwords.newPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min 6 characters" className="input-base" />
                {pwStrength && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-ink-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`} style={{ width: pwStrength.w }} />
                    </div>
                    <p className="text-xs text-ink-400">{pwStrength.label}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Confirm New Password</label>
                <input type={showPw ? "text" : "password"} value={passwords.confirm}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat new password"
                  className={`input-base ${passwords.confirm && passwords.confirm !== passwords.newPassword ? "border-red-300 focus:border-red-400" : ""}`} />
                {passwords.confirm && passwords.confirm !== passwords.newPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>
              <button type="submit" disabled={saving || !passwords.currentPassword || passwords.newPassword !== passwords.confirm}
                className="btn-primary px-8 py-3 text-sm disabled:opacity-50">
                {saving ? "Saving..." : "Change Password"}
              </button>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {tab === "addresses" && (
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-ink-900">Saved Addresses</h2>
              <button
                onClick={() => { setShowAddressForm(true); setNewAddr(emptyAddr); }}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Address
              </button>
            </div>

            {/* Add Address Modal */}
            {showAddressForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddressForm(false)} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-display font-bold text-ink-900">Add New Address</h3>
                    <button onClick={() => setShowAddressForm(false)} className="p-1.5 rounded-lg hover:bg-ink-50">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>

                  <form onSubmit={handleAddAddress} className="space-y-4">
                    {/* Google Maps search */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">🗺️ Search Address</label>
                      <AddressPicker
                        placeholder="Search area, landmark, city…"
                        onSelect={(addr) => setNewAddr((a) => ({
                          ...a,
                          buildingNameOrNumber: addr.street || a.buildingNameOrNumber,
                          area:    addr.area    || a.area,
                          city:    addr.city    || a.city,
                          state:   addr.state   || a.state,
                          pincode: addr.pincode || a.pincode,
                          country: addr.country || a.country,
                        }))}
                      />
                    </div>

                    {/* Address Type */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Address Type</label>
                      <div className="flex gap-2 flex-wrap">
                        {ADDRESS_TYPES.map((t) => (
                          <button key={t} type="button"
                            onClick={() => setNewAddr((a) => ({ ...a, addressType: t }))}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${newAddr.addressType === t ? "bg-ink-900 text-white border-ink-900" : "border-ink-200 text-ink-600 hover:border-ink-400"}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Building / House No. *</label>
                      <input value={newAddr.buildingNameOrNumber}
                        onChange={(e) => setNewAddr((a) => ({ ...a, buildingNameOrNumber: e.target.value }))}
                        placeholder="e.g. Flat 204, Sunrise Apartments" className="input-base" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Area / Locality *</label>
                        <input value={newAddr.area}
                          onChange={(e) => setNewAddr((a) => ({ ...a, area: e.target.value }))}
                          placeholder="e.g. Alkapuri" className="input-base" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Landmark</label>
                        <input value={newAddr.landmark}
                          onChange={(e) => setNewAddr((a) => ({ ...a, landmark: e.target.value }))}
                          placeholder="e.g. Near City Mall" className="input-base" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">City *</label>
                        <input value={newAddr.city}
                          onChange={(e) => setNewAddr((a) => ({ ...a, city: e.target.value }))}
                          placeholder="e.g. Vadodara" className="input-base" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Pincode *</label>
                        <input value={newAddr.pincode} type="tel" maxLength={6}
                          onChange={(e) => setNewAddr((a) => ({ ...a, pincode: e.target.value.replace(/\D/g, "") }))}
                          placeholder="e.g. 390019" className="input-base" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">State *</label>
                        <input value={newAddr.state}
                          onChange={(e) => setNewAddr((a) => ({ ...a, state: e.target.value }))}
                          placeholder="e.g. Gujarat" className="input-base" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-500 mb-2">Country</label>
                        <input value={newAddr.country}
                          onChange={(e) => setNewAddr((a) => ({ ...a, country: e.target.value }))}
                          placeholder="India" className="input-base" />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setShowAddressForm(false)}
                        className="flex-1 py-3 rounded-xl border-2 border-ink-200 text-sm font-semibold text-ink-600 hover:bg-ink-50 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={savingAddr}
                        className="flex-1 btn-primary py-3 text-sm disabled:opacity-50">
                        {savingAddr ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {addresses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📍</div>
                <p className="text-ink-500 text-sm">No saved addresses yet.</p>
                <p className="text-ink-400 text-xs mt-1">Add an address to speed up checkout.</p>
                <button onClick={() => setShowAddressForm(true)} className="btn-primary text-sm px-6 py-2.5 mt-4">
                  + Add Your First Address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div key={addr._id} className="flex items-start justify-between p-4 rounded-xl border border-ink-200 bg-sand-50 hover:bg-white transition-colors">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wide text-ink-500 bg-ink-100 px-2 py-0.5 rounded-full">{addr.addressType}</span>
                      <p className="text-sm font-medium text-ink-800 mt-2">
                        {addr.buildingNameOrNumber}{addr.landmark ? `, ${addr.landmark}` : ""}
                      </p>
                      <p className="text-xs text-ink-500 mt-0.5">{addr.area}, {addr.city}, {addr.state} — {addr.pincode}</p>
                    </div>
                    <button onClick={() => handleDeleteAddress(addr._id)}
                      className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors ml-4 flex-shrink-0 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
