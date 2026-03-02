import { useState, useEffect } from "react";
import { vendorAPI, categoryAPI } from "../../services/apis/index";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";

export default function AddProduct() {
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);

  const [categories, setCategories] = useState([]);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    saleType: "B2C",
    minDeliveryDays: "1",
    maxDeliveryDays: "5",
  });
  const [attributes, setAttributes] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: details, 2: attributes, 3: images
  const [createdProductId, setCreatedProductId] = useState(null);

  // Fetch leaf categories on mount
  useEffect(() => {
    categoryAPI
      .getAll()
      .then((res) => {
        const all = res.data?.data || [];
        setCategories(all.filter((c) => c.isLeaf));
      })
      .catch(() => {});
  }, []);

  // Fetch attributes when category changes
  useEffect(() => {
    if (!form.categoryId) {
      setCategoryAttributes([]);
      setAttributes({});
      return;
    }
    categoryAPI
      .getAttributes(form.categoryId)
      .then((res) => {
        const attrs = res.data?.data || [];
        setCategoryAttributes(attrs);
        const defaults = {};
        attrs.forEach((a) => (defaults[a.code] = ""));
        setAttributes(defaults);
      })
      .catch(() => setCategoryAttributes([]));
  }, [form.categoryId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: Create product
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!form.title || !form.price || !form.stock || !form.categoryId) {
      showToast({ message: "Please fill all required fields", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await vendorAPI.createProduct({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId,
        saleType: form.saleType,
        minDeliveryDays: Number(form.minDeliveryDays),
        maxDeliveryDays: Number(form.maxDeliveryDays),
      });

      const productId = res.data?.data?._id;
      setCreatedProductId(productId);
      showToast({ message: "Product created! Now add attributes.", type: "success" });
      
      if (categoryAttributes.length > 0) {
        setStep(2);
      } else {
        setStep(3);
      }
    } catch (err) {
      showToast({ message: err.message || "Failed to create product", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Add attributes
  const handleAddAttributes = async () => {
    const attrsArray = Object.entries(attributes)
      .filter(([, v]) => v !== "")
      .map(([code, value]) => ({ code, value }));

    if (attrsArray.length === 0) {
      setStep(3);
      return;
    }

    setLoading(true);
    try {
      await vendorAPI.addProductAttributes(createdProductId, { attributes: attrsArray });
      showToast({ message: "Attributes saved! Now upload images.", type: "success" });
      setStep(3);
    } catch (err) {
      showToast({ message: err.message || "Failed to save attributes", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Upload images
  const handleUploadImages = async () => {
    if (images.length === 0) {
      showToast({ message: "Product created successfully!", type: "success" });
      navigate("/vendor/products");
      return;
    }

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    setLoading(true);
    try {
      await vendorAPI.uploadProductImages(createdProductId, formData);
      showToast({ message: "Product listed successfully!", type: "success" });
      navigate("/vendor/products");
    } catch (err) {
      showToast({ message: err.message || "Image upload failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-8">
      {["Product Details", "Attributes", "Images"].map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === i + 1
                ? "bg-black text-white"
                : step > i + 1
                ? "bg-emerald-500 text-white"
                : "bg-ink-200 text-ink-500"
            }`}
          >
            {step > i + 1 ? "✓" : i + 1}
          </div>
          <span
            className={`text-sm font-medium ${
              step === i + 1 ? "text-ink-900" : "text-ink-400"
            }`}
          >
            {label}
          </span>
          {i < 2 && <div className="w-8 h-px bg-ink-300 mx-1" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/vendor/products")}
          className="text-sm text-ink-600 hover:text-black mb-6 transition"
        >
          ← Back to Products
        </button>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-ink-900 mb-2">Add New Product</h1>
          <p className="text-ink-500">List your product on TradeSphere marketplace.</p>
        </div>

        <StepIndicator />

        <div className="bg-white rounded-2xl shadow-sm border border-ink-200 p-10">
          {/* STEP 1: Product Details */}
          {step === 1 && (
            <form onSubmit={handleCreateProduct} className="space-y-8">
              <h2 className="text-xl font-semibold text-ink-900 mb-6">Product Details</h2>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter product title"
                  className="w-full rounded-xl border border-ink-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-ink-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Sale Type *
                </label>
                <div className="flex gap-4">
                  {["B2C", "B2B", "BOTH"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="saleType"
                        value={type}
                        checked={form.saleType === type}
                        onChange={handleChange}
                        className="accent-black"
                      />
                      <span className="text-sm font-medium text-ink-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your product..."
                  className="w-full rounded-xl border border-ink-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    className="w-full rounded-xl border border-ink-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="Available quantity"
                    min="0"
                    className="w-full rounded-xl border border-ink-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Min Delivery Days *
                  </label>
                  <input
                    type="number"
                    name="minDeliveryDays"
                    value={form.minDeliveryDays}
                    onChange={handleChange}
                    min="1"
                    className="w-full rounded-xl border border-ink-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Max Delivery Days *
                  </label>
                  <input
                    type="number"
                    name="maxDeliveryDays"
                    value={form.maxDeliveryDays}
                    onChange={handleChange}
                    min="1"
                    className="w-full rounded-xl border border-ink-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-ink-900 transition disabled:opacity-50"
              >
                {loading ? "Creating product..." : "Next: Add attributes →"}
              </button>
            </form>
          )}

          {/* STEP 2: Attributes */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-ink-900">
                Product Attributes
              </h2>
              <p className="text-ink-500 text-sm">
                Fill in required attributes for this category.
              </p>

              {categoryAttributes.map((attr) => (
                <div key={attr.code}>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    {attr.label}{" "}
                    {attr.required && <span className="text-red-500">*</span>}
                    {attr.unit && (
                      <span className="text-ink-400 ml-1">({attr.unit})</span>
                    )}
                  </label>

                  {attr.dataType === "enum" ? (
                    <select
                      value={attributes[attr.code] || ""}
                      onChange={(e) =>
                        setAttributes({ ...attributes, [attr.code]: e.target.value })
                      }
                      className="w-full rounded-xl border border-ink-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                    >
                      <option value="">Select {attr.label}</option>
                      {attr.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : attr.dataType === "boolean" ? (
                    <select
                      value={attributes[attr.code] || ""}
                      onChange={(e) =>
                        setAttributes({ ...attributes, [attr.code]: e.target.value })
                      }
                      className="w-full rounded-xl border border-ink-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type={attr.dataType === "number" ? "number" : "text"}
                      value={attributes[attr.code] || ""}
                      onChange={(e) =>
                        setAttributes({ ...attributes, [attr.code]: e.target.value })
                      }
                      placeholder={`Enter ${attr.label}`}
                      className="w-full rounded-xl border border-ink-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 border-2 border-ink-300 text-ink-700 py-3 rounded-xl font-medium hover:bg-ink-50 transition"
                >
                  Skip
                </button>
                <button
                  onClick={handleAddAttributes}
                  disabled={loading}
                  className="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:bg-ink-900 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Next: Upload images →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Images */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-ink-900">Product Images</h2>
              <p className="text-ink-500 text-sm">
                Upload up to 5 images. The first image will be the primary image.
              </p>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Product Images
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files).slice(0, 5);
                    setImages(files);
                  }}
                  className="block w-full text-sm text-ink-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-ink-800"
                />
              </div>

              {images.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-xl border-2 border-ink-200"
                      />
                      {i === 0 && (
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    showToast({ message: "Product created (no images)", type: "success" });
                    navigate("/vendor/products");
                  }}
                  className="flex-1 border-2 border-ink-300 text-ink-700 py-3 rounded-xl font-medium hover:bg-ink-50 transition"
                >
                  Skip & finish
                </button>
                <button
                  onClick={handleUploadImages}
                  disabled={loading}
                  className="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:bg-ink-900 transition disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Finish & list product"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
