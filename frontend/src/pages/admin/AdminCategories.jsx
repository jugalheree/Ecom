import { useEffect, useState } from "react";
import { categoryAPI } from "../../services/apis/index";
import Card from "../../components/ui/Card";
import { useToastStore } from "../../store/toastStore";
import Input from "../../components/ui/Input";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [showAttrForm, setShowAttrForm] = useState(null); // categoryId
  const [catForm, setCatForm] = useState({ name: "", parentCategory: "", isLeaf: false });
  const [attrForm, setAttrForm] = useState({
    code: "",
    label: "",
    dataType: "string",
    options: "",
    unit: "",
    required: false,
    isFilterable: false,
    isComparable: false,
    aiWeight: 0,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const fetchCategories = () => {
    setLoading(true);
    categoryAPI
      .getAll()
      .then((res) => setCategories(res.data?.data || []))
      .catch((err) =>
        showToast({ message: err.message || "Failed to load categories", type: "error" })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name) {
      showToast({ message: "Category name is required", type: "error" });
      return;
    }
    setActionLoading(true);
    try {
      await categoryAPI.create({
        name: catForm.name,
        parentCategory: catForm.parentCategory || undefined,
        isLeaf: catForm.isLeaf,
      });
      showToast({ message: "Category created!", type: "success" });
      setCatForm({ name: "", parentCategory: "", isLeaf: false });
      setShowNewCatForm(false);
      fetchCategories();
    } catch (err) {
      showToast({ message: err.message || "Failed to create category", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAttribute = async (e) => {
    e.preventDefault();
    if (!attrForm.code || !attrForm.label || !attrForm.dataType) {
      showToast({ message: "Code, label and data type are required", type: "error" });
      return;
    }

    const options =
      attrForm.dataType === "enum"
        ? attrForm.options
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
        : [];

    if (attrForm.dataType === "enum" && options.length === 0) {
      showToast({ message: "Options required for enum type", type: "error" });
      return;
    }

    setActionLoading(true);
    try {
      await categoryAPI.createAttribute(showAttrForm, {
        ...attrForm,
        options,
        aiWeight: Number(attrForm.aiWeight),
      });
      showToast({ message: "Attribute added!", type: "success" });
      setAttrForm({
        code: "",
        label: "",
        dataType: "string",
        options: "",
        unit: "",
        required: false,
        isFilterable: false,
        isComparable: false,
        aiWeight: 0,
      });
      setShowAttrForm(null);
    } catch (err) {
      showToast({ message: err.message || "Failed to add attribute", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const leafCategories = categories.filter((c) => c.isLeaf);
  const parentCategories = categories.filter((c) => !c.isLeaf);

  const levelBadgeColor = (level) => {
    if (level === 0) return "bg-ink-100 text-ink-700";
    if (level === 1) return "bg-blue-100 text-blue-700";
    return "bg-purple-100 text-purple-700";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-app py-12">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-5xl font-display font-bold text-ink-900 mb-4">
              Category Management
            </h1>
            <p className="text-xl text-ink-600">
              Manage product categories and their attributes.
            </p>
          </div>
          <button
            onClick={() => setShowNewCatForm(!showNewCatForm)}
            className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-ink-900 transition"
          >
            + New Category
          </button>
        </div>

        {/* Create category form */}
        {showNewCatForm && (
          <Card className="p-8 border-2 border-primary-200 mb-8 bg-primary-50/30">
            <h3 className="text-lg font-semibold text-ink-900 mb-6">Create Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Category Name *"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Electronics, Laptops"
                />
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    Parent Category (optional)
                  </label>
                  <select
                    value={catForm.parentCategory}
                    onChange={(e) =>
                      setCatForm({ ...catForm, parentCategory: e.target.value })
                    }
                    className="w-full rounded-xl border border-ink-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">None (top-level)</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={catForm.isLeaf}
                  onChange={(e) => setCatForm({ ...catForm, isLeaf: e.target.checked })}
                  className="w-4 h-4 accent-black"
                />
                <div>
                  <span className="text-sm font-medium text-ink-700">Leaf category</span>
                  <p className="text-xs text-ink-400">
                    Leaf categories can have products listed in them
                  </p>
                </div>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewCatForm(false)}
                  className="flex-1 border-2 border-ink-200 py-2.5 rounded-xl font-medium text-ink-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-black text-white py-2.5 rounded-xl font-medium disabled:opacity-50"
                >
                  {actionLoading ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Categories list */}
        <Card className="p-8 border-2 border-ink-200">
          {loading ? (
            <p className="text-ink-500 animate-pulse">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-ink-500 text-center py-8">
              No categories yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat._id}>
                  <div className="flex items-center justify-between p-4 border border-ink-200 rounded-xl hover:bg-ink-50 transition">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelBadgeColor(cat.level)}`}
                      >
                        L{cat.level}
                      </span>
                      <span className="font-medium text-ink-900">{cat.name}</span>
                      {cat.isLeaf && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          Leaf
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {cat.isLeaf && (
                        <button
                          onClick={() =>
                            setShowAttrForm(showAttrForm === cat._id ? null : cat._id)
                          }
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition"
                        >
                          + Add Attribute
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Attribute form for this category */}
                  {showAttrForm === cat._id && (
                    <div className="ml-8 mt-2 p-6 bg-ink-50 border border-ink-200 rounded-xl">
                      <h4 className="text-sm font-semibold text-ink-800 mb-4">
                        Add Attribute to "{cat.name}"
                      </h4>
                      <form onSubmit={handleCreateAttribute} className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <Input
                            label="Code *"
                            placeholder="e.g. color, ram_gb"
                            value={attrForm.code}
                            onChange={(e) =>
                              setAttrForm({ ...attrForm, code: e.target.value.toLowerCase().replace(/\s/g, "_") })
                            }
                          />
                          <Input
                            label="Label *"
                            placeholder="e.g. Color, RAM (GB)"
                            value={attrForm.label}
                            onChange={(e) =>
                              setAttrForm({ ...attrForm, label: e.target.value })
                            }
                          />
                          <div>
                            <label className="block text-sm font-medium text-ink-700 mb-1">
                              Data Type *
                            </label>
                            <select
                              value={attrForm.dataType}
                              onChange={(e) =>
                                setAttrForm({ ...attrForm, dataType: e.target.value })
                              }
                              className="w-full rounded-xl border border-ink-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            >
                              <option value="string">String</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="enum">Enum (select)</option>
                            </select>
                          </div>
                        </div>

                        {attrForm.dataType === "enum" && (
                          <Input
                            label="Options (comma-separated) *"
                            placeholder="Red, Blue, Green"
                            value={attrForm.options}
                            onChange={(e) =>
                              setAttrForm({ ...attrForm, options: e.target.value })
                            }
                          />
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            label="Unit (optional)"
                            placeholder="e.g. GB, kg, cm"
                            value={attrForm.unit}
                            onChange={(e) =>
                              setAttrForm({ ...attrForm, unit: e.target.value })
                            }
                          />
                          <Input
                            label="AI Weight (0-1)"
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={attrForm.aiWeight}
                            onChange={(e) =>
                              setAttrForm({ ...attrForm, aiWeight: e.target.value })
                            }
                          />
                        </div>

                        <div className="flex gap-6">
                          {[
                            { key: "required", label: "Required" },
                            { key: "isFilterable", label: "Filterable" },
                            { key: "isComparable", label: "Comparable" },
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={attrForm[key]}
                                onChange={(e) =>
                                  setAttrForm({ ...attrForm, [key]: e.target.checked })
                                }
                                className="w-4 h-4 accent-black"
                              />
                              <span className="text-sm font-medium text-ink-700">{label}</span>
                            </label>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setShowAttrForm(null)}
                            className="flex-1 border-2 border-ink-200 py-2 rounded-xl font-medium text-ink-700 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="flex-1 bg-black text-white py-2 rounded-xl font-medium text-sm disabled:opacity-50"
                          >
                            {actionLoading ? "Saving..." : "Add Attribute"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
