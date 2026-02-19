export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );
}
