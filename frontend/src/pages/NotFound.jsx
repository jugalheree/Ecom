import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-display font-bold text-ink-200 mb-4">404</div>
        <h1 className="text-2xl font-display font-bold text-ink-900 mb-2">Page not found</h1>
        <p className="text-ink-500 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/"><button className="btn-primary px-6 py-2.5 text-sm">Go Home</button></Link>
          <Link to="/market"><button className="btn-outline px-6 py-2.5 text-sm">Browse Market</button></Link>
        </div>
      </div>
    </div>
  );
}
