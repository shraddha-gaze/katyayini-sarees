import { Fragment, useEffect, useState } from "react";
import { listCustomers, listOrders, updateOrderStatus } from "@/lib/api";
import { inr, whatsappTo } from "@/lib/format";
import type { Order, OrderStatus, Profile } from "@/lib/types";
import { STATUS_LABEL } from "@/pages/Account";

const STATUSES = Object.keys(STATUS_LABEL) as OrderStatus[];

export function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "">("");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listOrders({}).then(setOrders).catch((e) => { setError(e.message); setOrders([]); });
  }, []);

  const change = async (id: string, status: OrderStatus) => {
    setError("");
    try {
      await updateOrderStatus(id, status);
      setOrders((list) => list?.map((o) => (o.id === id ? { ...o, status } : o)) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update");
    }
  };

  const list = (orders ?? []).filter((o) => !filter || o.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl">Orders</h1>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | "")}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-sindoor">{error}</p>}
      {orders === null ? (
        <p className="mt-6 text-ink-soft">Loading…</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-ink-soft">No orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="label border-b border-ink/15">
              <tr><th className="py-3 pr-4">Order</th><th className="pr-4">Date</th><th className="pr-4">Customer</th><th className="pr-4">Total</th><th className="pr-4">Payment</th><th>Status</th></tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {list.map((o) => (
                <Fragment key={o.id}>
                  <tr className="hover:bg-cream">
                    <td className="py-3 pr-4">
                      <button className="font-medium text-sindoor underline" onClick={() => setOpen(open === o.id ? null : o.id)}>
                        #{o.id.slice(0, 8).toUpperCase()}
                      </button>
                    </td>
                    <td className="pr-4">{new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className="pr-4">{o.address.name}<span className="block text-ink-soft">{o.customerEmail}</span></td>
                    <td className="pr-4">{inr(o.total)}</td>
                    <td className="pr-4">{o.paymentMethod === "cod" ? "Cash on delivery" : "UPI on delivery"}</td>
                    <td>
                      <select className="border border-ink/20 bg-cream-light px-2 py-1" value={o.status} onChange={(e) => change(o.id, e.target.value as OrderStatus)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    </td>
                  </tr>
                  {open === o.id && (
                    <tr className="bg-cream">
                      <td colSpan={6} className="p-4">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div>
                            <p className="label mb-2">Items</p>
                            <ul className="space-y-1">
                              {o.items.map((i) => <li key={i.productId + i.name}>{i.name} × {i.qty} · {inr(i.price * i.qty)}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="label mb-2">Ship to</p>
                            <p>{o.address.name}, {o.address.phone}</p>
                            <p>{o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ""}</p>
                            <p>{o.address.city}, {o.address.state} {o.address.pincode}</p>
                            <a
                              href={whatsappTo(
                                `91${o.address.phone.replace(/\D/g, "").slice(-10)}`,
                                `Namaste ${o.address.name}! Your Katyayini order #${o.id.slice(0, 8).toUpperCase()} is ${STATUS_LABEL[o.status].toLowerCase()}.`,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-[#128C7E] underline"
                            >
                              Message customer on WhatsApp
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function Customers() {
  const [people, setPeople] = useState<(Profile & { email?: string; createdAt?: string })[] | null>(null);
  useEffect(() => {
    listCustomers().then(setPeople).catch(() => setPeople([]));
  }, []);

  return (
    <div>
      <h1 className="text-4xl">Customers</h1>
      {people === null ? (
        <p className="mt-6 text-ink-soft">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="label border-b border-ink/15">
              <tr><th className="py-3 pr-4">Name</th><th className="pr-4">Email</th><th className="pr-4">Phone</th><th>Role</th></tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {people.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 pr-4">{p.name ?? "—"}</td>
                  <td className="pr-4">{p.email ?? "—"}</td>
                  <td className="pr-4">{p.phone ?? "—"}</td>
                  <td className="capitalize">{p.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
