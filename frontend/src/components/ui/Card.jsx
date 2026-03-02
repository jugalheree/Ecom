export default function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-ink-200 transition-all duration-300 ${onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
