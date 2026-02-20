import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import HowItWorks from "./HowItWorks";
import BuyerVendorSection from "./BuyerVendorSection";
import PlatformStats from "./PlatformStats";
import TrustArchitecture from "./TrustArchitecture";
import FinalCTA from "./FinalCTA";
import heroImage from "../images/heroSection.png";

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* HERO SECTION - Modern Minimal Design */}
      <section className="relative min-h-screen flex items-center bg-white pt-12">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M50 0v100M0 50h100' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <div className="container-app relative z-10 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex animate-fade-in">
              <Badge type="info">New: AI-Powered Marketplace</Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-stone-900 leading-[1.1] tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              The future of
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 bg-clip-text text-transparent">
                commerce
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-stone-600 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              A next-generation B2B & B2C platform with AI verification, secure escrow, and intelligent trading.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button className="text-lg px-10 py-5">
                Get Started
              </Button>
              <Button variant="outline" className="text-lg px-10 py-5">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-stone-200 mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-stone-900 mb-2">1,200+</div>
                <div className="text-sm text-stone-600 uppercase tracking-wide">Active vendors</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-stone-900 mb-2">45,000+</div>
                <div className="text-sm text-stone-600 uppercase tracking-wide">Products listed</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-stone-900 mb-2">18K+</div>
                <div className="text-sm text-stone-600 uppercase tracking-wide">Monthly trades</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-stone-900 mb-2">99.9%</div>
                <div className="text-sm text-stone-600 uppercase tracking-wide">Secure transactions</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 md:mt-24 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="relative">

              {/* glow background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100/40 to-accent-100/40 rounded-3xl blur-3xl rotate-3" />

              {/* hero card */}
              <div className="relative bg-white rounded-3xl border border-stone-200/50 shadow-xl overflow-hidden
                    px-8 py-6 md:px-10 md:py-8
                    flex items-center justify-center">

                <img
                  src={heroImage}
                  alt="Platform Preview"
                  className="max-h-[420px] w-auto object-contain"
                />

              </div>
            </div>
          </div>


        </div>
      </section>

      {/* TRUST BANNER - Minimal Design */}
      <section className="bg-stone-900 text-white py-8 border-y border-stone-800 overflow-hidden">

  <div className="ticker">
    <div className="ticker-track">

      <div className="ticker-group">
        {["Secure Escrow", "AI Verified", "B2B & B2C", "Vendor Trading"].map((item, i) => (
          <div key={i} className="ticker-item">
            <span className="dot" />
            {item}
          </div>
        ))}
      </div>

      {/* duplicate */}
      <div className="ticker-group gap-20">
        {["Secure Escrow", "AI Verified", "B2B & B2C", "Vendor Trading", "Secure Escrow", "AI Verified", "B2B & B2C", "Vendor Trading"].map((item, i) => (
          <div key={i} className="ticker-item">
            <span className="dot" />
            {item}
          </div>
        ))}
      </div>

    </div>
  </div>

</section>



      {/* FEATURES SECTION - Clean Grid */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-6">
              Everything you need
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Built for modern businesses that demand excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "✨",
                title: "AI Trust Score",
                description: "Products are evaluated using intelligent parameters to ensure quality and reliability.",
                gradient: "from-primary-500 to-primary-600"
              },
              {
                icon: "🔒",
                title: "Secure Wallet",
                description: "Escrow-based wallet system protects both buyers and vendors throughout the transaction.",
                gradient: "from-emerald-500 to-emerald-600"
              },
              {
                icon: "🤝",
                title: "Vendor Ecosystem",
                description: "Vendors can trade stock, manage alerts, and expand supply chains seamlessly.",
                gradient: "from-accent-500 to-accent-600"
              },
            ].map((feature, index) => (
              <Card key={index} className="group p-8 border-2 border-stone-200 hover:border-primary-300 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-stone-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES - Modern Cards */}
      <section className="py-24 md:py-32 bg-stone-50">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-stone-900 mb-6">
              Explore categories
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Find exactly what you're looking for
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Electronics", icon: "⚡", color: "bg-blue-500" },
              { name: "Fashion", icon: "👗", color: "bg-pink-500" },
              { name: "Groceries", icon: "🛒", color: "bg-green-500" },
              { name: "Industrial", icon: "🏭", color: "bg-orange-500" },
            ].map((category, index) => (
              <Card
                key={index}
                className="group aspect-square flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 border-2 border-stone-200 hover:border-stone-300"
              >
                <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <span className="text-lg font-semibold text-stone-900">{category.name}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Stats - Built for buyers and vendors */}
      <PlatformStats />

      {/* How It Works */}
      <HowItWorks />

      {/* Buyer & Vendor Sections - Built on trust */}
      <BuyerVendorSection />

      {/* Trust Architecture */}
      <TrustArchitecture />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  );
}
