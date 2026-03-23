export default function TrustCard({ icon, title, desc, color = "bg-brand-50 border-brand-200" }) {
  return (
    <div className={`rounded-2xl border-2 ${color} p-6 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200`}>
      <span className="text-3xl block mb-4">{icon}</span>
      <h3 className="font-display font-bold text-ink-900 text-lg mb-2">{title}</h3>
      <p className="text-ink-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
