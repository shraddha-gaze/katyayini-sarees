import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Send, X } from "lucide-react";
import { ProductImage } from "@/components/ProductCard";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { useCatalogue } from "@/context/CatalogueContext";
import { askSahayak, type ChatMessage } from "@/lib/api";
import { inr, whatsappLink } from "@/lib/format";

interface Turn extends ChatMessage {
  productIds?: string[];
}

const GREETING: Turn = {
  role: "assistant",
  content: "Namaste! I'm your Saree Sahayak. Tell me the occasion, your budget and how comfortable you are with heavy sarees, and I'll suggest the right Banarasi for you.",
};

const QUICK = ["Saree for my wedding, budget ₹25,000", "Something light for a party under ₹8,000", "How do I spot a real Banarasi?", "Everyday office saree under ₹5,000"];

export default function ChatWidget() {
  const { products } = useCatalogue();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, busy]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next: Turn[] = [...turns, { role: "user", content }];
    setTurns(next);
    setInput("");
    setBusy(true);
    try {
      // The greeting is UI only; the conversation sent to the assistant starts with the user.
      const res = await askSahayak(next.slice(1).map(({ role, content }) => ({ role, content })));
      setTurns((t) => [...t, { role: "assistant", content: res.reply, productIds: res.productIds }]);
    } catch {
      setTurns((t) => [...t, { role: "assistant", content: "Sorry, I couldn't reply just now. Please try again, or message us on WhatsApp." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-sindoor px-5 py-3.5 text-sm text-cream-light shadow-lg transition hover:bg-sindoor-dark"
          aria-label="Open Saree Sahayak chat"
        >
          <MessageCircle className="h-5 w-5" /> <span className="hidden sm:inline">Saree Sahayak</span>
        </button>
      )}

      {open && (
        <section
          className="fixed inset-x-0 bottom-0 z-50 flex h-[85vh] flex-col border border-ink/10 bg-cream shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[600px] sm:w-[380px]"
          aria-label="Saree Sahayak chat"
        >
          <header className="flex items-center justify-between bg-sindoor px-4 py-3 text-cream-light">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="" className="h-9 w-9" />
              <div>
                <p className="font-serif text-xl leading-none">Saree Sahayak</p>
                <p className="text-xs text-cream/75">Helps you choose by budget, quality and comfort</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat"><X className="h-5 w-5" /></button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
            {turns.map((t, i) => (
              <div key={i} className={t.role === "user" ? "flex justify-end" : ""}>
                <div className={`max-w-[85%] whitespace-pre-line px-3.5 py-2.5 text-sm ${t.role === "user" ? "bg-saffron text-white" : "bg-cream-light text-ink shadow-sm"}`}>
                  {t.content}
                </div>
                {t.productIds && t.productIds.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {t.productIds.map((id) => {
                      const p = products.find((x) => x.id === id);
                      if (!p) return null;
                      return (
                        <Link key={id} to={`/saree/${p.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-3 border border-ink/10 bg-cream-light p-2 hover:border-sindoor">
                          <span className="h-16 w-12 shrink-0 overflow-hidden"><ProductImage product={p} /></span>
                          <span className="text-sm">
                            <span className="block font-serif text-lg leading-tight">{p.name}</span>
                            <span className="text-ink-soft">{p.colour} · {inr(p.price)}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            {busy && <div className="w-16 bg-cream-light px-3 py-2.5 text-sm text-ink-soft shadow-sm">…</div>}
            {turns.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {QUICK.map((q) => (
                  <button key={q} onClick={() => send(q)} className="border border-sindoor/40 px-3 py-1.5 text-left text-xs text-sindoor hover:bg-sindoor hover:text-cream-light">
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-ink/10 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
              placeholder="Ask about sarees, budget, care…"
              className="input flex-1 py-2"
              aria-label="Your message"
            />
            <button type="submit" disabled={busy || !input.trim()} className="btn-maroon px-3" aria-label="Send"><Send className="h-4 w-4" /></button>
          </form>
          <a href={whatsappLink("Namaste! I'd like to talk to someone about a saree.")} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 pb-3 text-xs text-[#128C7E] hover:underline">
            <WhatsAppIcon className="h-4 w-4" /> Prefer a person? Chat with us on WhatsApp
          </a>
        </section>
      )}
    </>
  );
}
