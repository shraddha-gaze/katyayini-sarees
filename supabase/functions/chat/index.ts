// Saree Sahayak: helps customers pick a Banarasi saree by occasion, budget, quality and ease of wear.
// Deploy: supabase functions deploy chat --no-verify-jwt
// Secrets: supabase secrets set ANTHROPIC_API_KEY=...   (optional: CHAT_MODEL)
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";
import { KNOWLEDGE } from "./knowledge.ts";

const MODEL = Deno.env.get("CHAT_MODEL") ?? "claude-opus-5-5";
const MAX_TURNS = 12;
const MAX_CHARS = 1000;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `You are Saree Sahayak, the shopping assistant of Katyayini, a Banarasi saree store in Varanasi.
Help customers choose a saree that fits their occasion, budget, quality expectations and how easy it is to wear.

How to help:
- If you don't yet know the occasion, budget or comfort with heavy sarees, ask for what is missing, one or two short questions at a time.
- Once you know enough, recommend a saree type and explain the trade-offs honestly (weight, ease of draping, zari type, handloom vs powerloom, price).
- Recommend specific sarees only from the catalogue below, and only ones in stock. Never invent products, prices, stock or discounts.
- If nothing in the catalogue fits the budget, say so and suggest the closest option or the WhatsApp team for custom sourcing.
- Keep replies warm and short (under 120 words). A touch of Hindi ("Namaste", "ji") is welcome. Use INR with the ₹ sign.
- Stay on sarees, styling, care, orders and store policies. For order-specific problems, refer the customer to WhatsApp support.

Reply as JSON: "reply" is your message to the customer; "productIds" lists the ids of up to 3 catalogue sarees you are recommending in this reply (empty if none).

# Saree knowledge
${KNOWLEDGE}`;

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    productIds: { type: "array", items: { type: "string" } },
  },
  required: ["reply", "productIds"],
  additionalProperties: false,
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let messages: Anthropic.MessageParam[];
  try {
    const body = await req.json();
    messages = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: { role?: string; content?: unknown }) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_TURNS)
      .map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "Send a user message" }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: products, error: dbError } = await db
    .from("products")
    .select("id, name, category_slug, colour, price, stock, fabric, zari, weave, occasions, weight_grams")
    .gt("stock", 0)
    .order("price");
  if (dbError) return json({ error: "Catalogue unavailable" }, 500);

  const catalogue = products
    .map((p) => `- id=${p.id} | ${p.name} | ${p.category_slug} | ${p.colour} | ₹${p.price} | ${p.fabric} | ${p.zari} | ${p.weave} | ${p.weight_grams} g | ${p.occasions.join(", ")}`)
    .join("\n");

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
      // Stable instructions first and cached; the live catalogue follows.
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
        { type: "text", text: `# Catalogue (in stock)\n${catalogue}` },
      ],
      messages,
    });

    if (response.stop_reason === "refusal") {
      return json({ reply: "I'm sorry, I can't help with that. For anything else about sarees, just ask!", productIds: [] });
    }

    const text = response.content.find((b) => b.type === "text");
    const parsed = JSON.parse(text && text.type === "text" ? text.text : "{}") as { reply?: string; productIds?: string[] };
    const known = new Set(products.map((p) => p.id));
    const reply = parsed.reply ?? "Sorry, I lost my thread. Could you ask that again?";
    const productIds = (parsed.productIds ?? []).filter((id) => known.has(id)).slice(0, 3);

    await db.from("chat_logs").insert({ user_message: messages[messages.length - 1].content as string, reply });
    return json({ reply, productIds });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "The Sahayak is busy. Please try again in a minute." }, 429);
    if (e instanceof Anthropic.APIError) console.error("Claude API error", e.status, e.message);
    else console.error(e);
    return json({ error: "The Sahayak is unavailable right now. Please message us on WhatsApp." }, 502);
  }
});
