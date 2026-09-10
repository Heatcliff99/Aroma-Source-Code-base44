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
