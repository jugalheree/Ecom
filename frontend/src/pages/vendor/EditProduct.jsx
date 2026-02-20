import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    aiScore: "",
    stock: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/products/${id}`)
      .then((res) => {
        const product = res.data.data;
        setForm({
          name: product.name,
          description: product.description,
          price: product.price,
          aiScore: product.ai,
          stock: product.stock ?? 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/api/products/${id}`, {
        ...form,
        price: Number(form.price),
        aiScore: Number(form.aiScore),
        stock: Number(form.stock),
      });

      navigate("/vendor/products");
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="number"
          name="aiScore"
          min="0"
          max="100"
          value={form.aiScore}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <button type="submit" className="bg-black text-white px-6 py-3 rounded">
          Update Product
        </button>
      </form>
    </div>
  );
}
