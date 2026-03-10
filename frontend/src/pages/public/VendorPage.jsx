import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import BackendMissing from "../../components/ui/BackendMissing";

export default function VendorPage() {
  const { vendorId } = useParams();
  const [products, setProducts] = useState([]);
  const [backendMissing, setBackendMissing] = useState(false);

  useEffect(() => {
    // NOTE: GET /api/products does not exist in the backend yet.
    api
      .get(`/api/products?vendorId=${vendorId}`)
      .then((res) => {
        setProducts(res.data.data?.products || []);
      })
      .catch(() => setBackendMissing(true));
  }, [vendorId]);

  if (backendMissing) return (
    <div className="min-h-screen bg-white mt-20">
      <div className="container-app py-16">
        <BackendMissing
          method="GET"
          endpoint="/api/products?vendorId=..."
          todo="Implement GET /api/products with optional vendorId query param to return approved products"
        />
      </div>
    </div>
  );

  if (!products.length) return <div className="p-20">Loading...</div>;

  const vendorName = products[0]?.vendorId?.shopName || "Vendor Store";

  return (
    <div className="min-h-screen bg-white mt-20">
      <div className="container-app py-16">

        <h1 className="text-4xl font-bold mb-4">
          {vendorName}
        </h1>

        <p className="text-stone-500 mb-10">
          Seller on platform
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="p-6">
              <img
                src={product.images?.[0]?.url}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold">{product.name}</h3>
              <p>₹{product.price}</p>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}