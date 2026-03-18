import { useState } from "react";

export default function StarRating({ value = 0, onChange, size = "md" }) {
  const [hover, setHover] = useState(0);
  const px = size === "lg" ? 24 : size === "sm" ? 14 : 18;
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((star) => (
        <button key={star} type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}>
          <svg width={px} height={px} viewBox="0 0 24 24"
            fill={star <= (hover || value) ? "#ff7d07" : "#d9d9de"} stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}
