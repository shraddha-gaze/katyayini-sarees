import type { Category, Product } from "@/lib/types";

// Sample catalogue. Used for prerendering and as the demo-mode fallback when Supabase
// is not configured. The same rows are seeded by supabase/migrations/0002_seed.sql.

export const categories: Category[] = [
  {
    slug: "katan-silk",
    name: "Katan Silk",
    tagline: "Pure silk, timeless zari",
    description:
      "Katan is the classic Banarasi: pure mulberry silk threads twisted together and woven with gold and silver zari. Rich, structured and heirloom-worthy, it is the first choice for brides and wedding rituals.",
    seoTitle: "Pure Katan Silk Banarasi Sarees | Handwoven in Varanasi",
    seoDescription:
      "Shop pure Katan silk Banarasi sarees handwoven in Varanasi with real and tested zari. Bridal, wedding and heirloom sarees with Silk Mark assurance.",
    priceHint: "₹8,000 – ₹1,50,000+",
    featured: true,
    art: { base: "#8B2A1F", accent: "#E3C77E", border: "#C9A24A", motif: "paisley", backdrop: "#F3E3CF" },
  },
  {
    slug: "tissue",
    name: "Tissue",
    tagline: "Shimmer of metallic threads",
    description:
      "Tissue Banarasi sarees carry zari in the weft itself, giving the whole drape a soft metallic glow. Light yet crisp, they shine at festive evenings, Durga Puja and receptions.",
    seoTitle: "Tissue Banarasi Sarees | Gold and Silver Zari Tissue Silk",
    seoDescription:
      "Discover tissue Banarasi sarees with gold and silver zari woven through the weft. Lightweight festive and reception sarees from Varanasi.",
    priceHint: "₹6,000 – ₹50,000",
    featured: true,
    art: { base: "#6B3F26", accent: "#E3C77E", border: "#B9874A", motif: "jaal", backdrop: "#E07A1F" },
  },
  {
    slug: "organza",
    name: "Organza",
    tagline: "Light as the morning ghat",
    description:
      "Organza (Kora) Banarasi sarees pair a sheer, crisp silk base with zari motifs. They are airy, easy to carry and perfect for sangeet, receptions and summer weddings.",
    seoTitle: "Organza Banarasi Sarees | Kora Silk with Zari",
    seoDescription:
      "Shop sheer organza (Kora) Banarasi sarees with zari butis and borders. Lightweight sarees for sangeet, receptions and summer weddings.",
    priceHint: "₹5,000 – ₹40,000",
    featured: true,
    art: { base: "#E07A1F", accent: "#F6D58A", border: "#C9A24A", motif: "buti", backdrop: "#6B3F26" },
  },
  {
    slug: "georgette",
    name: "Georgette",
    tagline: "Fluid drape, everyday grace",
    description:
      "Banarasi georgette sarees are light and flowing, with woven zari motifs on a soft crinkled base. The easiest Banarasi to drape, ideal for parties and first-time saree wearers.",
    seoTitle: "Banarasi Georgette Sarees | Lightweight Party Wear",
    seoDescription:
      "Lightweight Banarasi georgette sarees with zari weaving. Easy-to-drape party and festive sarees, perfect for first-time saree wearers.",
    priceHint: "₹3,000 – ₹25,000",
    featured: true,
    art: { base: "#2F4A6B", accent: "#E3C77E", border: "#C9A24A", motif: "buti", backdrop: "#F3E3CF" },
  },
  {
    slug: "shattir",
    name: "Shattir",
    tagline: "Quiet silk, modern lines",
    description:
      "Shattir is a plain-weave silk with minimal, modern Banarasi designs. Comfortable and understated, it suits office events, festive days and gifting.",
    seoTitle: "Shattir Banarasi Silk Sarees | Minimal Modern Designs",
    seoDescription:
      "Shop Shattir Banarasi silk sarees with minimal modern designs. Comfortable, understated sarees for office events, festivals and gifting.",
    priceHint: "₹3,000 – ₹15,000",
    featured: false,
    art: { base: "#5A5A66", accent: "#D9C08A", border: "#B39A5C", motif: "stripe", backdrop: "#F3E3CF" },
  },
  {
    slug: "silk-cotton",
    name: "Silk Cotton",
    tagline: "Breathable, everyday Banaras",
    description:
      "Silk-cotton Banarasi sarees blend breathable cotton with silk and zari motifs. Easy on the budget and the body, they are made for daily wear and warm weather.",
    seoTitle: "Silk Cotton Banarasi Sarees | Breathable Daily Wear",
    seoDescription:
      "Breathable silk-cotton Banarasi sarees with zari motifs. Affordable, comfortable sarees for daily and office wear in warm weather.",
    priceHint: "₹1,500 – ₹8,000",
    featured: false,
    art: { base: "#D9B23A", accent: "#8B2A1F", border: "#8B2A1F", motif: "buti", backdrop: "#F3E3CF" },
  },
];

