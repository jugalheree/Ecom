import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    aiScore: "",
    stock: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("aiScore", form.aiScore);
    formData.append("stock", form.stock);
    formData.append("image", form.image);

    try {
      setLoading(true);
      await api.post("/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/vendor/products");
    } catch (err) {
      alert(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Top Navigation */}
        <button
          onClick={() => navigate("/vendor/products")}
          className="text-sm text-stone-600 hover:text-black mb-6 transition"
        >
          ← Back to Products
        </button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-stone-900 mb-2">
            Add New Product
          </h1>
          <p className="text-stone-500">
            Fill in the product details to list it in your store.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-10">
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-8"
          >
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Product Image
              </label>

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                className="block w-full text-sm text-stone-600
                  file:mr-4 file:py-2 file:px-4 file:rounded-lg
                  file:border-0 file:bg-black file:text-white
                  hover:file:bg-stone-800"
              />

              {/* Preview */}
              {form.image && (
                <img
                  src={URL.createObjectURL(form.image)}
                  alt="Preview"
                  className="mt-4 w-40 h-40 object-cover rounded-xl border"
                />
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                placeholder="Write product description..."
                className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition resize-none"
              />
            </div>

            {/* Price + Stock */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Available quantity"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                />
              </div>
            </div>

            {/* AI Score */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                AI Score (0 - 100)
              </label>
              <input
                type="number"
                name="aiScore"
                min="0"
                max="100"
                value={form.aiScore}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
              />
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-stone-900 transition duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                {loading ? "Creating Product..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
