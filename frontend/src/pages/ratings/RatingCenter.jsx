import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import StarRating from "../../components/ui/StarRating";
import RatingDistributionChart from "../../components/charts/RatingDistributionChart";

export default function RatingCenter() {
  const [ratings, setRatings] = useState([
    {
      id: 1,
      target: "Wireless Headphones",
      type: "Product",
      stars: 5,
      review: "Excellent quality and fast delivery.",
      date: "2026-01-20",
      direction: "given",
    },
    {
      id: 2,
      target: "Rahul Mehta",
      type: "Buyer",
      stars: 4,
      review: "Smooth transaction and quick response.",
      date: "2026-01-18",
      direction: "received",
    },
  ]);

  const [form, setForm] = useState({
    target: "",
    type: "Product",
    stars: 0,
    review: "",
  });

  const submitRating = () => {
    if (!form.target || !form.review || form.stars === 0) return;

    setRatings([
      {
        id: Date.now(),
        target: form.target,
        type: form.type,
        stars: form.stars,
        review: form.review,
        date: new Date().toISOString().slice(0, 10),
        direction: "given",
      },
      ...ratings,
    ]);

    setForm({ target: "", type: "Product", stars: 0, review: "" });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Ratings & Reviews
        </h1>
        <p className="text-slate-600 mt-1">
          Rate your experience and manage your marketplace reputation.
        </p>
      </div>

      {/* TOP GRID */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* RATING FORM */}
        <Card className="p-6 md:col-span-1">
          <h3 className="font-semibold text-lg mb-3">
            Submit a rating
          </h3>

          <Input
            label="Rate who / what"
            placeholder="Product or user name"
            value={form.target}
            onChange={(e) =>
              setForm({ ...form, target: e.target.value })
            }
          />

          <label className="text-sm font-medium block mt-3">
            Rating type
          </label>
          <select
            className="w-full border rounded-xl px-3 py-2 mt-1"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
          >
            <option>Product</option>
            <option>Vendor</option>
            <option>Buyer</option>
          </select>

          <div className="mt-4">
            <p className="text-sm font-medium mb-1">Stars</p>
            <StarRating
              value={form.stars}
              onChange={(val) =>
                setForm({ ...form, stars: val })
              }
            />
          </div>

          <textarea
            className="w-full border rounded-xl p-3 mt-4 text-sm resize-none"
            rows="4"
            placeholder="Write your review..."
            value={form.review}
            onChange={(e) =>
              setForm({ ...form, review: e.target.value })
            }
          />

          <Button className="w-full mt-4" onClick={submitRating}>
            Submit rating
          </Button>
        </Card>

        {/* RATING DISTRIBUTION */}
        <Card className="p-6 md:col-span-2">
          <h3 className="font-semibold text-lg mb-2 text-stone-900">Rating distribution</h3>
          <p className="text-stone-500 text-sm">Your ratings by star count</p>
          <div className="mt-4 min-h-[220px]">
            {(() => {
              const distData = [
                { name: "5 stars", value: ratings.filter((r) => r.stars === 5).length },
                { name: "4 stars", value: ratings.filter((r) => r.stars === 4).length },
                { name: "3 stars", value: ratings.filter((r) => r.stars === 3).length },
                { name: "2 stars", value: ratings.filter((r) => r.stars === 2).length },
                { name: "1 star", value: ratings.filter((r) => r.stars === 1).length },
              ].filter((d) => d.value > 0);
              return distData.length > 0 ? (
                <RatingDistributionChart data={distData} />
              ) : (
                <div className="flex items-center justify-center h-[220px] text-stone-500 text-sm">
                  No ratings yet — submit one to see distribution
                </div>
              );
            })()}
          </div>
        </Card>

        {/* INFO */}
        <Card className="p-6 md:col-span-3">
          <h3 className="font-semibold text-lg mb-3 text-stone-900">
            How ratings work
          </h3>

          <ul className="text-sm text-stone-600 space-y-2 list-disc pl-5">
            <li>Ratings are only allowed after successful order completion.</li>
            <li>Buyers rate products and vendors.</li>
            <li>Vendors rate buyers.</li>
            <li>Ratings build trust and marketplace reputation.</li>
          </ul>

          <div className="mt-5 p-4 rounded-xl bg-green-50 text-sm text-green-700">
            ⭐ Honest reviews improve trust, visibility, and business growth.
          </div>
        </Card>
      </div>

      {/* RATINGS LIST */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* GIVEN */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">
            Ratings given
          </h3>

          {ratings.filter(r => r.direction === "given").map((r) => (
            <RatingCard key={r.id} data={r} />
          ))}
        </Card>

        {/* RECEIVED */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">
            Ratings received
          </h3>

          {ratings.filter(r => r.direction === "received").map((r) => (
            <RatingCard key={r.id} data={r} />
          ))}
        </Card>
      </div>
    </div>
  );
}

/* REVIEW CARD */
function RatingCard({ data }) {
  return (
    <div className="border-b last:border-b-0 pb-3 mb-3 last:mb-0">
      <p className="font-medium">
        {data.type}: {data.target}
      </p>

      <div className="flex items-center gap-2 mt-1">
        <span className="text-yellow-400">
          {"★".repeat(data.stars)}
        </span>
        <span className="text-slate-300">
          {"★".repeat(5 - data.stars)}
        </span>
      </div>

      <p className="text-sm text-slate-600 mt-1">
        {data.review}
      </p>

      <p className="text-xs text-slate-400 mt-1">
        {data.date}
      </p>
    </div>
  );
}
