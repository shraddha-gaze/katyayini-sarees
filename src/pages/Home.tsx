import { Link } from "react-router-dom";
import GhatScene from "@/components/GhatScene";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import { useCatalogue } from "@/context/CatalogueContext";
import { SITE_URL } from "@/lib/format";
import { Sparkles, Truck, ShieldCheck, Scissors } from "lucide-react";

export default function Home() {
  const { products, categories } = useCatalogue();
  const featuredCats = categories.filter((c) => c.featured).slice(0, 4);
  const fresh = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const bestsellers = products.filter((p) => p.badge === "Bestseller" || p.featured).slice(0, 4);

  return (
    <>
      <Seo
        title="Katyayini | Handwoven Banarasi Silk Sarees from Varanasi"
        description="Shop authentic handwoven Banarasi sarees from Varanasi: pure Katan silk, tissue, organza and georgette with real and tested zari. Free shipping across India."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Katyayini Banaras",
          url: SITE_URL,
          logo: `${SITE_URL}/logo.svg`,
        }}
      />

      {/* Hero */}
      <section className="relative h-[78vh] min-h-[520px] overflow-hidden">
        <GhatScene className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6">
          <p className="eyebrow text-zari-light">Kashi · Est. on the ghats</p>
          <h1 className="mt-5 max-w-2xl text-5xl leading-[1.05] text-cream-light sm:text-7xl lg:text-8xl">
            Where the Ganga sings in silk
          </h1>
          <p className="mt-6 max-w-md text-lg text-cream/90">Handwoven Banarasi sarees in saffron, sindoor and earth.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/sarees" className="btn-primary px-8 py-4">Explore the catalogue</Link>
            <Link to="/guide" className="btn border border-cream-light/70 px-8 py-4 text-cream-light hover:bg-cream-light hover:text-ink">
              Which saree suits me?
            </Link>
          </div>
        </div>
      </section>

      {/* Four traditions */}
      <section className="dotted-bg py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="section-title">Four traditions, one city</h2>
          <div className="rule" />
          <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {featuredCats.map((c) => (
              <Link
                key={c.slug}
                to={`/sarees/${c.slug}`}
                className="arch group flex aspect-[20/13] flex-col items-center justify-center border-2 border-sindoor bg-cream-light px-3 pt-[16%] sm:aspect-[20/11] sm:px-6 sm:pt-[14%] text-center transition hover:bg-cream-dark"
              >
                <h3 className="text-2xl transition group-hover:text-sindoor sm:text-3xl xl:text-4xl">{c.name}</h3>
                <p className="mt-1 text-xs text-ink-soft sm:mt-3 sm:text-base">{c.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fresh arrivals */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow text-center">New on the loom</p>
          <h2 className="section-title mt-4">Fresh arrivals</h2>
          <div className="rule" />
          <div className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {fresh.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link to="/sarees" className="btn-outline px-10">View all sarees</Link>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="bg-cream-dark/60 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[
            { icon: Sparkles, title: "Handwoven in Varanasi", text: "Bought directly from weaver families on the looms of Kashi." },
            { icon: ShieldCheck, title: "Silk Mark & GI assured", text: "Pure silk is certified. Zari type is stated on every listing." },
            { icon: Scissors, title: "Blouse piece included", text: "Every saree comes with an unstitched blouse piece." },
            { icon: Truck, title: "Free shipping in India", text: "Insured delivery in 4 to 7 days, packed in muslin." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="text-center">
              <Icon className="mx-auto h-8 w-8 text-saffron" />
              <h3 className="mt-3 text-2xl">{title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow text-center">Loved in every city</p>
          <h2 className="section-title mt-4">Bestsellers</h2>
          <div className="rule" />
          <div className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="dotted-bg py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="eyebrow">The Banarasi story</p>
          <h2 className="mt-4 text-4xl sm:text-5xl">Woven for weeks, worn for generations</h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            A Banarasi saree can take a weaver anywhere from a few days to several weeks. Silk from Bengaluru, zari spun in Surat,
            and patterns passed down through Mughal-era design books meet on a pit loom in the lanes of Varanasi. Not sure where to
            begin? Ask our Saree Sahayak, or read the guide.
          </p>
          <Link to="/guide" className="btn-maroon mt-8">Read the saree guide</Link>
        </div>
      </section>
    </>
  );
}
