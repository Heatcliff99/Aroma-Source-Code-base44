import { ArrowRight, Instagram, Mail, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import Reveal from "@/components/Reveal";

const products = [
  { plate: "PLATE 01", price: "₹2,799.00", name: "Sage & Blush Bridal Bouquet", image: "/images/collection-01.webp" },
  { plate: "PLATE 02", price: "₹1,299.00", name: "Celebration Birthday Bouquet", image: "/images/collection-02.webp" },
  { plate: "PLATE 03", price: "₹1,799.00", name: "Pastel Dream Baby Shower Arrangement", image: "/images/collection-03.webp" },
  { plate: "PLATE 04", price: "₹12,999.00", name: "Mandap Majesty Décor", image: "/images/collection-04.webp" },
  { plate: "PLATE 05", price: "₹1,999.00", name: "Jasmine Floral Jewellery Set", image: "/images/collection-05.webp" },
  { plate: "PLATE 06", price: "₹1,499.00", name: "Atelier Hand-Tied Posy", image: "/images/collection-06.webp" },
  { plate: "PLATE 07", price: "₹3,499.00", name: "Marigold & Rose Varmala", image: "/images/collection-07.webp" },
  { plate: "PLATE 08", price: "₹2,499.00", name: "The Blush Garden Rose Bouquet", image: "/images/collection-08.webp" },
];

const instagramImages = [
  "/images/instagram-01.webp",
  "/images/instagram-02.webp",
  "/images/instagram-03.webp",
  "/images/instagram-04.webp",
  "/images/instagram-05.webp",
  "/images/instagram-06.webp",
];

export default function Home({ onCustomise }) {
  return (
    <div className="home-page">
      <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
        <img src="/images/hero.webp" alt="The Petal & Stem Atelier" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 lg:px-10">
          <Reveal>
            <div className="max-w-xl">
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-primary">The Petal &amp; Stem Atelier</p>
              <h1 className="font-display text-5xl leading-[1.05] text-primary lg:text-7xl">
                Compose your bouquet, bloom by bloom.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground/70">
                A women-owned floral atelier in Nagpur. Hand-tied bouquets, varmalas, floral jewellery and event décor — composed by hand, since 2018.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button onClick={onCustomise} className="petal-btn bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground">
                  Customise a bouquet
                </button>
                <a href="#collection" className="petal-btn border border-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary hover:bg-primary/5">
                  View the collection
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-28">
        <Reveal>
          <div className="overflow-hidden bg-muted">
            <img src="/images/bridal-feature.webp" alt="Sage & Blush Bridal Bouquet" className="aspect-[3/4] w-full object-cover" />
            <p className="px-1 pt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sage &amp; Blush Bridal Bouquet</p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="flex h-full flex-col justify-center">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">This Season&apos;s Pick</p>
            <h2 className="font-display text-4xl leading-tight text-primary lg:text-5xl">A bloom worth the wait</h2>
            <p className="mt-7 font-display text-2xl text-primary">₹2,799.00</p>
            <button onClick={onCustomise} className="petal-btn mt-6 w-fit bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground">
              Customise <ArrowRight className="ml-2 inline h-3.5 w-3.5" />
            </button>
            <h3 className="mt-10 font-display text-2xl text-primary">Sage &amp; Blush Bridal Bouquet</h3>
            <p className="mt-4 max-w-md leading-relaxed text-foreground/65">
              Each stem is sourced at first light and composed by hand in our Nagpur atelier. A keepsake of a moment, wrapped like a gift.
            </p>
            <a href="#collection" className="mt-5 w-fit text-xs uppercase tracking-[0.2em] text-primary underline underline-offset-8">
              Shop the pick
            </a>
          </div>
        </Reveal>
      </section>

      <section className="bg-secondary/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="flex h-full flex-col justify-center lg:order-1">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">The Season&apos;s Edit</p>
              <h2 className="font-display text-4xl leading-tight text-primary lg:text-5xl">
                A little corner of Nagpur where flowers become memory.
              </h2>
              <p className="mt-6 max-w-lg leading-relaxed text-foreground/65">
                Aroma Flowers Corner began in Manish Nagar in 2018 — a women-owned atelier built on the belief that a bouquet is never just flowers. It is a mark of a moment: a vow, a welcome, a goodbye, a celebration.
              </p>
              <p className="mt-4 max-w-lg leading-relaxed text-foreground/65">
                Today, from two shops in Manish Nagar and Khamla, we compose every arrangement by hand — sourcing the freshest blooms, wrapping them like a gift, and delivering them with care across Nagpur.
              </p>
              <a href="#journal" className="mt-7 w-fit text-xs uppercase tracking-[0.2em] text-primary underline underline-offset-8">
                Read the Artisan&apos;s Journal
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="lg:order-2">
              <img src="/images/hero.webp" alt="The atelier" className="aspect-[4/5] w-full object-cover lg:aspect-[4/5]" />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">In Season Now</p>
              <h2 className="font-display text-4xl text-primary lg:text-5xl">The Curated Collection</h2>
            </div>
            <a href="#collection" className="hidden items-center gap-2 text-sm text-primary transition-all hover:gap-3 sm:inline-flex">
              View all <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.name} delay={(index % 4) * 0.04}>
              <a href="#collection" className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
                </div>
                <div className="pt-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{product.plate}</p>
                  <p className="mt-1 text-sm text-primary">{product.price}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.13em] text-primary">Customise <span className="ml-1">→</span></p>
                  <h3 className="mt-2 font-display text-xl leading-tight text-primary">{product.name}</h3>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img src="/images/atelier-banner.webp" alt="The Petal & Stem Atelier" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative mx-auto max-w-3xl px-5 py-28 text-center text-primary-foreground lg:py-36">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-primary-foreground/70">The Petal &amp; Stem Atelier</p>
            <h2 className="font-display text-4xl leading-tight lg:text-6xl">Become the artist. Compose your own bouquet, bloom by bloom.</h2>
            <p className="mx-auto mb-9 mt-6 max-w-xl text-primary-foreground/80">
              Choose your primary blooms, your colours, your wrapping. We&apos;ll compose it by hand and deliver it across Nagpur.
            </p>
            <button onClick={onCustomise} className="petal-btn bg-background px-8 py-4 text-xs uppercase tracking-[0.2em] text-primary hover:bg-secondary/40">
              Open the Bouquet Builder
            </button>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary/15">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center lg:px-10 lg:py-28">
          <p className="mb-8 text-xs uppercase tracking-[0.3em] text-muted-foreground">Kind Words</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-secondary text-secondary" />)}
          </div>
          <blockquote className="mx-auto mt-5 max-w-2xl font-display text-3xl leading-tight text-primary lg:text-4xl">
            &quot;Ordered a bouquet for my mother — she cried happy tears. Thank you, Aroma.&quot;
          </blockquote>
          <p className="mt-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">Rohan D. · Birthday</p>
        </div>
      </section>

      <section id="journal" className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-10 lg:py-28">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">From Our Community</p>
        <h2 className="font-display text-4xl text-primary lg:text-5xl">@aromaflowerscorner</h2>
        <p className="mx-auto mt-4 max-w-lg text-foreground/65">A women-owned floral atelier in Nagpur, composing bouquets that mark a memory — since 2018.</p>
        <div className="mt-10 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {instagramImages.map((image, index) => <img key={image} src={image} alt={`Instagram post ${index + 1}`} className="aspect-square w-full object-cover" />)}
        </div>
        <p className="mt-12 font-display text-2xl italic text-primary">&quot;Where every bloom tells a story of fleeting beauty.&quot;</p>
      </section>

      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.3fr_0.7fr_1.2fr_1fr] lg:px-10 lg:py-20">
        <div>
          <p className="font-display text-3xl">Aroma Flowers Corner</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/70">Flowers by Kirti. Hand-composed in Nagpur, since 2018.</p>
          <div className="mt-6 flex gap-4">
            <a href="https://www.instagram.com/aromaflowerscorner" aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram className="h-5 w-5" /></a>
            <a href="mailto:hello@aromaflowerscorner.com" aria-label="Email"><Mail className="h-5 w-5" /></a>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/50">Explore</p>
          <div className="mt-5 grid gap-3 text-sm text-primary-foreground/80">
            <a href="#">Home</a>
            <a href="#collection">Collection</a>
            <a href="#customise">Customise</a>
            <a href="#journal">Journal</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/50">Our Shops</p>
          <div className="mt-5 grid gap-5 text-sm text-primary-foreground/80">
            <div><p className="text-primary-foreground">Manish Nagar</p><p className="mt-1 leading-relaxed">Shop No 10, 11, Manik Park, opposite Union Bank of India, Santaji Society, Manish Nagar, Somalwada, Nagpur, Maharashtra 440037</p></div>
            <div><p className="text-primary-foreground">Khamla</p><p className="mt-1 leading-relaxed">Kalash Complex, Gulmohar Hall, Near Gulmohar Hall, Pande Layout, Khamla, Nagpur, Maharashtra</p></div>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/50">Reach Us</p>
          <div className="mt-5 grid gap-3 text-sm text-primary-foreground/80">
            <a href="tel:+919923106684" className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 99231 06684</a>
            <a href="https://wa.me/919923106684" target="_blank" rel="noreferrer" className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
            <a href="https://www.instagram.com/aromaflowerscorner" target="_blank" rel="noreferrer" className="flex items-center gap-2"><Instagram className="h-4 w-4" /> @aromaflowerscorner</a>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Open daily · 9:00 AM – 10:00 PM</p>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-primary-foreground/20 px-5 py-6 text-[10px] uppercase tracking-[0.15em] text-primary-foreground/50 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <span>© {new Date().getFullYear()} Aroma Flowers Corner · Flowers by Kirti. All rights reserved.</span>
        <span>Nagpur · Est 2018</span>
      </div>
    </footer>
  );
}