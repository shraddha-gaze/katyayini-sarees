// Banarasi saree knowledge, shown on /guide and used by the demo chatbot.
// The live chatbot uses the same facts in supabase/functions/chat/knowledge.ts.

export interface FabricGuide {
  slug: string;
  name: string;
  what: string;
  feel: string;
  ease: 1 | 2 | 3 | 4 | 5; // 5 = easiest to drape and carry
  priceMin: number;
  priceMax: number;
  bestFor: string;
}

export const fabrics: FabricGuide[] = [
  { slug: "katan-silk", name: "Katan (pure silk)", what: "Pure mulberry silk, twisted threads; the classic Banarasi", feel: "Heavy, rich, structured drape; needs some practice", ease: 2, priceMin: 8000, priceMax: 150000, bestFor: "Brides, wedding rituals, heirlooms" },
  { slug: "organza", name: "Organza / Kora", what: "Silk and zari on a sheer, crisp base", feel: "Light and see-through, a little stiff; easy to carry", ease: 4, priceMin: 5000, priceMax: 40000, bestFor: "Sangeet, receptions, summer weddings" },
  { slug: "georgette", name: "Georgette", what: "Light crinkled georgette base with Banarasi motifs", feel: "Very light and flowy, the easiest drape", ease: 5, priceMin: 3000, priceMax: 25000, bestFor: "Parties, first-time saree wearers" },
  { slug: "chiffon", name: "Chiffon", what: "Sheer, soft and lightweight base", feel: "Very easy, fluid fall", ease: 5, priceMin: 3000, priceMax: 20000, bestFor: "Day functions, evening parties" },
  { slug: "shattir", name: "Shattir", what: "Plain silk weave with modern, minimal designs", feel: "Medium weight, comfortable", ease: 4, priceMin: 3000, priceMax: 15000, bestFor: "Office events, festive days, gifting" },
  { slug: "tissue", name: "Tissue", what: "Zari woven into the weft for a metallic sheen", feel: "Light but crisp and shiny", ease: 3, priceMin: 6000, priceMax: 50000, bestFor: "Festivals, Durga Puja, receptions" },
  { slug: "silk-cotton", name: "Silk cotton / Cotton Banarasi", what: "Cotton or cotton-silk with zari motifs", feel: "Breathable, everyday-friendly", ease: 5, priceMin: 1500, priceMax: 8000, bestFor: "Daily and office wear, hot weather, tight budgets" },
  { slug: "semi-silk", name: "Semi-silk / Art silk", what: "Polyester or viscose blends, usually powerloom", feel: "Light, low-maintenance", ease: 5, priceMin: 800, priceMax: 4000, bestFor: "Budget buys, one-time events" },
];

export const designs = [
  { name: "Jangla", text: "Dense, all-over vines and flowers, a jungle of zari. Grand and bridal." },
  { name: "Tanchoi", text: "Several coloured weft threads build a self-patterned, brocade-like texture, often with little or no zari." },
  { name: "Butidar", text: "Small scattered motifs (butis) in gold or silver zari across the body." },
  { name: "Cutwork", text: "Motifs woven with loose threads that are cut away on the back. Lighter and more affordable." },
  { name: "Jamdani", text: "Motifs woven straight onto a sheer base, often cotton-silk." },
  { name: "Meenakari", text: "Coloured threads added into zari motifs, like enamel work on jewellery." },
  { name: "Kadhua vs Phekwa", text: "Kadhua: every motif woven separately by hand, leaving a neat reverse (premium). Phekwa: the thread runs across the full width and the extra is cut off (faster, cheaper)." },
];

export const qualitySignals = [
  { name: "Handloom vs powerloom", text: "Handloom has tiny irregularities and takes days to weeks per saree. Powerloom is perfectly uniform and far cheaper." },
  { name: "Real zari", text: "Silver thread plated with gold. The most precious, and the most expensive." },
  { name: "Tested zari", text: "Copper thread electroplated with silver or gold. The most common good-quality zari." },
  { name: "Imitation zari", text: "Metallic plastic thread. Bright and light, used in budget sarees." },
  { name: "GI tag and Silk Mark", text: "'Banaras Brocades and Sarees' has had a Geographical Indication tag since 2009. Silk Mark certifies pure silk." },
  { name: "Check the reverse", text: "A Kadhua handloom saree is neat on the back; Phekwa or powerloom shows floats or cut threads." },
];

export const care = [
  "Dry clean silk and zari sarees; never machine wash.",
  "Store wrapped in soft muslin, not plastic.",
  "Refold every few months so the zari does not crack along the creases.",
  "Keep away from perfume, deodorant and damp cupboards.",
];

export const faqs = [
  { q: "How do I know a Banarasi saree is genuine?", a: "Look for the GI tag and Silk Mark, check the reverse for neat Kadhua weaving, and expect slight handloom irregularities. A pure Katan silk saree with tested zari rarely costs under ₹8,000." },
  { q: "Which Banarasi saree is easiest to wear?", a: "Georgette, chiffon and silk-cotton Banarasis are the lightest and easiest to drape. Organza is light too, but crisper." },
  { q: "Which Banarasi is best for a bride?", a: "Pure Katan silk with real or tested zari, often in a Jangla or Kadhua butidar design, in red, maroon or deep pink." },
  { q: "Does the saree come with a blouse piece?", a: "Yes, every Katyayini saree includes an unstitched blouse piece unless the listing says otherwise." },
];
