import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import Seo from "@/components/Seo";
import { ProductImage } from "@/components/ProductCard";
import { useShop } from "@/context/ShopContext";
import { inr } from "@/lib/format";

export default function Cart() {
  const { cartLines, subtotal, setQty, removeFromCart } = useShop();

  return (
    <>
      <Seo title="Your bag" description="Review the sarees in your bag." path="/cart" noindex />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-5xl">Your bag</h1>
        <div className="mt-2 h-px w-24 bg-sindoor" />

        {cartLines.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-3xl">Your bag is empty</p>
            <p className="mt-2 text-ink-soft">A Banarasi is waiting for you on the loom.</p>
            <Link to="/sarees" className="btn-primary mt-8">Browse sarees</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {cartLines.map(({ product, qty }) => (
                <li key={product.id} className="flex gap-5 py-6">
                  <Link to={`/saree/${product.slug}`} className="arch h-36 w-28 shrink-0 overflow-hidden bg-cream-dark">
                    <ProductImage product={product} />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="label">{product.colour}</p>
                        <Link to={`/saree/${product.slug}`} className="font-serif text-2xl hover:text-sindoor">{product.name}</Link>
                        <p className="text-sm text-ink-soft">{product.fabric}</p>
                      </div>
                      <p className="text-sindoor">{inr(product.price * qty)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center border border-ink/20">
                        <button className="p-2" aria-label="Decrease quantity" onClick={() => setQty(product.id, qty - 1)}><Minus className="h-4 w-4" /></button>
                        <span className="w-8 text-center">{qty}</span>
                        <button className="p-2" aria-label="Increase quantity" disabled={qty >= product.stock} onClick={() => setQty(product.id, qty + 1)}>
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(product.id)} className="flex items-center gap-1 text-sm text-ink-soft hover:text-sindoor">
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                    {qty > product.stock && <p className="mt-2 text-sm text-sindoor">Only {product.stock} in stock. Please reduce the quantity.</p>}
                  </div>
                </li>
              ))}
            </ul>

            <aside className="card h-fit p-6">
              <h2 className="text-3xl">Summary</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
                <div className="flex justify-between"><dt>Shipping</dt><dd className="text-saffron">Free</dd></div>
                <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-medium"><dt>Total</dt><dd>{inr(subtotal)}</dd></div>
              </dl>
              <Link to="/checkout" className="btn-primary mt-6 w-full">Checkout</Link>
              <Link to="/sarees" className="mt-4 block text-center text-sm text-ink-soft underline">Continue shopping</Link>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
