const STORAGE_PREFIX = "aroma-flowers:";

const seedInventory = [
  { id: "rose", name: "Garden Rose", category: "primary_bloom", price: 120, colours: ["Blush Pink", "Red", "White"], shop_location: "Manish Nagar", stock_status: "in_stock", tier_min: 100, active: true },
  { id: "tulip", name: "Seasonal Tulip", category: "primary_bloom", price: 180, colours: ["Yellow", "Pink", "White"], shop_location: "Khamla", stock_status: "in_stock", tier_min: 150, active: true },
  { id: "baby-breath", name: "Baby's Breath", category: "filler", price: 90, colours: ["White"], shop_location: "Manish Nagar", stock_status: "in_stock", tier_min: 100, active: true },
  { id: "eucalyptus", name: "Eucalyptus", category: "foliage", price: 80, colours: ["Sage"], shop_location: "Khamla", stock_status: "in_stock", tier_min: 100, active: true },
  { id: "kraft-wrap", name: "Kraft Wrap", category: "wrapping", price: 50, colours: [], shop_location: "Manish Nagar", stock_status: "in_stock", tier_min: 100, active: true },
  { id: "satin-ribbon", name: "Satin Ribbon", category: "ribbon", price: 40, colours: ["Blush Pink", "Red", "Gold"], shop_location: "Khamla", stock_status: "in_stock", tier_min: 100, active: true },
  { id: "message-card", name: "Message Card", category: "addon", price: 30, colours: [], shop_location: "Manish Nagar", stock_status: "in_stock", tier_min: 100, active: true },
];

function read(entity) {
  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${entity}`);
    return saved ? JSON.parse(saved) : entity === "InventoryItem" ? seedInventory : [];
  } catch {
    return entity === "InventoryItem" ? seedInventory : [];
  }
}

function write(entity, records) {
  localStorage.setItem(`${STORAGE_PREFIX}${entity}`, JSON.stringify(records));
  return records;
}

const entityApi = (entity) => ({
  async list(_sort, limit = 100) {
    return read(entity).slice(0, limit);
  },
  async create(payload) {
    const record = { ...payload, id: crypto.randomUUID(), created_date: new Date().toISOString() };
    write(entity, [record, ...read(entity)]);
    return record;
  },
  async update(id, patch) {
    const records = read(entity).map((record) => record.id === id ? { ...record, ...patch } : record);
    write(entity, records);
    return records.find((record) => record.id === id);
  },
});

export const base44 = {
  entities: new Proxy({}, { get: (_, entity) => entityApi(entity) }),
  auth: {
    async me() {
      return { id: "local-owner", role: "admin", full_name: "Shop owner", email: "owner@aromaflowers.local" };
    },
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        return { file_url: URL.createObjectURL(file) };
      },
    },
  },
  functions: {
    async invoke(_name, { type, data }) {
      const entity = { booking: "Booking", enquiry: "Enquiry", custom_bouquet: "CustomBouquet", feedback: "Feedback" }[type];
      if (!entity) throw new Error("Unsupported submission type");
      return entityApi(entity).create(data);
    },
  },
};