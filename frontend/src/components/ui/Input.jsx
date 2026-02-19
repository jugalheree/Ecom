export default function Input({
  label,
  type = "text",
  className = "",
  disabled,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className={`text-sm font-medium ${disabled ? 'text-stone-400' : 'text-stone-700'}`}>{label}</label>
      )}
      <input
        type={type}
        disabled={disabled}
        className={`px-4 py-2.5 border border-stone-300 rounded-xl outline-none transition-all focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 placeholder:text-stone-400 ${
          disabled ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-white'
        } ${className}`}
        {...props}
      />
    </div>
  );
}
