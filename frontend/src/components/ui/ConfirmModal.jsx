import { useState, useEffect, useRef } from "react";

/**
 * ReasonModal — replaces browser prompt() with a proper modal.
 * Props:
 *   open        boolean
 *   title       string
 *   subtitle    string (optional)
 *   placeholder string (optional)
 *   required    boolean (default true) — disables OK if empty
 *   onConfirm   (reason: string) => void
 *   onCancel    () => void
 */
export function ReasonModal({ open, title, subtitle, placeholder = "Enter reason...", required = true, onConfirm, onCancel }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    if (required && !value.trim()) return;
    onConfirm(value.trim());
    setValue("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && (!required || value.trim())) handleConfirm();
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <h2 className="text-lg font-display font-bold text-ink-900 mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-ink-500 mb-4">{subtitle}</p>}

        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-xl border-2 border-ink-200 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-ink-900 resize-none transition-colors mt-2"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border-2 border-ink-200 text-sm font-semibold text-ink-600 hover:bg-ink-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={required && !value.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * SimpleConfirmModal — yes/no confirmation without text input.
 */
export function SimpleConfirmModal({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-display font-bold text-ink-900 mb-2">{title}</h2>
        {message && <p className="text-sm text-ink-500 mb-5">{message}</p>}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-ink-200 text-sm font-semibold text-ink-600 hover:bg-ink-50 transition-colors">{cancelLabel}</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${danger ? "bg-red-500 hover:bg-red-600" : "bg-brand-600 hover:bg-brand-700"}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
