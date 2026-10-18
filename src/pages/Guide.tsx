import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { care, designs, fabrics, faqs, qualitySignals } from "@/data/guide";
import { inr } from "@/lib/format";

const shopSlugs = new Set(["katan-silk", "organza", "georgette", "shattir", "tissue", "silk-cotton"]);

export default function Guide() {
  return (
    <>
      <Seo
        title="Banarasi Saree Guide: Types, Zari, Prices and How to Choose"
        description="Learn the types of Banarasi sarees (Katan, organza, georgette, tissue, Shattir), real vs tested zari, handloom vs powerloom, typical prices and how to pick the right one."
        path="/guide"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />

      <section className="dotted-bg py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <p className="eyebrow">Saree Sahayak</p>
          <h1 className="mt-4 text-5xl sm:text-6xl">The Banarasi saree guide</h1>
          <div className="rule" />
          <p className="mt-6 text-lg text-ink-soft">
            Which Banarasi suits your occasion, budget and comfort? Here's what sets each type apart, and how to tell real quality from
            imitation.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-14 sm:px-6">
        <section>
          <h2 className="text-4xl">Types by fabric</h2>
          <p className="mt-2 text-sm text-ink-soft">Prices are typical market ranges and vary with zari, weave and design.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {fabrics.map((f) => (
              <article key={f.slug} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-3xl">{f.name}</h3>
                  <EaseMeter ease={f.ease} />
                </div>
                <p className="mt-3">{f.what}.</p>
                <p className="mt-2 text-sm text-ink-soft">Feel: {f.feel}.</p>
                <p className="mt-2 text-sm text-ink-soft">Best for: {f.bestFor}.</p>
                <p className="mt-4 text-sm text-sindoor">
                  {inr(f.priceMin)} to {inr(f.priceMax)}
                  {f.priceMax >= 150000 && "+"}
                </p>
                {shopSlugs.has(f.slug) && (
                  <Link to={`/sarees/${f.slug}`} className="mt-4 inline-block text-sm uppercase tracking-[0.2em] text-saffron hover:text-sindoor">
                    Shop {f.name.split(" ")[0]} →
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-4xl">Designs and weaving techniques</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {designs.map((d) => (
              <div key={d.name} className="border-l-2 border-saffron pl-4">
                <dt className="font-serif text-2xl">{d.name}</dt>
                <dd className="mt-1 text-ink-soft">{d.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="text-4xl">How to judge quality</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {qualitySignals.map((d) => (
              <div key={d.name} className="border-l-2 border-sindoor pl-4">
                <dt className="font-serif text-2xl">{d.name}</dt>
                <dd className="mt-1 text-ink-soft">{d.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="card p-8">
          <h2 className="text-4xl">Caring for your Banarasi</h2>
          <ul className="mt-6 list-disc space-y-2 pl-6 text-ink-soft">
            {care.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-4xl">Frequently asked</h2>
          <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
            {faqs.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer list-none font-serif text-2xl">
                  {f.q}
                  <span className="float-right text-saffron transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function EaseMeter({ ease }: { ease: number }) {
  return (
    <div className="shrink-0 text-right">
      <p className="label text-[10px]">Ease of wear</p>
      <div className="mt-1 flex gap-1" aria-label={`Ease of wear ${ease} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`h-2 w-4 ${i <= ease ? "bg-saffron" : "bg-ink/15"}`} />
        ))}
      </div>
    </div>
  );
}
