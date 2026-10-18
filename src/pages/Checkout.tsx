import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";
import { useCatalogue } from "@/context/CatalogueContext";
import { useShop } from "@/context/ShopContext";
import { placeOrder } from "@/lib/api";
import { inr } from "@/lib/format";
import type { Address } from "@/lib/types";

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Other",
];

const COD_LIMIT = 25000;

export default function Checkout() {
  const { user } = useAuth();
  const { cart, cartLines, subtotal, clearCart } = useShop();
  const { reload } = useCatalogue();
  const navigate = useNavigate();
  const [address, setAddress] = useState<Address>({
    name: user?.profile.name ?? "",
    phone: user?.profile.phone ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "Uttar Pradesh",
    pincode: "",
  });
  const [payment, setPayment] = useState(subtotal > COD_LIMIT ? "upi_on_delivery" : "cod");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (subtotal > COD_LIMIT && payment === "cod") setPayment("upi_on_delivery");
  }, [subtotal, payment]);

  if (!user) return null;
  if (cartLines.length === 0 && !busy) return <Navigate to="/cart" replace />;

  const set = (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddress({ ...address, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[6-9]\d{9}$/.test(address.phone.replace(/\D/g, "").slice(-10))) return setError("Enter a valid 10-digit Indian mobile number.");
    if (!/^\d{6}$/.test(address.pincode)) return setError("Enter a valid 6-digit PIN code.");
    setBusy(true);
    try {
      const orderId = await placeOrder(user, cart, address, payment);
      clearCart();
      reload();
      navigate(`/order/${orderId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place your order. Please try again.");
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title="Checkout" description="Complete your order." path="/checkout" noindex />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-5xl">Checkout</h1>
        <div className="mt-2 h-px w-24 bg-sindoor" />

        <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-4 font-serif text-3xl">Delivery address</legend>
              <Field label="Full name"><input required className="input" value={address.name} onChange={set("name")} autoComplete="name" /></Field>
              <Field label="Mobile number"><input required className="input" inputMode="tel" value={address.phone} onChange={set("phone")} autoComplete="tel" /></Field>
              <Field label="House, building, street" wide><input required className="input" value={address.line1} onChange={set("line1")} autoComplete="address-line1" /></Field>
              <Field label="Area, landmark (optional)" wide><input className="input" value={address.line2} onChange={set("line2")} autoComplete="address-line2" /></Field>
              <Field label="City"><input required className="input" value={address.city} onChange={set("city")} autoComplete="address-level2" /></Field>
              <Field label="PIN code"><input required className="input" inputMode="numeric" maxLength={6} value={address.pincode} onChange={set("pincode")} autoComplete="postal-code" /></Field>
              <Field label="State">
                <select className="input" value={address.state} onChange={set("state")}>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </fieldset>

            <fieldset>
              <legend className="mb-4 font-serif text-3xl">Payment</legend>
              <div className="space-y-3">
                <PayOption value="cod" current={payment} onChange={setPayment} disabled={subtotal > COD_LIMIT}
                  title="Cash on delivery" text={subtotal > COD_LIMIT ? `Available on orders up to ${inr(COD_LIMIT)}` : "Pay in cash when your saree arrives."} />
                <PayOption value="upi_on_delivery" current={payment} onChange={setPayment}
                  title="UPI on delivery" text="Pay by any UPI app when your saree arrives." />
              </div>
              <p className="mt-3 text-xs text-ink-soft">Online card and UPI payments are coming soon.</p>
            </fieldset>
          </div>

          <aside className="card h-fit p-6">
            <h2 className="text-3xl">Your order</h2>
            <ul className="mt-6 space-y-3 text-sm">
              {cartLines.map(({ product, qty }) => (
                <li key={product.id} className="flex justify-between gap-4">
                  <span>{product.name} × {qty}</span>
                  <span>{inr(product.price * qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-ink/10 pt-4 text-sm">
              <div className="flex justify-between"><dt>Shipping</dt><dd className="text-saffron">Free</dd></div>
              <div className="flex justify-between text-base font-medium"><dt>Total</dt><dd>{inr(subtotal)}</dd></div>
            </dl>
            {error && <p role="alert" className="mt-4 text-sm text-sindoor">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary mt-6 w-full">{busy ? "Placing order…" : "Place order"}</button>
            <Link to="/cart" className="mt-4 block text-center text-sm text-ink-soft underline">Back to bag</Link>
          </aside>
        </form>
      </div>
    </>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="label mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function PayOption(props: { value: string; current: string; onChange: (v: string) => void; title: string; text: string; disabled?: boolean }) {
  return (
    <label className={`flex cursor-pointer gap-3 border p-4 ${props.current === props.value ? "border-sindoor bg-cream-light" : "border-ink/15"} ${props.disabled ? "opacity-50" : ""}`}>
      <input type="radio" name="payment" className="mt-1 accent-sindoor" disabled={props.disabled}
        checked={props.current === props.value} onChange={() => props.onChange(props.value)} />
      <span>
        <span className="block font-medium">{props.title}</span>
        <span className="text-sm text-ink-soft">{props.text}</span>
      </span>
    </label>
  );
}
