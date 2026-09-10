import { useState } from "react";
import { Flower2, Menu, X } from "lucide-react";
import Admin from "@/pages/Admin";
import Booking from "@/pages/Booking";
import Customise from "@/pages/Customise";

const routes = [
  { key: "customise", label: "Customise" },
  { key: "booking", label: "Book a bloom" },
  { key: "admin", label: "Owner dashboard" },
];

export default function App() {
  const [route, setRoute] = useState("customise");
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(nextRoute) {
    setRoute(nextRoute);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="site-header">
        <button className="brand" onClick={() => navigate("customise")} aria-label="Aroma Flowers Corner home">
          <Flower2 className="h-5 w-5" />
          <span>Aroma Flowers Corner</span>
        </button>
        <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={`site-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          {routes.map((item) => (
            <button
              className={route === item.key ? "active" : ""}
              key={item.key}
              onClick={() => navigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {route === "booking" && <Booking />}
        {route === "admin" && <Admin />}
        {route === "customise" && <Customise />}
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Aroma Flowers Corner</span>
        <span>Flowers, composed with intention.</span>
      </footer>
    </div>
  );
}