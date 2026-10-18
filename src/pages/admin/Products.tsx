import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { ProductImage } from "@/components/ProductCard";
import { useCatalogue } from "@/context/CatalogueContext";
import { deleteProduct, saveProduct, uploadProductImage } from "@/lib/api";
import { inr } from "@/lib/format";
import type { Motif, Product } from "@/lib/types";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function ProductList() {
  const { products, categories } = useCatalogue();
  const [q, setQ] = useState("");
  const list = products.filter((p) => `${p.name} ${p.colour} ${p.category}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl">Products</h1>
        <Link to="/admin/products/new" className="btn-primary"><Plus className="h-4 w-4" /> Add saree</Link>
      </div>
      <input className="input mt-6 max-w-sm" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="label border-b border-ink/15">
            <tr><th className="py-3 pr-4">Saree</th><th className="pr-4">Type</th><th className="pr-4">Price</th><th className="pr-4">Stock</th><th>Tag</th></tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-cream">
                <td className="py-3 pr-4">
                  <Link to={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-sindoor">
                    <span className="h-14 w-11 shrink-0 overflow-hidden bg-cream-dark"><ProductImage product={p} /></span>
                    <span><span className="block font-medium">{p.name}</span><span className="text-ink-soft">{p.colour}</span></span>
                  </Link>
                </td>
                <td className="pr-4">{categories.find((c) => c.slug === p.category)?.name ?? p.category}</td>
                <td className="pr-4">{inr(p.price)}</td>
                <td className={`pr-4 ${p.stock <= 3 ? "text-sindoor" : ""}`}>{p.stock}</td>
                <td>{p.badge ?? (p.featured ? "Featured" : "")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const blank = (category: string): Product => ({
  id: "",
  slug: "",
  name: "",
  category,
  colour: "",
  price: 0,
  mrp: 0,
  stock: 1,
  fabric: "",
  zari: "Tested zari",
  weave: "Handloom",
  occasions: [],
  weightGrams: 500,
  description: "",
  care: "Dry clean only.",
  hasBlousePiece: true,
  badge: "New",
  featured: false,
  images: [],
  art: { base: "#8B2A1F", accent: "#E3C77E", border: "#C9A24A", motif: "buti", backdrop: "#F3E3CF" },
  createdAt: new Date().toISOString(),
});

export function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, reload } = useCatalogue();
  const existing = id && id !== "new" ? products.find((p) => p.id === id) : undefined;
  const [form, setForm] = useState<Product>(existing ?? blank(categories[0]?.slug ?? ""));
  const [occasionText, setOccasionText] = useState(form.occasions.join(", "));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm(existing);
      setOccasionText(existing.occasions.join(", "));
    }
  }, [existing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (id && id !== "new" && !existing) return <p className="text-ink-soft">Product not found. <Link to="/admin/products" className="underline">Back</Link></p>;

  const set = <K extends keyof Product>(key: K, value: Product[K]) => setForm((f) => ({ ...f, [key]: value }));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const urls = await Promise.all([...files].map(uploadProductImage));
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.price <= 0) return setError("Price must be more than zero.");
    setBusy(true);
    try {
      const slug = form.slug || slugify(`${form.name} ${categories.find((c) => c.slug === form.category)?.name ?? ""} ${form.colour}`);
      await saveProduct({
        ...form,
        id: form.id || slug,
        slug,
        mrp: Math.max(form.mrp, form.price),
        occasions: occasionText.split(",").map((s) => s.trim()).filter(Boolean),
      });
      await reload();
      navigate("/admin/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!existing || !window.confirm(`Delete ${existing.name}? This cannot be undone.`)) return;
    await deleteProduct(existing.id);
    await reload();
    navigate("/admin/products");
  };

  return (
    <form onSubmit={submit} className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl">{existing ? `Edit ${existing.name}` : "Add a saree"}</h1>
        <Link to="/admin/products" className="text-sm underline">Cancel</Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_240px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Name"><input required className="input" value={form.name} onChange={(e) => set("name", e.target.value)} /></F>
          <F label="Colour"><input required className="input" value={form.colour} onChange={(e) => set("colour", e.target.value)} /></F>
          <F label="Saree type">
            <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </F>
          <F label="URL slug (auto if blank)"><input className="input" value={form.slug} disabled={!!existing} onChange={(e) => set("slug", slugify(e.target.value))} /></F>
          <F label="Price (₹)"><input type="number" min={0} required className="input" value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} /></F>
          <F label="MRP (₹)"><input type="number" min={0} className="input" value={form.mrp || ""} onChange={(e) => set("mrp", Number(e.target.value))} /></F>
          <F label="Stock"><input type="number" min={0} required className="input" value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} /></F>
          <F label="Weight (g)"><input type="number" min={0} className="input" value={form.weightGrams} onChange={(e) => set("weightGrams", Number(e.target.value))} /></F>
          <F label="Fabric"><input className="input" value={form.fabric} onChange={(e) => set("fabric", e.target.value)} placeholder="Pure Katan silk" /></F>
          <F label="Zari">
            <select className="input" value={form.zari} onChange={(e) => set("zari", e.target.value)}>
              {["Real zari (silver, gold-plated)", "Tested zari", "Tested silver zari", "Imitation zari", "No zari"].concat(
                ["Real zari (silver, gold-plated)", "Tested zari", "Tested silver zari", "Imitation zari", "No zari"].includes(form.zari) ? [] : [form.zari],
              ).map((z) => <option key={z}>{z}</option>)}
            </select>
          </F>
          <F label="Weave"><input className="input" value={form.weave} onChange={(e) => set("weave", e.target.value)} placeholder="Handloom, Kadhua" /></F>
          <F label="Occasions (comma separated)"><input className="input" value={occasionText} onChange={(e) => setOccasionText(e.target.value)} placeholder="Wedding, Festive" /></F>
          <F label="Description" wide><textarea rows={4} className="input" value={form.description} onChange={(e) => set("description", e.target.value)} /></F>
          <F label="Care" wide><input className="input" value={form.care} onChange={(e) => set("care", e.target.value)} /></F>
          <F label="Tag">
            <select className="input" value={form.badge ?? ""} onChange={(e) => set("badge", (e.target.value || null) as Product["badge"])}>
              <option value="">None</option><option>New</option><option>Bestseller</option>
            </select>
          </F>
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-sindoor" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Show on home page</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-sindoor" checked={form.hasBlousePiece} onChange={(e) => set("hasBlousePiece", e.target.checked)} /> Blouse piece included</label>
          </div>
        </div>

        <div>
          <p className="label mb-2">Photos</p>
          <div className="aspect-[4/5] overflow-hidden bg-cream-dark"><ProductImage product={form} /></div>
          {form.images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {form.images.map((src) => (
                <div key={src} className="relative">
                  <img src={src} alt="" className="aspect-[4/5] w-full object-cover" />
                  <button type="button" aria-label="Remove photo" onClick={() => set("images", form.images.filter((i) => i !== src))}
                    className="absolute right-1 top-1 rounded-full bg-cream-light p-0.5"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
          <label className="btn-outline mt-3 w-full cursor-pointer">
            <Upload className="h-4 w-4" /> Upload photos
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          </label>
          {form.images.length === 0 && (
            <div className="mt-6 space-y-2 text-sm">
              <p className="label">Illustration colours</p>
              {(["base", "border", "accent", "backdrop"] as const).map((k) => (
                <label key={k} className="flex items-center justify-between capitalize">
                  {k}
                  <input type="color" value={form.art[k]} onChange={(e) => set("art", { ...form.art, [k]: e.target.value })} />
                </label>
              ))}
              <label className="flex items-center justify-between">
                Motif
                <select className="border border-ink/20 bg-cream-light px-2 py-1" value={form.art.motif} onChange={(e) => set("art", { ...form.art, motif: e.target.value as Motif })}>
                  {["buti", "paisley", "jaal", "stripe", "plain"].map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
            </div>
          )}
        </div>
      </div>

      {error && <p role="alert" className="mt-6 text-sm text-sindoor">{error}</p>}
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="btn-primary">{busy ? "Saving…" : "Save saree"}</button>
        {existing && (
          <button type="button" onClick={remove} className="btn border border-ink/20 text-ink-soft hover:border-sindoor hover:text-sindoor">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        )}
      </div>
    </form>
  );
}

function F({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="label mb-1 block">{label}</span>
      {children}
    </label>
  );
}
