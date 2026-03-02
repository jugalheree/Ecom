export default function Button({ children, variant = "primary", className = "", disabled, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-display font-semibold text-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] rounded-xl";

  const variants = {
    primary: "bg-ink-900 text-white hover:bg-ink-800 shadow-sm hover:shadow-md px-6 py-2.5 focus-visible:outline-ink-900",
    secondary: "bg-ink-100 text-ink-900 hover:bg-ink-200 px-6 py-2.5 focus-visible:outline-ink-400",
    outline: "border-2 border-ink-200 bg-transparent text-ink-900 hover:bg-ink-50 hover:border-ink-400 px-6 py-2.5",
    ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900 px-4 py-2",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm px-6 py-2.5",
    accent: "bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-sm hover:shadow-glow px-6 py-2.5",
  };

  return (
    <button disabled={disabled} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
