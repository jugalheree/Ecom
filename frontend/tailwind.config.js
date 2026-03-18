/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#fff8ed",100:"#ffefd0",200:"#ffdba0",300:"#ffc166",400:"#ff9d2e",500:"#ff7d07",600:"#f05f00",700:"#c74400",800:"#9e3600",900:"#7f2e05",950:"#451400" },
        navy:  { 50:"#f0f4ff",100:"#dde6ff",200:"#c2d1ff",300:"#9db2ff",400:"#7588fd",500:"#5563f7",600:"#3d3fec",700:"#3130d1",800:"#2929a9",900:"#272885",950:"#191852" },
        sand:  { 50:"#fdfaf5",100:"#f9f3e8",200:"#f2e5ce",300:"#e8d0ab",400:"#d9b47d",500:"#ca9a59",600:"#b8834a",700:"#99693d",800:"#7d5435",900:"#674532",950:"#362219" },
        ink:   { 50:"#f7f7f8",100:"#eeeef0",200:"#d9d9de",300:"#b8b8c0",400:"#8e8e9a",500:"#70707e",600:"#5a5a67",700:"#4a4a55",800:"#3e3e48",900:"#131318",950:"#0a0a0e" },
        success:{ 500:"#22c55e",600:"#16a34a" },
        danger: { 500:"#ef4444",600:"#dc2626" },
        warning:{ 500:"#f59e0b",600:"#d97706" },
      },
      fontFamily: {
        sans:    ["'Plus Jakarta Sans'","system-ui","sans-serif"],
        display: ["'Fraunces'","Georgia","serif"],
        mono:    ["'DM Mono'","monospace"],
      },
      boxShadow: {
        soft:"0 2px 8px rgba(0,0,0,0.05)",
        card:"0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)",
        "card-hover":"0 12px 40px rgba(0,0,0,0.10)",
        brand:"0 4px 24px rgba(255,125,7,0.30)",
        "brand-lg":"0 8px 40px rgba(255,125,7,0.22)",
      },
      borderRadius: { "4xl":"2rem" },
      animation: {
        "fade-in":"fadeIn 0.5s ease-out forwards",
        "fade-up":"fadeUp 0.55s ease-out forwards",
        "slide-in":"slideIn 0.45s ease-out forwards",
        "scale-in":"scaleIn 0.35s ease-out forwards",
        ticker:"ticker 32s linear infinite",
        shimmer:"shimmer 1.6s linear infinite",
        float:"float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  {"0%":{opacity:"0"},"100%":{opacity:"1"}},
        fadeUp:  {"0%":{opacity:"0",transform:"translateY(20px)"},"100%":{opacity:"1",transform:"translateY(0)"}},
        slideIn: {"0%":{opacity:"0",transform:"translateX(-16px)"},"100%":{opacity:"1",transform:"translateX(0)"}},
        scaleIn: {"0%":{opacity:"0",transform:"scale(0.96)"},"100%":{opacity:"1",transform:"scale(1)"}},
        ticker:  {"0%":{transform:"translateX(0)"},"100%":{transform:"translateX(-50%)"}},
        float:   {"0%,100%":{transform:"translateY(0)"},"50%":{transform:"translateY(-10px)"}},
        shimmer: {"0%":{backgroundPosition:"-400px 0"},"100%":{backgroundPosition:"400px 0"}},
      },
    },
  },
  plugins: [],
};
