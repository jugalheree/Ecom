export default function Card({ children, className = "" }) {
    return (
      <div
        className={`bg-white rounded-xl border shadow-sm p-4 ${className}`}
      >
        {children}
      </div>
    );
  }
  