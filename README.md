================================================================================
AROMA FLOWERS CORNER — SOURCE CODE EXPORT
Generated: 2026-09-10
Contents:
  1. base44/entities/InventoryItem.jsonc
  2. base44/entities/Booking.jsonc
  3. src/lib/siteData.js  (additions: BUDGET_TIERS, PRODUCT_TYPES, colourHex, extended FLOWER_COLOURS)
  4. src/pages/Customise.jsx
  5. src/components/admin/InventoryManager.jsx
  6. src/pages/Booking.jsx
  7. src/pages/Admin.jsx
  8. base44/functions/submitLead/entry.ts
================================================================================


================================================================================
FILE: base44/entities/InventoryItem.jsonc
================================================================================
{
  "name": "InventoryItem",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "category": { "type": "string", "enum": ["primary_bloom", "filler", "foliage", "wrapping", "ribbon", "addon"] },
    "price": { "type": "number" },
    "colours": { "type": "array", "items": { "type": "string" } },
    "shop_location": { "type": "string", "enum": ["Manish Nagar", "Khamla"] },
    "stock_status": { "type": "string", "enum": ["in_stock", "low_stock", "out_of_stock"], "default": "in_stock" },
    "available_from": { "type": "string", "format": "date" },
    "image": { "type": "string" },
    "tier_min": { "type": "number", "default": 100 },
    "product_types": { "type": "array", "items": { "type": "string" } },
    "active": { "type": "boolean", "default": true }
  },
  "required": ["name", "category", "price", "shop_location"],
  "rls": {
    "read": {},
    "create": { "user_condition": { "role": "admin" } },
    "update": { "user_condition": { "role": "admin" } },
    "delete": { "user_condition": { "role": "admin" } }
  }
}


================================================================================
FILE: base44/entities/Booking.jsonc
================================================================================
{
  "name": "Booking",
  "type": "object",
  "properties": {
    "customer_name": { "type": "string" },
    "phone": { "type": "string" },
    "email": { "type": "string" },
    "whatsapp_number": { "type": "string" },
    "event_date": { "type": "string", "format": "date" },
    "time_slot": { "type": "string" },
    "fulfillment_type": { "type": "string", "enum": ["delivery", "pickup"] },
    "shop_location": { "type": "string", "enum": ["Manish Nagar", "Khamla"] },
    "delivery_location": { "type": "string" },
    "palette": { "type": "string" },
    "notes": { "type": "string" },
    "source": { "type": "string", "enum": ["product", "builder", "booking_page"], "default": "booking_page" },
    "reference": { "type": "string" },
    "customisation_summary": { "type": "string" },
    "estimated_total": { "type": "number" },
    "status": { "type": "string", "enum": ["pending", "confirmed", "fulfilled", "cancelled"], "default": "pending" }
  },
  "required": ["customer_name", "phone", "event_date", "time_slot"],
  "rls": {
    "read": {
      "$or": [
        { "created_by_id": "{{user.id}}" },
        { "user_condition": { "role": "admin" } }
      ]
    },
    "update": { "user_condition": { "role": "admin" } },
    "delete": { "user_condition": { "role": "admin" } }
  }
}


================================================================================
FILE: src/lib/siteData.js  (ADDITIONS — insert near the top of the data exports)
================================================================================
export const BUDGET_TIERS = [100, 150, 200, 300, 400, 500, 700, 1000, 1500, 2000, 3000, 5000];

export const PRODUCT_TYPES = [
  { key: "bouquet", name: "Hand-Tied Bouquet", label: "Customise Your Bouquet" },
  { key: "basket", name: "Flower Basket", label: "Customise Your Flower Basket" },
  { key: "varmala", name: "Varmala", label: "Customise Your Varmala" },
  { key: "floral_jewellery", name: "Floral Jewellery", label: "Customise Your Floral Jewellery" },
  { key: "event_decor", name: "Event Décor", label: "Customise Your Event Décor" },
];

export const FLOWER_COLOURS = [
  { name: "Blush Pink", hex: "#EBCBCB" },
  { name: "Red", hex: "#7A1F2B" },
  { name: "White", hex: "#FAF7F2" },
  { name: "Yellow", hex: "#E8C25A" },
  { name: "Peach", hex: "#E8B89A" },
  { name: "Mixed", hex: "#C97A8A" },
  { name: "Purple", hex: "#7B5A8C" },
  { name: "Gold", hex: "#C9A24B" },
  { name: "Maroon", hex: "#5D1F1F" },
  { name: "Sage", hex: "#9CAE94" },
  { name: "Blue", hex: "#7B9AAE" },
];

export const colourHex = (name) => (FLOWER_COLOURS.find((c) => c.name === name) || {}).hex || "#EBCBCB";


================================================================================
FILE: src/pages/Customise.jsx
================================================================================
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Upload, Check, Lock, Leaf } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";
import {
  OCCASIONS,
  FLOWER_COLOURS,
  BUDGET_TIERS,
  PRODUCT_TYPES,
  colourHex,
  formatINR,
} from "@/lib/siteData";

let _id = 0;
const nid = () => `b${++_id}`;

const BLOOM_CATS = new Set(["primary_bloom", "filler", "foliage"]);
const TAB_LABELS = {
  primary_bloom: "Primary Blooms",
  filler: "Fillers & Leaves",
  foliage: "Foliage",
  wrapping: "Wrapping / Base",
  ribbon: "Ribbon",
  addon: "Add-ons",
};
const TAB_ORDER = ["primary_bloom", "filler", "foliage", "wrapping", "ribbon", "addon"];