type ProductInput = Omit<Product, "images" | "featured" | "createdAt"> & Partial<Pick<Product, "featured" | "createdAt">>;

const p = (x: ProductInput): Product => ({
  images: [],
  featured: false,
  createdAt: "2026-09-01T00:00:00Z",
  ...x,
});

export const products: Product[] = [
  p({
    id: "kesariya-buti", slug: "kesariya-buti-katan-silk-saffron", name: "Kesariya Buti", category: "katan-silk", colour: "Saffron",
    price: 18500, mrp: 21000, stock: 6, fabric: "Pure Katan silk", zari: "Tested zari", weave: "Handloom, Kadhua", occasions: ["Wedding", "Festive"],
    weightGrams: 720, hasBlousePiece: true, badge: "Bestseller", featured: true,
    description: "A saffron Katan silk saree scattered with hand-woven zari butis and a deep floral border. Each buti is woven separately on the handloom (Kadhua), leaving a clean reverse.",
    care: "Dry clean only. Store wrapped in muslin and refold every few months.",
    art: { base: "#E07A1F", accent: "#F2C766", border: "#C9A24A", motif: "buti", backdrop: "#6B3F26" },
  }),
  p({
    id: "sindoori-kalga", slug: "sindoori-kalga-katan-silk-brick-red", name: "Sindoori Kalga", category: "katan-silk", colour: "Brick Red",
    price: 24900, mrp: 27500, stock: 4, fabric: "Pure Katan silk", zari: "Tested zari", weave: "Handloom, Kadhua", occasions: ["Bridal", "Wedding"],
    weightGrams: 780, hasBlousePiece: true, badge: "New", featured: true, createdAt: "2026-10-10T00:00:00Z",
    description: "Sindoor-red Katan silk with small kalga (paisley) motifs and a broad paisley pallu in gold zari. A bridal classic for pheras and family heirlooms.",
    care: "Dry clean only. Keep away from perfume and moisture.",
    art: { base: "#7A1F1B", accent: "#E3C77E", border: "#C9A24A", motif: "paisley", backdrop: "#F3E3CF" },
  }),
  p({
    id: "mitti-jaal", slug: "mitti-jaal-tissue-earth-brown", name: "Mitti Jaal", category: "tissue", colour: "Earth Brown",
    price: 16800, mrp: 18500, stock: 5, fabric: "Silk tissue", zari: "Tested zari (copper tone)", weave: "Handloom, Jaal", occasions: ["Festive", "Reception"],
    weightGrams: 560, hasBlousePiece: true, badge: null, featured: true, createdAt: "2026-10-05T00:00:00Z",
    description: "An earth-brown tissue saree covered in a floral jaal (net) of copper-toned zari, finished with a shimmering tissue border.",
    care: "Dry clean only. Fold with the zari side in.",
    art: { base: "#4A2C1E", accent: "#D8A66A", border: "#B9874A", motif: "jaal", backdrop: "#E07A1F" },
  }),
  p({
    id: "ghat-sandhya", slug: "ghat-sandhya-organza-saffron", name: "Ghat Sandhya", category: "organza", colour: "Saffron",
    price: 12400, mrp: 13800, stock: 8, fabric: "Organza (Kora) silk", zari: "Tested zari", weave: "Handloom, Cutwork", occasions: ["Sangeet", "Reception"],
    weightGrams: 420, hasBlousePiece: true, badge: null, featured: true, createdAt: "2026-10-01T00:00:00Z",
    description: "Sheer saffron organza that glows like the ghats at dusk, woven with zari butis and a floral border.",
    care: "Dry clean only. Iron on low heat with a cloth in between.",
    art: { base: "#E2762A", accent: "#F6D58A", border: "#C9A24A", motif: "buti", backdrop: "#5A3420" },
  }),
  p({
    id: "panna-bagh", slug: "panna-bagh-katan-silk-emerald", name: "Panna Bagh", category: "katan-silk", colour: "Emerald",
    price: 42000, mrp: 46000, stock: 2, fabric: "Pure Katan silk", zari: "Real zari (silver, gold-plated)", weave: "Handloom, Jangla", occasions: ["Bridal", "Heirloom"],
    weightGrams: 900, hasBlousePiece: true, badge: null,
    description: "An emerald Katan silk woven all over with a jangla of vines and blossoms in real zari. Takes weeks on the loom.",
    care: "Dry clean only. Store flat in muslin; avoid hangers.",
    art: { base: "#1F5A45", accent: "#E3C77E", border: "#C9A24A", motif: "jaal", backdrop: "#F3E3CF" },
  }),
  p({
    id: "ganga-aarti", slug: "ganga-aarti-tissue-gold", name: "Ganga Aarti", category: "tissue", colour: "Gold",
    price: 14500, mrp: 16000, stock: 7, fabric: "Silk tissue", zari: "Tested zari", weave: "Handloom", occasions: ["Festive", "Puja"],
    weightGrams: 520, hasBlousePiece: true, badge: "Bestseller",
    description: "A golden tissue saree with a maroon border, made for evening aartis, Diwali and Durga Puja.",
    care: "Dry clean only.",
    art: { base: "#C9A24A", accent: "#FFF1C2", border: "#8B2A1F", motif: "stripe", backdrop: "#F3E3CF" },
  }),
  p({
    id: "chandni-ghat", slug: "chandni-ghat-tissue-silver", name: "Chandni Ghat", category: "tissue", colour: "Silver",
    price: 13200, mrp: 14500, stock: 3, fabric: "Silk tissue", zari: "Tested silver zari", weave: "Handloom", occasions: ["Reception", "Cocktail"],
    weightGrams: 500, hasBlousePiece: true, badge: null,
    description: "Moonlit silver tissue with fine silver zari butis, a quieter shimmer for evening receptions.",
    care: "Dry clean only.",
    art: { base: "#9EA3AE", accent: "#F4F4F4", border: "#6F7480", motif: "buti", backdrop: "#2F3A4A" },
  }),
  p({
    id: "haldi-phool", slug: "haldi-phool-organza-yellow", name: "Haldi Phool", category: "organza", colour: "Turmeric Yellow",
    price: 8900, mrp: 9900, stock: 10, fabric: "Organza (Kora) silk", zari: "Tested zari", weave: "Powerloom, Cutwork", occasions: ["Haldi", "Mehendi"],
    weightGrams: 380, hasBlousePiece: true, badge: "New", createdAt: "2026-10-12T00:00:00Z",
    description: "Turmeric-yellow organza with marigold butis, made for haldi and mehendi mornings.",
    care: "Dry clean only.",
    art: { base: "#E7B52C", accent: "#FFF0B3", border: "#C47A12", motif: "buti", backdrop: "#8B2A1F" },
  }),
  p({
    id: "neel-kamal", slug: "neel-kamal-georgette-indigo", name: "Neel Kamal", category: "georgette", colour: "Indigo",
    price: 7600, mrp: 8500, stock: 12, fabric: "Pure georgette", zari: "Tested zari", weave: "Handloom", occasions: ["Party", "Festive"],
    weightGrams: 360, hasBlousePiece: true, badge: null,
    description: "Deep indigo georgette with lotus butis in zari. Light and fluid, an easy first Banarasi.",
    care: "Dry clean recommended.",
    art: { base: "#2F4A6B", accent: "#E3C77E", border: "#C9A24A", motif: "buti", backdrop: "#F3E3CF" },
  }),
  p({
    id: "gulabi-shaam", slug: "gulabi-shaam-georgette-rose", name: "Gulabi Shaam", category: "georgette", colour: "Rose Pink",
    price: 6800, mrp: 7500, stock: 9, fabric: "Pure georgette", zari: "Tested zari", weave: "Handloom", occasions: ["Party", "Engagement"],
    weightGrams: 340, hasBlousePiece: true, badge: null,
    description: "Soft rose georgette with a delicate zari jaal and slim border for evening parties.",
    care: "Dry clean recommended.",
    art: { base: "#D9768A", accent: "#F7E3B0", border: "#B9874A", motif: "jaal", backdrop: "#F3E3CF" },
  }),
  p({
    id: "shyam-megh", slug: "shyam-megh-shattir-slate", name: "Shyam Megh", category: "shattir", colour: "Slate Grey",
    price: 5400, mrp: 6000, stock: 11, fabric: "Shattir silk", zari: "Tested zari", weave: "Powerloom", occasions: ["Office", "Gifting"],
    weightGrams: 450, hasBlousePiece: true, badge: null,
    description: "Monsoon-grey Shattir silk with fine zari stripes, understated for office events and gifting.",
    care: "Dry clean recommended.",
    art: { base: "#5A5A66", accent: "#D9C08A", border: "#B39A5C", motif: "stripe", backdrop: "#F3E3CF" },
  }),
  p({
    id: "amrit-kesar", slug: "amrit-kesar-silk-cotton-mustard", name: "Amrit Kesar", category: "silk-cotton", colour: "Mustard",
    price: 3200, mrp: 3600, stock: 15, fabric: "Silk-cotton", zari: "Imitation zari", weave: "Powerloom", occasions: ["Daily", "Office"],
    weightGrams: 400, hasBlousePiece: true, badge: null,
    description: "Breathable mustard silk-cotton with maroon butis. A comfortable everyday Banarasi.",
    care: "Gentle hand wash in cold water or dry clean.",
    art: { base: "#D9B23A", accent: "#8B2A1F", border: "#8B2A1F", motif: "buti", backdrop: "#F3E3CF" },
  }),
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
