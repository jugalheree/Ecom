export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-stone-900 text-white hover:bg-stone-800 shadow-sm hover:shadow-md focus:ring-stone-500 active:scale-[0.98]",
    secondary:
      "bg-stone-100 text-stone-900 hover:bg-stone-200 shadow-sm focus:ring-stone-400 active:scale-[0.98]",
    outline:
      "border-2 border-stone-300 bg-transparent text-stone-900 hover:bg-stone-50 hover:border-stone-400 focus:ring-stone-400 active:scale-[0.98]",
    ghost: "text-stone-700 hover:bg-stone-100 focus:ring-stone-300 active:scale-[0.98]",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md focus:ring-red-500 active:scale-[0.98]",
    accent:
      "bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md focus:ring-primary-500 active:scale-[0.98]",
  };

  return (
    <button
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
