import { useState } from "react";
import { Check, Calendar, Clock, MapPin, Truck, Store } from "lucide-react";
import Reveal from "@/components/Reveal";
import { store } from "@/api/store";
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
      await store.submit("booking", form);
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
