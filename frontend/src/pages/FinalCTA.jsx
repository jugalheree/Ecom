import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    <section className="w-full py-24 md:py-32 bg-stone-900 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M50 0v100M0 50h100' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="container-app relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6">
            Build, sell, and trade on a smarter platform
          </h2>

          <p className="text-xl md:text-2xl text-stone-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Join TradeSphere and experience a new way to manage commerce, trust,
            and growth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/market">
              <Button className="border-2 border-white/80 text-white hover:bg-white/10 text-lg px-10 py-5">
                Explore marketplace
              </Button>
            </Link>

            <Link to="/register">
              <Button
                variant="outline"
                className="border-2 border-white/80 text-white hover:bg-white/10 text-lg px-10 py-5"
              >
                Start selling
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
