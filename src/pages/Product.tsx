import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import ProductCard, { ProductImage } from "@/components/ProductCard";
import Seo from "@/components/Seo";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { useCatalogue } from "@/context/CatalogueContext";
import { useShop } from "@/context/ShopContext";
import { SITE_URL, inr, whatsappLink } from "@/lib/format";
import NotFound from "@/pages/NotFound";

export default function Product() {
  const { slug } = useParams();
  const { products, categories } = useCatalogue();
  const { addToCart, isWished, toggleWishlist } = useShop();
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  const product = products.find((p) => p.slug === slug);
  if (!product) return <NotFound />;

  const category = categories.find((c) => c.slug === product.category);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);
  const url = `${SITE_URL}/saree/${product.slug}`;
  const wished = isWished(product.id);
  const soldOut = product.stock <= 0;
  const off = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  const specs: [string, string][] = [
    ["Saree type", category?.name ?? product.category],
    ["Fabric", product.fabric],
    ["Zari", product.zari],
    ["Weave", product.weave],
    ["Colour", product.colour],
    ["Occasion", product.occasions.join(", ")],
    ["Weight", `${product.weightGrams} g (approx.)`],
    ["Length", "5.5 m saree + 0.8 m blouse piece"],
    ["Blouse piece", product.hasBlousePiece ? "Included, unstitched" : "Not included"],
  ];

  return (
    <>
      <Seo
        title={`${product.name}: ${product.colour} ${category?.name ?? ""} Banarasi Saree`}
        description={`${product.description.slice(0, 150)} ${inr(product.price)}. Handwoven in Varanasi.`}
        path={`/saree/${product.slug}`}
        image={product.images[0]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${product.name} ${product.colour} Banarasi Saree`,
            description: product.description,
            sku: product.id,
            image: product.images.length ? product.images : [`${SITE_URL}/logo.svg`],
            brand: { "@type": "Brand", name: "Katyayini" },
            material: product.fabric,
            color: product.colour,
            category: `Banarasi Sarees > ${category?.name ?? product.category}`,
            offers: {
              "@type": "Offer",
              url,
              priceCurrency: "INR",
              price: product.price,
              availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: category?.name ?? "Sarees", item: `${SITE_URL}/sarees/${product.category}` },
              { "@type": "ListItem", position: 3, name: product.name, item: url },
            ],
          },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <nav className="label mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-sindoor">Home</Link> /{" "}
          <Link to={`/sarees/${product.category}`} className="hover:text-sindoor">{category?.name}</Link> / {product.name}
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="arch mx-auto aspect-[4/5] max-w-lg overflow-hidden border-8 border-cream-dark bg-cream-dark">
              {product.images.length > 0 ? (
                <img src={product.images[imageIndex]} alt={`${product.name} ${product.colour} Banarasi saree`} className="h-full w-full object-cover" />
              ) : (
                <ProductImage product={product} />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex justify-center gap-3">
                {product.images.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setImageIndex(i)}
                    className={`h-20 w-16 overflow-hidden border-2 ${i === imageIndex ? "border-sindoor" : "border-transparent"}`}
                    aria-label={`Show image ${i + 1}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="label">{category?.name} · {product.colour}</p>
            <h1 className="mt-3 text-5xl sm:text-6xl">{product.name}</h1>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl text-sindoor">{inr(product.price)}</span>
              {off > 0 && (
                <>
                  <span className="text-ink-soft line-through">{inr(product.mrp)}</span>
                  <span className="text-sm font-medium text-saffron">{off}% off</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-ink-soft">Inclusive of all taxes. Free shipping in India.</p>

            <p className="mt-6 leading-relaxed text-ink-soft">{product.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-ink/20">
                <button className="p-3" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center" aria-live="polite">{qty}</span>
                <button className="p-3" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}><Plus className="h-4 w-4" /></button>
              </div>
              <button className="btn-primary flex-1 py-4" disabled={soldOut} onClick={() => addToCart(product.id, qty)}>
                {soldOut ? "Sold out" : "Add to bag"}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="border border-sindoor p-3.5"
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wished}
              >
                <Heart className={`h-5 w-5 ${wished ? "fill-sindoor text-sindoor" : "text-sindoor"}`} />
              </button>
            </div>
            {!soldOut && product.stock <= 3 && <p className="mt-3 text-sm text-sindoor">Only {product.stock} left on the shelf</p>}

            <a
              href={whatsappLink(`Namaste! I'm interested in ${product.name} (${product.colour}, ${inr(product.price)}). ${url}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-4 w-full border border-[#25D366] text-[#128C7E] hover:bg-[#25D366] hover:text-white"
            >
              <WhatsAppIcon className="h-5 w-5" /> Ask about this saree on WhatsApp
            </a>

            <dl className="mt-10 divide-y divide-ink/10 border-y border-ink/10 text-sm">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[140px_1fr] py-3">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 space-y-3 text-sm text-ink-soft">
              <p className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-saffron" /> Care: {product.care}</p>
              <p className="flex gap-3"><Truck className="h-5 w-5 shrink-0 text-saffron" /> Ships from Varanasi in 1 to 2 days, delivered in 4 to 7 days.</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="section-title">More {category?.name}</h2>
            <div className="rule" />
            <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
