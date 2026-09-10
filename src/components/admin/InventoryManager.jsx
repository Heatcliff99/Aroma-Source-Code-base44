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
