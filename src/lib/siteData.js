export const BUDGET_TIERS = [100, 150, 200, 300, 400, 500, 700, 1000, 1500, 2000, 3000, 5000];

export const PRODUCT_TYPES = [
  { key: "bouquet", name: "Hand-Tied Bouquet", label: "Customise Your Bouquet" },
  { key: "basket", name: "Flower Basket", label: "Customise Your Flower Basket" },
  { key: "varmala", name: "Varmala", label: "Customise Your Varmala" },
  { key: "floral_jewellery", name: "Floral Jewellery", label: "Customise Your Floral Jewellery" },
  { key: "event_decor", name: "Event Décor", label: "Customise Your Event Décor" },
];

export const OCCASIONS = [
  { key: "everyday", name: "Just Because", tag: "A little beauty", tier: 300, preset: ["Garden Rose", "Eucalyptus", "Kraft Wrap"] },
  { key: "birthday", name: "Birthday", tag: "Make it theirs", tier: 500, preset: ["Garden Rose", "Baby's Breath", "Satin Ribbon"] },
  { key: "anniversary", name: "Anniversary", tag: "For your person", tier: 700, preset: ["Garden Rose", "Seasonal Tulip", "Satin Ribbon"] },
  { key: "wedding", name: "Wedding", tag: "The big day", tier: 1500, preset: ["Garden Rose", "Baby's Breath", "Eucalyptus"] },
  { key: "sympathy", name: "With love", tag: "A thoughtful gesture", tier: 500, preset: ["Garden Rose", "Eucalyptus", "Kraft Wrap"] },
];

export const SHOPS = [
  { id: "manish-nagar", short: "Manish Nagar", name: "Aroma Flowers Corner — Manish Nagar", address: "Manish Nagar, Nagpur" },
  { id: "khamla", short: "Khamla", name: "Aroma Flowers Corner — Khamla", address: "Khamla, Nagpur" },
];

export const BUILDER_TABS = [
  {
    key: "primary_bloom",
    items: [
      { name: "Garden Rose", price: 120 },
      { name: "Seasonal Tulip", price: 180 },
    ],
  },
  {
    key: "filler",
    items: [{ name: "Baby's Breath", price: 90 }],
  },
  {
    key: "foliage",
    items: [{ name: "Eucalyptus", price: 80 }],
  },
  {
    key: "wrapping",
    items: [{ name: "Kraft Wrap", price: 50 }],
  },
  {
    key: "ribbon",
    items: [{ name: "Satin Ribbon", price: 40 }],
  },
  {
    key: "addon",
    items: [{ name: "Message Card", price: 30 }],
  },
];

export const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

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
