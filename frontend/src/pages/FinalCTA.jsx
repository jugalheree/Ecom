import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    <section className="w-full py-28 bg-gradient-to-br from-green-600 to-green-800 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">

        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
          Build, sell, and trade on a smarter platform
        </h2>

        <p className="mt-4 text-lg opacity-90">
          Join TradeSphere and experience a new way to manage commerce, trust, and growth.
        </p>

        <div className="flex justify-center gap-4 mt-10 flex-wrap">
          <Link to="/market">
            <Button className="text-black-700 hover:bg-slate-100">
              Explore marketplace
            </Button>
          </Link>

          <Link to="/register">
            <Button variant="outline" className="border-white text- hover:bg-white/10">
              Start selling
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
