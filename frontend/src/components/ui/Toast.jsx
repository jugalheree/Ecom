import { useEffect } from "react";
import { useToastStore } from "../../store/toastStore";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  // Auto-dismiss — each toast gets its own timer
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => setTimeout(() => removeToast(t.id), 2500));
    return () => timers.forEach(clearTimeout);
  }, [toasts.map((t) => t.id).join(",")]);

  if (!toasts.length) return null;

  // Show only the latest toast (no spam stacking)
  const latest = toasts[toasts.length - 1];

  const cfg = {
    success: { bar: "bg-emerald-500", icon: "✓", text: "text-emerald-700", border: "border-emerald-200" },
    error:   { bar: "bg-red-500",     icon: "✕", text: "text-red-700",     border: "border-red-200" },
    info:    { bar: "bg-brand-500",   icon: "i", text: "text-brand-700",   border: "border-brand-200" },
  }[latest.type] || { bar: "bg-ink-500", icon: "i", text: "text-ink-700", border: "border-ink-200" };

  return (
    <div className="fixed bottom-5 right-5 z-[999] pointer-events-none">
      <div
        key={latest.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-white shadow-lg text-sm font-medium pointer-events-auto animate-fade-up ${cfg.border}`}
        style={{ minWidth: 220, maxWidth: 340 }}
      >
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${cfg.bar}`}>
          {cfg.icon}
        </span>
        <span className={`flex-1 ${cfg.text}`}>{latest.message}</span>
        <button onClick={() => removeToast(latest.id)} className="text-ink-300 hover:text-ink-500 text-xs flex-shrink-0">✕</button>
      </div>
    </div>
  );
}
