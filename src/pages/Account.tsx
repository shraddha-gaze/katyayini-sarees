import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Seo from "@/components/Seo";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useCatalogue } from "@/context/CatalogueContext";
import { useShop } from "@/context/ShopContext";
import { listOrders, updateProfile } from "@/lib/api";
import { inr, whatsappLink } from "@/lib/format";
import type { Order } from "@/lib/types";

export const STATUS_LABEL: Record<Order["status"], string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function StatusPill({ status }: { status: Order["status"] }) {
  const tone =
    status === "delivered" ? "bg-green-100 text-green-800" : status === "cancelled" ? "bg-ink/10 text-ink-soft" : status === "shipped" ? "bg-saffron/15 text-saffron-dark" : "bg-sindoor/10 text-sindoor";
  return <span className={`inline-block px-2.5 py-1 text-xs uppercase tracking-wider ${tone}`}>{STATUS_LABEL[status]}</span>;
}

const shortId = (id: string) => id.slice(0, 8).toUpperCase();

export function Account() {
  const { user, signOut, refresh } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [name, setName] = useState(user?.profile.name ?? "");
  const [phone, setPhone] = useState(user?.profile.phone ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) listOrders({ userId: user.id }).then(setOrders).catch(() => setOrders([]));
  }, [user]);

  if (!user) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(user.id, { name, phone });
    await refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Seo title="My account" description="Your Katyayini account." path="/account" noindex />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Namaste</p>
            <h1 className="mt-2 text-5xl">{user.profile.name || "Your account"}</h1>
            <p className="text-ink-soft">{user.email}</p>
          </div>
          <div className="flex gap-3">
            {user.profile.role === "admin" && <Link to="/admin" className="btn-maroon">Admin panel</Link>}
            <button className="btn-outline" onClick={async () => { await signOut(); navigate("/"); }}>Sign out</button>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
          <section>
            <h2 className="text-3xl">My orders</h2>
            {orders === null ? (
              <p className="mt-6 text-ink-soft">Loading…</p>
            ) : orders.length === 0 ? (
              <p className="mt-6 text-ink-soft">No orders yet. <Link to="/sarees" className="text-sindoor underline">Find your first Banarasi</Link>.</p>
            ) : (
              <ul className="mt-6 space-y-4">
                {orders.map((o) => (
                  <li key={o.id} className="card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">Order #{shortId(o.id)}</p>
                        <p className="text-sm text-ink-soft">{new Date(o.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                      </div>
                      <StatusPill status={o.status} />
                    </div>
                    <p className="mt-3 text-sm">{o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-sindoor">{inr(o.total)}</span>
                      <a href={whatsappLink(`Namaste! I have a question about order #${shortId(o.id)}.`)} target="_blank" rel="noopener noreferrer" className="text-ink-soft underline hover:text-sindoor">
                        Help with this order
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="card h-fit p-6">
            <h2 className="text-3xl">Profile</h2>
            <form onSubmit={save} className="mt-4 space-y-4">
              <label className="block"><span className="label">Name</span><input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} /></label>
              <label className="block"><span className="label">Mobile</span><input className="input mt-1" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
              <button className="btn-maroon w-full">{saved ? "Saved" : "Save"}</button>
            </form>
            <Link to="/wishlist" className="mt-6 block text-center text-sm text-sindoor underline">View wishlist</Link>
          </aside>
        </div>
      </div>
    </>
  );
}

export function OrderSuccess() {
  const { id = "" } = useParams();
  return (
    <>
      <Seo title="Order placed" description="Your order has been placed." path="/order" noindex />
      <section className="dotted-bg py-24 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-saffron" />
        <h1 className="mt-6 text-5xl">Dhanyavaad!</h1>
        <p className="mt-4 text-lg text-ink-soft">Your order #{shortId(id)} has been placed.</p>
        <p className="mt-2 text-ink-soft">We'll confirm it on WhatsApp shortly and ship from Varanasi within 2 days.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/account" className="btn-maroon">View my orders</Link>
          <Link to="/sarees" className="btn-outline">Keep shopping</Link>
        </div>
      </section>
    </>
  );
}

export function Wishlist() {
  const { wishlist } = useShop();
  const { products } = useCatalogue();
  const items = products.filter((p) => wishlist.includes(p.id));
  return (
    <>
      <Seo title="Wishlist" description="Sarees you've saved." path="/wishlist" noindex />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="text-center text-5xl">Your wishlist</h1>
        <div className="rule" />
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-ink-soft">Tap the heart on any saree to save it here.</p>
            <Link to="/sarees" className="btn-primary mt-8">Browse sarees</Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
