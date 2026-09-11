import { useState } from "react";
import { Menu, Phone, ShoppingBag, Sparkles, X } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import Admin from "@/pages/Admin";
import Booking from "@/pages/Booking";
import Customise from "@/pages/Customise";
import Home from "@/pages/Home";

const routes = [
  { key: "home", label: "Home" },
  { key: "collection", label: "Collection" },
  { key: "customise", label: "Customise" },
  { key: "occasions", label: "Occasions & Festivals" },
  { key: "journal", label: "Journal" },
  { key: "contact", label: "Contact" },
];

export default function App() {
  const [route, setRoute] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(nextRoute) {
    if (nextRoute === "collection" || nextRoute === "occasions" || nextRoute === "journal" || nextRoute === "contact") {
      setRoute("home");
      window.setTimeout(() => document.getElementById(nextRoute === "collection" ? "collection" : nextRoute === "contact" ? "contact" : "journal")?.scrollIntoView({ behavior: "smooth" }), 0);
    } else {
      setRoute(nextRoute);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Analytics />
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button className="group flex flex-col text-left leading-none" onClick={() => navigate("home")} aria-label="Aroma Flowers Corner home">
              <span className="font-display text-2xl tracking-tight text-primary lg:text-3xl">Aroma Flowers Corner</span>
              <span className="mt-0.5 hidden text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:block">Flowers by Kirti · Nagpur</span>
            </button>
            <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
              {routes.map((item) => (
                <button
                  className={`relative text-sm tracking-wide transition-colors duration-300 hover:text-primary ${route === item.key || (route === "home" && item.key === "home") ? "text-primary" : "text-foreground/70"}`}
                  key={item.key}
                  onClick={() => navigate(item.key)}
                >
                  {item.label}
                  {route === item.key && <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary" />}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3 lg:gap-4">
              <a href="tel:+919923106684" className="hidden items-center gap-1.5 text-sm text-foreground/70 transition-colors hover:text-primary md:flex"><Phone className="h-3.5 w-3.5" />+91 99231 06684</a>
              <button className="hidden text-sm text-foreground/70 transition-colors hover:text-primary sm:block">Sign In</button>
              <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-sm border-0 bg-transparent text-current" aria-label="Open cart"><ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.8} /></button>
              <button className="p-1.5 text-primary lg:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="Menu">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
            </div>
          </div>
          <div className={`overflow-hidden transition-all duration-500 lg:hidden ${menuOpen ? "max-h-96" : "max-h-0"}`}>
            <nav className="flex flex-col gap-1 bg-background px-0 py-4">
              {routes.map((item) => <button key={item.key} onClick={() => navigate(item.key)} className="border-b border-border/50 py-2.5 text-left text-base text-foreground/80 last:border-0 hover:text-primary">{item.label}</button>)}
              <button onClick={() => navigate("booking")} className="border-b border-border/50 py-2.5 text-left text-base text-foreground/80 hover:text-primary">Book a Delivery</button>
            </nav>
          </div>
        </div>
      </header>
      <main>
        {route === "booking" && <Booking />}
        {route === "admin" && <Admin />}
        {route === "customise" && <Customise />}
        {route === "home" && <Home onCustomise={() => navigate("customise")} />}
      </main>
      {route === "home" && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-md lg:hidden">
          <div className="grid grid-cols-3 divide-x divide-border">
            <a href="tel:+919923106684" className="petal-btn flex flex-col items-center justify-center py-2.5 text-primary"><Phone className="h-4 w-4" /><span className="mt-0.5 text-[10px]">Call</span></a>
            <a href="https://wa.me/919923106684" target="_blank" rel="noreferrer" className="petal-btn flex flex-col items-center justify-center py-2.5 text-primary"><span className="text-base">◌</span><span className="mt-0.5 text-[10px]">WhatsApp</span></a>
            <button onClick={() => navigate("customise")} className="petal-btn flex flex-col items-center justify-center py-2.5 text-primary"><Sparkles className="h-4 w-4" /><span className="mt-0.5 text-[10px]">Customise</span></button>
          </div>
        </div>
      )}
    </div>
  );
}