// Fallback static catalog used only if inventory fetch is empty
import { BUILDER_TABS } from "@/lib/siteData";

function buildCatalog(records) {
  const map = new Map();
  records.forEach((r) => {
    if (r.active === false) return;
    const key = `${r.category}::${r.name}`;
    if (!map.has(key)) {
      map.set(key, {
        name: r.name,
        category: r.category,
        price: r.price,
        colours: r.colours || [],
        image: r.image,
        tier_min: r.tier_min || 100,
        product_types: r.product_types || [],
        shops: [],
      });
    }
    const entry = map.get(key);
    entry.shops.push({ shop: r.shop_location, status: r.stock_status, available_from: r.available_from });
  });
  const items = Array.from(map.values());
  items.forEach((it) => {
    const anyStock = it.shops.some((s) => s.status !== "out_of_stock");
    it.available = anyStock;
    if (!anyStock) {
      const dates = it.shops.map((s) => s.available_from).filter(Boolean).sort();
      it.available_from = dates[0] || null;
    }
  });
  return items;
}

export default function Customise() {
  const [productType, setProductType] = useState("bouquet");
  const [tier, setTier] = useState(500);
  const [occasion, setOccasion] = useState(null);
  const [activeTab, setActiveTab] = useState("primary_bloom");
  const [vase, setVase] = useState([]);
  const [colors, setColors] = useState({});
  const [vision, setVision] = useState("");
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.InventoryItem.list("-created_date", 500)
      .then((recs) => setCatalog(buildCatalog(recs)))
      .catch(() => setCatalog([]))
      .finally(() => setLoading(false));
  }, []);

  const pt = PRODUCT_TYPES.find((p) => p.key === productType);

  const tabItems = useMemo(() => {
    if (catalog.length === 0) {
      // fallback static
      const tab = BUILDER_TABS.find((t) => t.key === activeTab);
      return (tab ? tab.items : []).map((i) => ({
        name: i.name,
        category: activeTab,
        price: i.price,
        colours: BLOOM_CATS.has(activeTab) ? [FLOWER_COLOURS[0].name] : [],
        image: i.img,
        tier_min: 100,
        product_types: [],
        available: true,
        ribbonColour: i.colour,
      }));
    }
    return catalog.filter((i) => {
      if (i.category !== activeTab) return false;
      if (i.product_types && i.product_types.length && !i.product_types.includes(productType)) return false;
      return true;
    });
  }, [catalog, activeTab, productType]);

  const total = useMemo(() => vase.reduce((s, v) => s + v.price, 0), [vase]);

  function applyOccasion(occ) {
    setOccasion(occ.key);
    if (occ.tier) setTier(occ.tier);
    const presetVase = [];
    occ.preset.forEach((name) => {
      const item = catalog.find((i) => i.name === name) || fallbackItem(name);
      if (item) {
        presetVase.push({
          id: nid(),
          name: item.name,
          price: item.price,
          colour: BLOOM_CATS.has(item.category) ? (colors[item.name] || (item.colours[0] || FLOWER_COLOURS[0].name)) : null,
          tab: item.category,
          img: item.image,
        });
      }
    });
    setVase(presetVase);
  }

  function fallbackItem(name) {
    for (const tab of BUILDER_TABS) {
      const it = tab.items.find((i) => i.name === name);
      if (it) return { name: it.name, category: tab.key, price: it.price, image: it.img, colours: [], product_types: [], available: true };
    }
    return null;
  }

  function addItem(item) {
    if (!item.available) return;
    if ((item.tier_min || 100) > tier) return;
    const colour = BLOOM_CATS.has(item.category) ? (colors[item.name] || (item.colours[0] || FLOWER_COLOURS[0].name)) : null;
    setVase((v) => [...v, { id: nid(), name: item.name, price: item.price, colour, tab: item.category, img: item.image }]);
  }

  function removeItem(id) {
    setVase((v) => v.filter((i) => i.id !== id));
  }

  function setColor(itemName, colourName) {
    setColors((c) => ({ ...c, [itemName]: colourName }));
    setVase((v) => v.map((i) => (i.name === itemName ? { ...i, colour: colourName } : i)));
  }

  function clearAll() {
    setVase([]);
    setOccasion(null);
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setInspirationUrl(file_url);
    } catch (_e) {}
  }

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-10 pt-12 lg:pt-16">
      <Reveal>
        <header className="text-center pb-12 lg:pb-16 border-b border-border">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">The Petal & Stem Atelier</p>
          <h1 className="font-display text-5xl lg:text-7xl text-primary leading-[1.05]">{pt.label}</h1>
          <p className="mt-4 text-foreground/60 italic font-display text-xl">Compose your piece, bloom by bloom.</p>
        </header>
      </Reveal>

      {/* OCCASION CARDS */}
      <section className="py-12 lg:py-16 border-b border-border">
        <Reveal>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6 text-center">
            Choose your occasion — we'll pre-load the perfect blooms
          </p>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {OCCASIONS.map((occ, i) => (
            <Reveal key={occ.key} delay={(i % 5) * 0.04}>
              <button
                onClick={() => applyOccasion(occ)}
                className={`petal-btn group w-full text-left p-4 border transition-all ${
                  occasion === occ.key ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary bg-background"
                }`}
              >
                <div className={`w-10 h-10 rounded-full mb-3 ${occasion === occ.key ? "bg-secondary" : "bg-secondary/40"} flex items-center justify-center`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="font-display text-lg leading-tight">{occ.name}</p>
                <p className={`text-[10px] tracking-wide uppercase mt-1 ${occasion === occ.key ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{occ.tag}</p>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRODUCT TYPE + BUDGET */}
      <section className="py-10 lg:py-14 border-b border-border space-y-8">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 text-center">Step 1 — What are we composing?</p>
          <div className="flex flex-wrap justify-center gap-2">
            {PRODUCT_TYPES.map((p) => (
              <button
                key={p.key}
                onClick={() => setProductType(p.key)}
                className={`petal-btn px-4 py-2.5 text-xs tracking-[0.12em] uppercase border transition-all ${
                  productType === p.key ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 text-center">
            Step 2 — Choose your budget {tier >= 5000 && <span className="text-secondary">· Premium Collection</span>}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {BUDGET_TIERS.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`petal-btn px-3.5 py-2 text-xs border transition-all ${
                  tier === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
                }`}
              >
                {t >= 5000 ? `₹${t / 1000}k+` : `₹${t}`}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Higher budgets unlock premium & imported species and richer packaging.
          </p>
        </div>
      </section>

      {/* BUILDER */}
      <section className="py-12 lg:py-16 grid lg:grid-cols-2 gap-10 lg:gap-14">
        {/* VASE PREVIEW */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-secondary/15 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Your {pt.name}</p>
              <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4">
                Clear
              </button>
            </div>

            <div className="relative h-72 flex items-end justify-center mb-6">
              <div className="relative w-56 h-full">
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-44 h-44">
                  <div className="relative w-full h-full">
                    {vase.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-center">
                        <p className="text-sm text-muted-foreground italic font-display text-lg">Your piece awaits its first bloom</p>
                      </div>
                    )}
                    {vase.map((b, i) => {
                      const isBloom = BLOOM_CATS.has(b.tab);
                      const hex = b.colour ? colourHex(b.colour) : "#9CAE94";
                      const size = b.tab === "primary_bloom" ? 64 : b.tab === "foliage" ? 40 : 48;
                      const left = 50 + Math.cos((i / Math.max(vase.length, 1)) * Math.PI * 2) * 30;
                      const top = 40 + Math.sin((i / Math.max(vase.length, 1)) * Math.PI * 2) * 30;
                      return (
                        <motion.button
                          key={b.id}
                          layout
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          onClick={() => removeItem(b.id)}
                          style={{
                            position: "absolute",
                            left: `${left}%`,
                            top: `${top}%`,
                            width: size,
                            height: size,
                            transform: "translate(-50%, -50%)",
                            background: isBloom ? hex : "#9CAE94",
                            zIndex: 10 + i,
                          }}
                          className="rounded-full shadow-md border border-white/40 hover:scale-110 transition-transform"
                          title={`${b.name} — tap to remove`}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-16">
                  <div className="w-full h-full bg-primary/15 border border-primary/30" style={{ clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0 100%)" }} />
                </div>
              </div>
            </div>

            <p className="text-sm text-foreground/70 italic font-display text-lg text-center mb-1">
              {vase.length === 0 ? "—" : `${vase.length} element${vase.length > 1 ? "s" : ""} · ${occasionName(occasion)}`}
            </p>
            <p className="text-xs text-muted-foreground text-center mb-5">
              {vase.length === 0 ? "Add blooms to begin" : "A balanced, hand-tied composition"}
            </p>

            <div className="flex flex-wrap gap-2 justify-center mb-5 min-h-[2rem]">
              <AnimatePresence>
                {vase.map((b) => (
                  <motion.span
                    key={b.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1.5 text-xs bg-background border border-border px-2.5 py-1"
                  >
                    {b.colour && <span className="w-2.5 h-2.5 rounded-full border border-border" style={{ background: colourHex(b.colour) }} />}
                    {b.name}
                    <button onClick={() => removeItem(b.id)} className="text-muted-foreground hover:text-primary"><X className="w-3 h-3" /></button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Estimated total</span>
              <span className="font-display text-3xl text-primary">{formatINR(total)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-center">
              Pricing is indicative — we'll confirm the final arrangement and delivery when we call you back.
            </p>

            <button
              onClick={() => setBookingOpen(true)}
              disabled={vase.length === 0}
              className="petal-btn w-full mt-5 bg-primary text-primary-foreground py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-primary/90 disabled:opacity-40"
            >
              Proceed to Book This Order
            </button>
          </div>

          <div className="mt-6 p-6 border border-border">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Upload Inspiration</p>
            <label className="petal-btn inline-flex items-center gap-2 border border-primary text-primary px-5 py-2.5 text-xs tracking-wide cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              <Upload className="w-4 h-4" /> {inspirationUrl ? "Photo added" : "Choose a reference photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
            {inspirationUrl && <Check className="w-4 h-4 text-accent inline ml-2" />}
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              rows={3}
              placeholder="Tell us your vision…"
              className="w-full mt-4 border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* INVENTORY */}
        <div>
          <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4">
            {TAB_ORDER.map((key) => {
              const count = catalog.filter((i) => i.category === key && (!i.product_types || !i.product_types.length || i.product_types.includes(productType))).length;
              if (catalog.length && count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`petal-btn px-4 py-2 text-xs tracking-[0.15em] uppercase transition-all ${
                    activeTab === key ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-primary"
                  }`}
                >
                  {TAB_LABELS[key]}
                </button>
              );
            })}
          </div>

          {loading ? (
            <p className="text-muted-foreground py-10 italic font-display text-xl">Gathering the freshest blooms…</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tabItems.map((item) => {
                const locked = (item.tier_min || 100) > tier;
                const unavailable = !item.available;
                const swatches = item.colours && item.colours.length ? item.colours : BLOOM_CATS.has(item.category) ? [FLOWER_COLOURS[0].name] : [];
                return (
                  <div
                    key={item.name}
                    className={`group border p-3 transition-colors relative ${
                      unavailable ? "border-border opacity-50" : locked ? "border-border" : "border-border hover:border-primary"
                    }`}
                  >
                    <button
                      onClick={() => addItem(item)}
                      disabled={unavailable || locked}
                      className="block w-full text-left disabled:cursor-not-allowed"
                    >
                      {item.image ? (
                        <div className="aspect-square overflow-hidden bg-muted mb-3">
                          <Image src={item.image} alt={item.name} fittingType="fill" className="w-full h-full transition-transform group-hover:scale-105" />
                        </div>
                      ) : (
                        <div className="aspect-square mb-3 flex items-center justify-center bg-secondary/20">
                          {BLOOM_CATS.has(item.category) ? (
                            <span className="w-12 h-12 rounded-full border border-border" style={{ background: colourHex(swatches[0]) }} />
                          ) : (
                            <Leaf className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <p className="font-display text-lg leading-tight">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{formatINR(item.price)}</p>
                    </button>

                    {locked && !unavailable && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-muted-foreground bg-background/80 px-1.5 py-0.5">
                        <Lock className="w-3 h-3" /> ₹{item.tier_min}
                      </div>
                    )}
                    {unavailable && (
                      <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                        <span className="text-[10px] text-center px-2 text-muted-foreground">
                          {item.available_from ? `Available from ${new Date(item.available_from).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "Out of stock"}
                        </span>
                      </div>
                    )}

                    {swatches.length > 0 && !unavailable && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {swatches.map((c) => (
                          <button
                            key={c}
                            onClick={() => setColor(item.name, c)}
                            title={c}
                            className={`w-5 h-5 rounded-full border transition-all ${
                              (colors[item.name] || swatches[0]) === c ? "border-primary ring-1 ring-primary scale-110" : "border-border"
                            }`}
                            style={{ background: colourHex(c) }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {bookingOpen && (
          <BookingModal
            vase={vase}
            total={total}
            occasion={occasionName(occasion)}
            productType={pt.name}
            tier={tier}
            vision={vision}
            inspirationUrl={inspirationUrl}
            onClose={() => setBookingOpen(false)}
            submitted={submitted}
            setSubmitted={setSubmitted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function occasionName(key) {
  if (!key) return "Everyday";
  return OCCASIONS.find((o) => o.key === key)?.name || "Everyday";
}

function BookingModal({ vase, total, occasion, productType, tier, vision, inspirationUrl, onClose, submitted, setSubmitted }) {
  const [form, setForm] = useState({
    customer_name: "", phone: "", email: "", whatsapp_number: "",
    event_date: "", time_slot: "10:00 AM - 12:00 PM",
    shop_location: "Manish Nagar", fulfillment_type: "pickup",
    delivery_location: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const slots = ["10:00 AM - 12:00 PM", "12:00 PM - 2:00 PM", "2:00 PM - 4:00 PM", "4:00 PM - 6:00 PM", "6:00 PM - 8:00 PM", "8:00 PM - 10:00 PM"];

  const mapSrc = form.delivery_location
    ? `https://maps.google.com/maps?q=${encodeURIComponent(form.delivery_location)}&output=embed`
    : `https://maps.google.com/maps?q=Manish+Nagar+Nagpur&output=embed`;

  async function submit(e) {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.event_date) {
      setErr("Please fill your name, phone and preferred date.");
      return;
    }
    if (form.fulfillment_type === "delivery" && !form.delivery_location) {
      setErr("Please share your delivery location (Google Maps link or address).");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      await base44.functions.invoke("submitLead", {
        type: "custom_bouquet",
        data: {
          ...form,
          whatsapp_number: form.whatsapp_number || form.phone,
          occasion,
          items: vase.map((v) => ({ name: v.name, colour: v.colour || "", price: v.price })),
          estimated_total: total,
          vision,
          inspiration_url: inspirationUrl,
        },
      });
      setSubmitted(true);
    } catch (error) {
      setErr(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-background w-full max-w-lg max-h-[90vh] overflow-y-auto p-7 lg:p-9"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-secondary/40 flex items-center justify-center mx-auto mb-5">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-3xl text-primary mb-3">Your piece is on its way to us</h3>
            <p className="text-foreground/60 mb-6">We'll call you back shortly to confirm the arrangement, colours and delivery.</p>
            <button onClick={onClose} className="petal-btn border border-primary px-6 py-3 text-xs tracking-[0.2em] uppercase">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-3xl text-primary">Book This Order</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-primary"><X className="w-5 h-5" /></button>
            </div>

            <div className="bg-secondary/15 p-4 mb-5 text-sm">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Your {productType} · {occasion} · Budget {formatINR(tier)}
              </p>
              <p className="text-foreground/70">{vase.map((v) => v.name).join(", ")}</p>
              <div className="flex justify-between mt-3 pt-3 border-t border-border">
                <span className="text-muted-foreground">Estimated total</span>
                <span className="font-display text-xl text-primary">{formatINR(total)}</span>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <Field label="Full Name *">
                <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="input-field" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone *">
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="10-digit mobile" />
                </Field>
                <Field label="WhatsApp Number">
                  <input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} className="input-field" placeholder="For order updates" />
                </Field>
              </div>
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Preferred Date *">
                  <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="input-field" />
                </Field>
                <Field label="Time Slot">
                  <select value={form.time_slot} onChange={(e) => setForm({ ...form, time_slot: e.target.value })} className="input-field">
                    {slots.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fulfillment">
                  <select value={form.fulfillment_type} onChange={(e) => setForm({ ...form, fulfillment_type: e.target.value })} className="input-field">
                    <option value="pickup">Shop Pickup</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </Field>
                <Field label="Shop Location">
                  <select value={form.shop_location} onChange={(e) => setForm({ ...form, shop_location: e.target.value })} className="input-field">
                    <option>Manish Nagar</option>
                    <option>Khamla</option>
                  </select>
                </Field>
              </div>

              {form.fulfillment_type === "delivery" && (
                <Field label="Delivery Location * (paste Google Maps link or address)">
                  <input
                    value={form.delivery_location}
                    onChange={(e) => setForm({ ...form, delivery_location: e.target.value })}
                    className="input-field"
                    placeholder="https://maps.app.goo.gl/… or full address"
                  />
                  <div className="mt-2 aspect-video w-full overflow-hidden border border-border">
                    <iframe src={mapSrc} title="Delivery location" className="w-full h-full" loading="lazy" />
                  </div>
                </Field>
              )}

              {err && <p className="text-sm text-destructive">{err}</p>}
              <button type="submit" disabled={loading} className="petal-btn w-full bg-primary text-primary-foreground py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-primary/90 disabled:opacity-50">
                {loading ? "Sending…" : "Confirm Booking"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}


================================================================================
FILE: src/components/admin/InventoryManager.jsx
================================================================================
import { useState, useEffect, useCallback } from "react";
import { Layers, Plus, X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatINR } from "@/lib/siteData";

const CATS = ["primary_bloom", "filler", "foliage", "wrapping", "ribbon", "addon"];
const CAT_LABELS = {
  primary_bloom: "Primary Blooms",
  filler: "Fillers",
  foliage: "Foliage",
  wrapping: "Wrapping / Base",
  ribbon: "Ribbon",
  addon: "Add-ons",
};

export default function InventoryManager() {
  const [shop, setShop] = useState("Manish Nagar");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "primary_bloom", price: 100, tier_min: 100, colours: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await base44.entities.InventoryItem.list("-created_date", 500);
      setItems(all.filter((i) => i.shop_location === shop));
    } catch (_e) {}
    finally { setLoading(false); }
  }, [shop]);

  useEffect(() => { load(); }, [load]);

  async function update(id, patch) {
    await base44.entities.InventoryItem.update(id, patch);
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function addNew(e) {
    e.preventDefault();
    if (!newItem.name) return;
    await base44.entities.InventoryItem.create({
      name: newItem.name,
      category: newItem.category,
      price: Number(newItem.price),
      tier_min: Number(newItem.tier_min),
      colours: newItem.colours ? newItem.colours.split(",").map((s) => s.trim()).filter(Boolean) : [],
      shop_location: shop,
      stock_status: "in_stock",
      active: true,
    });
    setNewItem({ name: "", category: "primary_bloom", price: 100, tier_min: 100, colours: "" });
    setAdding(false);
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex gap-2">
          {["Manish Nagar", "Khamla"].map((s) => (
            <button
              key={s}
              onClick={() => setShop(s)}
              className={`petal-btn px-4 py-2 text-xs tracking-[0.12em] uppercase border transition-all ${
                shop === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => setAdding((v) => !v)} className="petal-btn flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 text-xs tracking-wide">
          {adding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {adding ? "Cancel" : "Add Item"}
        </button>
      </div>

      {adding && (
        <form onSubmit={addNew} className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-5 border border-border p-4">
          <input placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="input-field col-span-2 lg:col-span-1" />
          <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="input-field">
            {CATS.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
          </select>
          <input type="number" placeholder="Price ₹" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="input-field" />
          <input type="number" placeholder="Tier min ₹" value={newItem.tier_min} onChange={(e) => setNewItem({ ...newItem, tier_min: e.target.value })} className="input-field" />
          <input placeholder="Colours (comma sep)" value={newItem.colours} onChange={(e) => setNewItem({ ...newItem, colours: e.target.value })} className="input-field col-span-2 lg:col-span-1" />
          <button type="submit" className="petal-btn bg-accent text-accent-foreground px-4 py-2 text-xs tracking-wide col-span-2 lg:col-span-1">Create</button>
        </form>
      )}

      {loading ? (
        <p className="text-muted-foreground py-6">Loading inventory…</p>
      ) : (
        <div className="space-y-6">
          {CATS.map((cat) => {
            const catItems = items.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" /> {CAT_LABELS[cat]} · {catItems.length}
                </p>
                <div className="space-y-2">
                  {catItems.map((it) => (
                    <div key={it.id} className="flex flex-wrap items-center gap-3 border border-border p-3">
                      <div className="flex-1 min-w-[140px]">
                        <p className="font-display text-base text-primary">{it.name}</p>
                        <p className="text-xs text-muted-foreground">{formatINR(it.price)} · Tier ₹{it.tier_min || 100}</p>
                      </div>

                      <select
                        value={it.stock_status}
                        onChange={(e) => update(it.id, { stock_status: e.target.value })}
                        className={`text-xs border px-2 py-1 ${stockColor(it.stock_status)}`}
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>

                      {it.stock_status === "out_of_stock" && (
                        <input
                          type="date"
                          value={it.available_from ? it.available_from.slice(0, 10) : ""}
                          onChange={(e) => update(it.id, { available_from: e.target.value })}
                          className="text-xs border border-border px-2 py-1"
                          title="Available from"
                        />
                      )}

                      <label className="flex items-center gap-1 text-xs text-muted-foreground">
                        ₹
                        <input
                          type="number"
                          value={it.price}
                          onChange={(e) => update(it.id, { price: Number(e.target.value) })}
                          className="w-20 border border-border px-2 py-1"
                        />
                      </label>

                      <button
                        onClick={() => update(it.id, { active: !it.active })}
                        className={`text-[10px] tracking-wide uppercase px-2 py-1 border ${it.active ? "border-accent text-accent" : "border-border text-muted-foreground"}`}
                      >
                        {it.active ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Active</span> : "Retired"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function stockColor(s) {
  return s === "in_stock" ? "border-accent text-accent" : s === "low_stock" ? "border-secondary text-primary" : "border-destructive text-destructive";
}


================================================================================
FILE: src/pages/Booking.jsx
================================================================================
import { useState } from "react";
import { Check, Calendar, Clock, MapPin, Truck, Store } from "lucide-react";
import Reveal from "@/components/Reveal";
import { base44 } from "@/api/base44Client";
import { SHOPS, FLOWER_COLOURS } from "@/lib/siteData";

const SLOTS = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 05:00 PM",
  "05:00 PM - 07:00 PM",
  "07:00 PM - 09:00 PM",
];

export default function Booking() {
  const [form, setForm] = useState({
    customer_name: "", phone: "", email: "", whatsapp_number: "",
    event_date: "", time_slot: SLOTS[0],
    fulfillment_type: "delivery", shop_location: "Manish Nagar",
    delivery_location: "",
    palette: "", notes: "", reference: "",
  });

  const mapSrc = form.delivery_location
    ? `https://maps.google.com/maps?q=${encodeURIComponent(form.delivery_location)}&output=embed`
    : `https://maps.google.com/maps?q=Manish+Nagar+Nagpur&output=embed`;
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.event_date) { setErr("Please fill your name, phone and preferred date."); return; }
    if (form.fulfillment_type === "delivery" && !form.delivery_location) { setErr("Please share your delivery location (Google Maps link or address)."); return; }
    setLoading(true); setErr("");
    try {
      await base44.functions.invoke("submitLead", { type: "booking", data: form });
      setDone(true);
    } catch (error) { setErr(error.message || "Something went wrong."); }
    finally { setLoading(false); }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/40 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display text-4xl text-primary mb-4">Booking received</h1>
        <p className="text-foreground/60 mb-8">We'll confirm your date, time and delivery details when we call you back.</p>
        <button onClick={() => { setDone(false); setForm({ ...form, customer_name: "", phone: "", event_date: "" }); }} className="petal-btn border border-primary px-6 py-3 text-xs tracking-[0.2em] uppercase">
          Make another booking
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 lg:px-10 pt-12 lg:pt-16">
      <Reveal>
        <header className="text-center pb-14 lg:pb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Pre-Booking Calendar</p>
          <h1 className="font-display text-5xl lg:text-7xl text-primary leading-[1.05]">Book your bloom</h1>
          <p className="mt-5 text-foreground/60 italic font-display text-xl">
            Pick a date, a time, and where you'd like it.
          </p>
        </header>
      </Reveal>

      <form onSubmit={submit} className="grid lg:grid-cols-2 gap-10 lg:gap-14">
        {/* left: schedule */}
        <Reveal>
          <div className="space-y-7">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" /> Choose a date</p>
              <input type="date" value={form.event_date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="input-field" />
              <p className="text-xs text-muted-foreground mt-2">Some dates may be unavailable during peak seasons — we'll confirm when we call.</p>
            </div>

            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Preferred time slot</p>
              <div className="grid grid-cols-2 gap-2">
                {SLOTS.map((s) => (
                  <button type="button" key={s} onClick={() => setForm({ ...form, time_slot: s })}
                    className={`petal-btn px-3 py-2.5 text-xs border transition-all ${form.time_slot === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 flex items-center gap-2"><Truck className="w-4 h-4" /> Fulfillment</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: "delivery", label: "Delivery", icon: Truck },
                  { v: "pickup", label: "Shop Pickup", icon: Store },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <button type="button" key={f.v} onClick={() => setForm({ ...form, fulfillment_type: f.v })}
                      className={`petal-btn flex items-center justify-center gap-2 px-3 py-3 text-xs border transition-all ${form.fulfillment_type === f.v ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
                      <Icon className="w-4 h-4" /> {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> Shop location</p>
              <div className="grid grid-cols-2 gap-2">
                {SHOPS.map((s) => (
                  <button type="button" key={s.id} onClick={() => setForm({ ...form, shop_location: s.short })}
                    className={`petal-btn px-3 py-3 text-xs border transition-all ${form.shop_location === s.short ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
                    {s.short}
                  </button>
                ))}
              </div>
            </div>

            {form.fulfillment_type === "delivery" && (
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> Delivery location</p>
                <input
                  placeholder="Paste your Google Maps link or full address *"
                  value={form.delivery_location}
                  onChange={(e) => setForm({ ...form, delivery_location: e.target.value })}
                  className="input-field"
                />
                <div className="mt-3 aspect-video w-full overflow-hidden border border-border">
                  <iframe src={mapSrc} title="Delivery location" className="w-full h-full" loading="lazy" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Drop a pin in Google Maps, share the link here — this is where your order will be delivered.</p>
              </div>
            )}

            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Preferred flower palette</p>
              <div className="flex flex-wrap gap-2">
                {FLOWER_COLOURS.map((c) => (
                  <button type="button" key={c.name} onClick={() => setForm({ ...form, palette: c.name })}
                    className={`petal-btn flex items-center gap-2 px-3 py-2 text-xs border transition-all ${form.palette === c.name ? "border-primary" : "border-border hover:border-primary"}`}>
                    <span className="w-4 h-4 rounded-full border border-border" style={{ background: c.hex }} /> {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* right: details + summary */}
        <Reveal delay={0.1}>
          <div className="space-y-5">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Your details</p>
            <input placeholder="Full Name *" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="input-field" />
            <input placeholder="Phone (10-digit) *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
            <input placeholder="WhatsApp number (for order updates)" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} className="input-field" />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            <input placeholder="Reference (product or bouquet name)" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="input-field" />
            <textarea placeholder="Notes — tell us anything we should know" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" />

            {/* summary */}
            <div className="bg-secondary/15 p-5 text-sm space-y-1.5">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Summary</p>
              <Row label="Date" value={form.event_date || "—"} />
              <Row label="Time" value={form.time_slot} />
              <Row label="Fulfillment" value={form.fulfillment_type === "delivery" ? "Delivery" : "Shop Pickup"} />
              <Row label="Shop" value={form.shop_location} />
              {form.fulfillment_type === "delivery" && <Row label="Delivery to" value={form.delivery_location || "—"} />}
              <Row label="WhatsApp" value={form.whatsapp_number || form.phone || "—"} />
              <Row label="Palette" value={form.palette || "—"} />
            </div>

            {err && <p className="text-sm text-destructive">{err}</p>}
            <button type="submit" disabled={loading} className="petal-btn w-full bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase hover:bg-primary/90 disabled:opacity-50">
              {loading ? "Confirming…" : "Confirm Booking"}
            </button>
            <p className="text-xs text-muted-foreground text-center">You'll receive a confirmation by email and WhatsApp.</p>
          </div>
        </Reveal>
      </form>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground/80">{value}</span>
    </div>
  );
}


================================================================================
FILE: src/pages/Admin.jsx
================================================================================
import { useState, useEffect, useCallback } from "react";
import { Check, X, Mail, Calendar, Sparkles, Star, Users, Layers } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatINR } from "@/lib/siteData";
import InventoryManager from "@/components/admin/InventoryManager";

const TABS = [
  { key: "enquiries", label: "Enquiries", icon: Mail, entity: "Enquiry" },
  { key: "bookings", label: "Bookings", icon: Calendar, entity: "Booking" },
  { key: "bouquets", label: "Custom Bouquets", icon: Sparkles, entity: "CustomBouquet" },
  { key: "feedback", label: "Feedback", icon: Star, entity: "Feedback" },
  { key: "inventory", label: "Inventory", icon: Layers, entity: "InventoryItem" },
  { key: "customers", label: "Customers", icon: Users, entity: "User" },
];

export default function Admin() {
  const [tab, setTab] = useState("enquiries");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [enq, bk, cb, fb, users, inv] = await Promise.all([
        base44.entities.Enquiry.list("-created_date", 100),
        base44.entities.Booking.list("-created_date", 100),
        base44.entities.CustomBouquet.list("-created_date", 100),
        base44.entities.Feedback.list("-created_date", 100),
        base44.entities.User.list("-created_date", 100).catch(() => []),
        base44.entities.InventoryItem.list("-created_date", 500).catch(() => []),
      ]);
      setData({ enquiries: enq, bookings: bk, bouquets: cb, feedback: fb, customers: users, inventory: inv });
    } catch (_e) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    load();
  }, [load]);

  if (!user) {
    return <div className="mx-auto max-w-3xl px-5 py-32 text-center text-muted-foreground">Loading…</div>;
  }
  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <h1 className="font-display text-3xl text-primary mb-3">Owner access only</h1>
        <p className="text-foreground/60">This dashboard is for shop owners.</p>
      </div>
    );
  }

  const active = TABS.find((t) => t.key === tab);
  const records = data[tab] || [];

  async function update(entity, id, patch) {
    await base44.entities[entity].update(id, patch);
    load();
  }

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-10 pt-12 lg:pt-16">
      <header className="pb-8 border-b border-border">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">Owner Dashboard</p>
        <h1 className="font-display text-4xl lg:text-5xl text-primary">Aroma Flowers Corner · Admin</h1>
      </header>

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-8">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`text-left border p-5 transition-colors ${tab === t.key ? "border-primary bg-secondary/15" : "border-border hover:border-primary"}`}>
            <t.icon className="w-5 h-5 text-primary mb-2" />
            <p className="font-display text-3xl text-primary">{(data[t.key] || []).length}</p>
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">{t.label}</p>
          </button>
        ))}
      </div>

      {/* tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3 mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 text-xs tracking-[0.15em] uppercase transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:text-primary"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "inventory" ? (
        <InventoryManager />
      ) : loading ? (
        <p className="text-muted-foreground py-10">Loading…</p>
      ) : records.length === 0 ? (
        <p className="text-muted-foreground py-10 italic font-display text-xl">No {active.label.toLowerCase()} yet.</p>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <RecordRow key={r.id} record={r} tab={tab} entity={active.entity} onUpdate={update} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecordRow({ record, tab, entity, onUpdate }) {
  const [open, setOpen] = useState(false);

  if (tab === "enquiries") {
    return (
      <div className="border border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-lg text-primary">{record.name}</p>
            <p className="text-sm text-foreground/60">{record.phone} {record.email && `· ${record.email}`}</p>
            <p className="text-xs text-muted-foreground mt-1">{record.occasion || "—"} {record.event_date && `· ${record.event_date}`}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge value={record.status} />
            <select value={record.status} onChange={(e) => onUpdate(entity, record.id, { status: e.target.value })} className="text-xs border border-border px-2 py-1">
              <option value="new">New</option>
              <option value="responded">Responded</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-foreground/70 mt-2">{record.message}</p>
      </div>
    );
  }

  if (tab === "bookings") {
    return (
      <div className="border border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-lg text-primary">{record.customer_name}</p>
            <p className="text-sm text-foreground/60">{record.phone} {record.email && `· ${record.email}`}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {record.event_date} · {record.time_slot} · {record.fulfillment_type} · {record.shop_location}
              {record.palette && ` · ${record.palette}`}
            </p>
            {record.whatsapp_number && <p className="text-xs text-foreground/70 mt-1">WhatsApp: {record.whatsapp_number}</p>}
            {record.delivery_location && (
              <p className="text-xs text-foreground/70 mt-1 flex items-center gap-1">
                Delivery to: <a href={/^https?:\/\//.test(record.delivery_location) ? record.delivery_location : `https://maps.google.com/maps?q=${encodeURIComponent(record.delivery_location)}`} target="_blank" rel="noreferrer" className="text-primary underline">{record.delivery_location}</a>
              </p>
            )}
            {record.reference && <p className="text-xs text-foreground/70 mt-1">Ref: {record.reference}</p>}
            {record.notes && <p className="text-sm text-foreground/70 mt-1">{record.notes}</p>}
          </div>
          <select value={record.status} onChange={(e) => onUpdate(entity, record.id, { status: e.target.value })} className="text-xs border border-border px-2 py-1">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    );
  }

  if (tab === "bouquets") {
    return (
      <div className="border border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-lg text-primary">{record.customer_name}</p>
            <p className="text-sm text-foreground/60">{record.phone} {record.email && `· ${record.email}`}</p>
            <p className="text-xs text-muted-foreground mt-1">Occasion: {record.occasion} · {formatINR(record.estimated_total || 0)}</p>
            <button onClick={() => setOpen((v) => !v)} className="text-xs text-primary underline underline-offset-4 mt-2">
              {open ? "Hide" : "View"} composition
            </button>
            {open && (
              <div className="mt-2 text-sm text-foreground/70">
                <p>{(record.items || []).map((i) => `${i.name}${i.colour ? ` (${i.colour})` : ""}`).join(", ")}</p>
                {record.vision && <p className="mt-1 italic">Vision: {record.vision}</p>}
                {record.inspiration_url && <a href={record.inspiration_url} target="_blank" rel="noreferrer" className="text-primary underline text-xs">View inspiration</a>}
              </div>
            )}
          </div>
          <select value={record.status} onChange={(e) => onUpdate(entity, record.id, { status: e.target.value })} className="text-xs border border-border px-2 py-1">
            <option value="new">New</option>
            <option value="in_review">In Review</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
      </div>
    );
  }

  if (tab === "customers") {
    return (
      <div className="border border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-lg text-primary">{record.full_name || record.email}</p>
            <p className="text-sm text-foreground/60">{record.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {record.data?.phone && `Phone: ${record.data.phone} · `}
              {record.data?.address && `Address: ${record.data.address} · `}
              Role: {record.role}
            </p>
            {record.data?.how_heard && <p className="text-xs text-foreground/60 mt-1">Heard via: {record.data.how_heard}</p>}
          </div>
          <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
            {new Date(record.created_date).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  }

  // feedback
  return (
    <div className="border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < (record.rating || 0) ? "fill-secondary text-secondary" : "text-border"}`} />
            ))}
          </div>
          <p className="font-display text-lg text-primary">{record.name} <span className="text-xs text-muted-foreground font-body">· {record.occasion || ""}</span></p>
          <p className="text-sm text-foreground/70 mt-1">{record.comment}</p>
        </div>
        <div className="flex gap-2">
          {!record.approved ? (
            <button onClick={() => onUpdate(entity, record.id, { approved: true })} className="petal-btn flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 text-xs">
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
          ) : (
            <span className="text-xs text-accent flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Approved</span>
          )}
          <button onClick={() => onUpdate(entity, record.id, { approved: false })} className="petal-btn border border-border px-3 py-1.5 text-xs hover:border-primary">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  const colors = { new: "bg-secondary/40 text-primary", responded: "bg-accent/20 text-accent", closed: "bg-muted text-muted-foreground" };
  return <span className={`text-[10px] tracking-[0.15em] uppercase px-2 py-1 ${colors[value] || ""}`}>{value}</span>;
}


================================================================================
FILE: base44/functions/submitLead/entry.ts
================================================================================
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const ENTITY_MAP = {
  enquiry: 'Enquiry',
  booking: 'Booking',
  custom_bouquet: 'CustomBouquet',
  feedback: 'Feedback',
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { type, data } = body || {};
    const entityName = ENTITY_MAP[type];
    if (!entityName || !data || typeof data !== 'object') {
      return Response.json({ error: 'Invalid submission' }, { status: 400 });
    }

    const created = await base44.asServiceRole.entities[entityName].create(data);

    return Response.json({ ok: true, id: created.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}


================================================================================
END OF EXPORT
================================================================================
