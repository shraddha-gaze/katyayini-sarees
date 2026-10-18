import { fabrics } from "@/data/guide";
import { inr } from "@/lib/format";
import type { ChatMessage, ChatReply } from "@/lib/api";
import type { Product } from "@/lib/types";

// Rule-based stand-in for the Claude-powered Sahayak, used in demo mode (no Supabase).
// It reads occasion, budget and comfort cues from the whole conversation.

const OCCASIONS: [RegExp, string[], string][] = [
  [/\b(bride|bridal|my wedding|phera|vivah)\b/, ["Bridal", "Wedding", "Heirloom"], "your wedding"],
  [/\b(wedding|shaadi|marriage|reception)\b/, ["Wedding", "Reception", "Bridal"], "a wedding"],
  [/\b(sangeet|cocktail|engagement)\b/, ["Sangeet", "Engagement", "Cocktail", "Party"], "a sangeet or engagement"],
  [/\b(haldi|mehendi|mehndi)\b/, ["Haldi", "Mehendi"], "haldi or mehendi"],
  [/\b(party|parties|dinner)\b/, ["Party", "Cocktail", "Engagement"], "a party"],
  [/\b(office|work|daily|everyday|college)\b/, ["Office", "Daily"], "everyday wear"],
  [/\b(festive|festival|diwali|puja|pooja|navratri|durga|karva)\b/, ["Festive", "Puja"], "a festival"],
  [/\b(gift|gifting|present)\b/, ["Gifting", "Festive"], "gifting"],
];

function parseBudget(text: string): number | null {
  const lakh = text.match(/(\d+(?:\.\d+)?)\s*(lakh|lac)/);
  if (lakh) return parseFloat(lakh[1]) * 100000;
  const k = text.match(/(\d+(?:\.\d+)?)\s*k\b/);
  if (k) return parseFloat(k[1]) * 1000;
  const nums = [...text.replace(/,/g, "").matchAll(/(?:₹|rs\.?|inr)?\s*(\d{3,7})/g)].map((m) => parseInt(m[1], 10));
  return nums.length ? Math.max(...nums) : null;
}

export function demoSahayak(messages: ChatMessage[], products: Product[]): ChatReply {
  const said = messages.filter((m) => m.role === "user").map((m) => m.content.toLowerCase()).join(" \n ");
  const last = messages[messages.length - 1]?.content.toLowerCase() ?? "";

  // Quick knowledge answers
  if (/\b(real|fake|genuine|original|identify|pure)\b/.test(last)) {
    return {
      reply:
        "Good question ji! Look for the GI tag and Silk Mark, then turn the saree over: handwoven Kadhua work is neat on the back, while powerloom shows loose floats. Tested zari (copper with silver or gold plating) is the common good-quality zari; real zari is silver with gold plating. A pure Katan silk with tested zari rarely costs under ₹8,000.",
      productIds: [],
    };
  }
  if (/\b(wash|clean|care|store|storage)\b/.test(last)) {
    return {
      reply: "Dry clean silk and zari sarees. Store them in soft muslin (never plastic), and refold every few months so the zari doesn't crack along the creases. Keep perfume away!",
      productIds: [],
    };
  }
  if (/\b(ship|deliver|return|cod|cash)\b/.test(last)) {
    return {
      reply: "We ship free across India: dispatch in 1 to 2 days, delivery in 4 to 7. Unused sarees can be returned within 7 days. Cash on delivery is available up to ₹25,000, and UPI on delivery for any amount.",
      productIds: [],
    };
  }

  const occasion = OCCASIONS.find(([re]) => re.test(said));
  const budget = parseBudget(said);
  const wantsLight = /\b(light|easy|comfortable|first time|first-time|beginner|summer|hot|not heavy)\b/.test(said);
  const wantsGrand = /\b(heavy|grand|rich|heirloom|traditional)\b/.test(said);

  if (!occasion) {
    return {
      reply: "Namaste! I'm your Saree Sahayak. What's the occasion: a wedding (yours or a guest's), a festival, a party, or everyday wear? And roughly what budget do you have in mind?",
      productIds: [],
    };
  }
  if (!budget) {
    return {
      reply: `Lovely, a saree for ${occasion[2]}. What budget are you comfortable with? For example under ₹5,000, ₹5,000 to ₹15,000, or above ₹20,000.`,
      productIds: [],
    };
  }

  const inStock = products.filter((p) => p.stock > 0);
  const lightCats = new Set(["georgette", "organza", "silk-cotton", "shattir"]);
  const score = (p: Product) =>
    (p.occasions.some((o) => occasion[1].includes(o)) ? 3 : 0) +
    (p.price <= budget ? 3 : p.price <= budget * 1.15 ? 1 : -5) +
    (wantsLight && lightCats.has(p.category) ? 2 : 0) +
    (wantsGrand && p.category === "katan-silk" ? 2 : 0) +
    (wantsLight && p.category === "katan-silk" ? -2 : 0);
  const picks = inStock
    .map((p) => ({ p, s: score(p) }))
    .filter(({ s }) => s >= 3)
    .sort((a, b) => b.s - a.s || b.p.price - a.p.price)
    .slice(0, 3)
    .map(({ p }) => p);

  if (picks.length === 0) {
    const cheapest = [...inStock].sort((a, b) => a.price - b.price)[0];
    return {
      reply: `I couldn't find a ${occasion[2]} saree within ${inr(budget)} in our current collection. Our most affordable piece is ${cheapest?.name} at ${inr(cheapest?.price ?? 0)}. Message our team on WhatsApp and we can source one from the weavers for you.`,
      productIds: cheapest ? [cheapest.id] : [],
    };
  }

  const top = fabrics.find((f) => f.slug === picks[0].category);
  const why = top ? ` ${top.name} is ${top.feel.toLowerCase()}, a good fit for ${top.bestFor.toLowerCase()}.` : "";
  return {
    reply: `For ${occasion[2]} within ${inr(budget)}${wantsLight ? ", and something easy to carry" : ""}, here's what I'd suggest.${why} Tap a saree to see the details, or tell me a colour you love and I'll narrow it down.`,
    productIds: picks.map((p) => p.id),
  };
}
