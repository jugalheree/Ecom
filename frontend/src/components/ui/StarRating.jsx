export default function StarRating({ value, onChange }) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => onChange(star)}
            className={`cursor-pointer text-2xl transition ${
              star <= value ? "text-yellow-400" : "text-slate-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  }
  