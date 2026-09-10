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
