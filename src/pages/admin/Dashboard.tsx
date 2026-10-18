import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalogue } from "@/context/CatalogueContext";
import { listOrders } from "@/lib/api";
import { inr } from "@/lib/format";
import type { Order } from "@/lib/types";
import { StatusPill } from "@/pages/Account";

export default function Dashboard() {
  const { products } = useCatalogue();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    listOrders({}).then(setOrders).catch(() => setOrders([]));
  }, []);

  const today = new Date().toDateString();
  const live = orders.filter((o) => o.status !== "cancelled");
  const stats = [
    { label: "Orders today", value: String(orders.filter((o) => new Date(o.createdAt).toDateString() === today).length) },
    { label: "To fulfil", value: String(orders.filter((o) => o.status === "placed" || o.status === "confirmed").length) },
    { label: "Revenue (all time)", value: inr(live.reduce((s, o) => s + o.total, 0)) },
    { label: "Products", value: String(products.length) },
  ];
  const lowStock = products.filter((p) => p.stock <= 3).sort((a, b) => a.stock - b.stock);

  return (
    <div>
      <h1 className="text-4xl">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="label">{s.label}</p>
            <p className="mt-2 font-serif text-4xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm text-sindoor underline">All orders</Link>
          </div>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/10 text-sm">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <span>
                    #{o.id.slice(0, 8).toUpperCase()} · {o.address.name}
                  </span>
                  <span className="flex items-center gap-3">
                    {inr(o.total)} <StatusPill status={o.status} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Low stock</h2>
            <Link to="/admin/products" className="text-sm text-sindoor underline">Manage products</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Everything is well stocked.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/10 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between py-3">
                  <Link to={`/admin/products/${p.id}`} className="hover:text-sindoor">{p.name} · {p.colour}</Link>
                  <span className={p.stock === 0 ? "text-sindoor" : ""}>{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
