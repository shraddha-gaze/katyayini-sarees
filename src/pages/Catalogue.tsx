import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import { useCatalogue } from "@/context/CatalogueContext";
import { SITE_URL } from "@/lib/format";
import NotFound from "@/pages/NotFound";

const PRICE_BANDS = [
  { id: "u5", label: "Under ₹5,000", min: 0, max: 5000 },
  { id: "5-10", label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { id: "10-20", label: "₹10,000 – ₹20,000", min: 10000, max: 20000 },
  { id: "20+", label: "Above ₹20,000", min: 20000, max: Infinity },
];

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
];

export default function Catalogue() {
  const { category: categorySlug } = useParams();
  const [params, setParams] = useSearchParams();
  const { products, categories } = useCatalogue();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : undefined;
  const q = params.get("q")?.trim().toLowerCase() ?? "";
  const price = params.get("price") ?? "";
  const occasion = params.get("occasion") ?? "";
  const loom = params.get("loom") ?? "";
  const sort = params.get("sort") ?? "new";

  const occasions = useMemo(() => [...new Set(products.flatMap((p) => p.occasions))].sort(), [products]);

  const list = useMemo(() => {
    const band = PRICE_BANDS.find((b) => b.id === price);
    const filtered = products.filter((p) => {
      if (categorySlug && p.category !== categorySlug) return false;
      if (band && (p.price < band.min || p.price >= band.max)) return false;
      if (occasion && !p.occasions.includes(occasion)) return false;
      if (loom && !p.weave.toLowerCase().includes(loom)) return false;
      if (q) {
        const hay = `${p.name} ${p.colour} ${p.category} ${p.fabric} ${p.zari} ${p.weave} ${p.occasions.join(" ")} ${p.description}`.toLowerCase();
        if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    return filtered.sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : b.createdAt.localeCompare(a.createdAt),
    );
  }, [products, categorySlug, price, occasion, loom, q, sort]);

  if (categorySlug && !category) return <NotFound />;

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const title = category ? `${category.name} Banarasi Sarees` : "All Banarasi Sarees";
  const path = category ? `/sarees/${category.slug}` : "/sarees";
  const activeCount = [price, occasion, loom, q].filter(Boolean).length;

  const filters = (
    <div className="space-y-8">
      <FilterGroup title="Saree type">
        <Link to="/sarees" className={`block py-1 ${!categorySlug ? "text-sindoor" : "hover:text-sindoor"}`}>All types</Link>
        {categories.map((c) => (
          <Link key={c.slug} to={`/sarees/${c.slug}`} className={`block py-1 ${categorySlug === c.slug ? "text-sindoor" : "hover:text-sindoor"}`}>
            {c.name}
          </Link>
        ))}
      </FilterGroup>
      <FilterGroup title="Price">
        {PRICE_BANDS.map((b) => (
          <Radio key={b.id} name="price" label={b.label} checked={price === b.id} onChange={() => set("price", price === b.id ? "" : b.id)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Occasion">
        {occasions.map((o) => (
          <Radio key={o} name="occasion" label={o} checked={occasion === o} onChange={() => set("occasion", occasion === o ? "" : o)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Loom">
        <Radio name="loom" label="Handloom" checked={loom === "handloom"} onChange={() => set("loom", loom === "handloom" ? "" : "handloom")} />
        <Radio name="loom" label="Powerloom" checked={loom === "powerloom"} onChange={() => set("loom", loom === "powerloom" ? "" : "powerloom")} />
      </FilterGroup>
      {activeCount > 0 && (
        <button className="text-sm text-sindoor underline" onClick={() => setParams({}, { replace: true })}>
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <Seo
        title={category?.seoTitle ?? "Shop Banarasi Sarees Online | Katan, Tissue, Organza, Georgette"}
        description={
          category?.seoDescription ??
          "Browse handwoven Banarasi sarees from Varanasi by type, price and occasion: pure Katan silk, tissue, organza, georgette, Shattir and silk-cotton."
        }
        path={path}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Sarees", item: `${SITE_URL}/sarees` },
            ...(category ? [{ "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}${path}` }] : []),
          ],
        }}
      />

      <section className="dotted-bg py-14 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <nav className="label mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-sindoor">Home</Link> / <Link to="/sarees" className="hover:text-sindoor">Sarees</Link>
            {category && <> / {category.name}</>}
          </nav>
          <h1 className="text-5xl sm:text-6xl">{title}</h1>
          <div className="rule" />
          <p className="mt-6 text-ink-soft">
            {category?.description ??
              "Every saree here is woven in Varanasi. Filter by type, budget and occasion, or ask the Saree Sahayak for a recommendation."}
          </p>
          {category && <p className="mt-3 text-sm text-sindoor">Typical price range: {category.priceHint}</p>}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-4">
          <p className="text-sm text-ink-soft">
            {list.length} {list.length === 1 ? "saree" : "sarees"}
            {q && <> for “{params.get("q")}”</>}
          </p>
          <div className="flex items-center gap-3">
            <button className="btn-outline px-4 py-2 lg:hidden" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" /> Filters{activeCount > 0 && ` (${activeCount})`}
            </button>
            <label className="flex items-center gap-2 text-sm">
              <span className="hidden sm:inline">Sort</span>
              <select value={sort} onChange={(e) => set("sort", e.target.value === "new" ? "" : e.target.value)} className="input w-auto py-2">
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">{filters}</aside>
          <div>
            {list.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-serif text-3xl">No sarees match those filters</p>
                <button className="btn-outline mt-6" onClick={() => setParams({}, { replace: true })}>Clear filters</button>
              </div>
            ) : (
              <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" onClick={() => setFiltersOpen(false)}>
          <div className="ml-auto h-full w-80 max-w-full overflow-y-auto bg-cream p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl">Filters</h2>
              <button aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X className="h-6 w-6" /></button>
            </div>
            {filters}
            <button className="btn-maroon mt-8 w-full" onClick={() => setFiltersOpen(false)}>Show {list.length} sarees</button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="label mb-3 text-ink">{title}</legend>
      <div className="space-y-1 text-sm">{children}</div>
    </fieldset>
  );
}

function Radio({ name, label, checked, onChange }: { name: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="accent-sindoor" />
      {label}
    </label>
  );
}
