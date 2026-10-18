import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as api from "@/lib/api";
import type { CartLine } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCatalogue } from "@/context/CatalogueContext";
import type { Product } from "@/lib/types";

interface ShopState {
  cart: CartLine[];
  cartCount: number;
  cartLines: { product: Product; qty: number }[];
  subtotal: number;
  addToCart: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWished: (productId: string) => boolean;
  toast: string | null;
  showToast: (msg: string) => void;
}

const ShopContext = createContext<ShopState | null>(null);
const CART_KEY = "kat.cart";
const WISH_KEY = "kat.wishlist";

function mergeCarts(a: CartLine[], b: CartLine[]) {
  const map = new Map<string, number>();
  for (const l of [...a, ...b]) map.set(l.productId, Math.max(map.get(l.productId) ?? 0, l.qty));
  return [...map].map(([productId, qty]) => ({ productId, qty }));
}

// Cart and wishlist live in localStorage so guests can shop; once signed in (with Supabase)
// they are merged with and saved to the user's account.
export function ShopProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { products } = useCatalogue();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [syncedUser, setSyncedUser] = useState<string | null>(null);
  const syncing = useRef<string | null>(null);

  useEffect(() => {
    setCart(api.store.get<CartLine[]>(CART_KEY, []));
    setWishlist(api.store.get<string[]>(WISH_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!user) {
      syncing.current = null;
      setSyncedUser(null);
      return;
    }
    if (syncing.current === user.id) return;
    syncing.current = user.id;
    (async () => {
      const [remoteCart, remoteWish] = await Promise.all([api.loadRemoteCart(), api.loadRemoteWishlist()]);
      if (remoteCart) setCart((c) => mergeCarts(c, remoteCart));
      if (remoteWish) setWishlist((w) => [...new Set([...w, ...remoteWish])]);
      setSyncedUser(user.id);
    })();
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    api.store.set(CART_KEY, cart);
    if (user && syncedUser === user.id) api.saveRemoteCart(user.id, cart).catch(() => {});
  }, [cart, user, syncedUser, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    api.store.set(WISH_KEY, wishlist);
    if (user && syncedUser === user.id) api.saveRemoteWishlist(user.id, wishlist).catch(() => {});
  }, [wishlist, user, syncedUser, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const cartLines = useMemo(
    () =>
      cart
        .map((l) => ({ product: products.find((p) => p.id === l.productId), qty: l.qty }))
        .filter((l): l is { product: Product; qty: number } => !!l.product),
    [cart, products],
  );

  const value: ShopState = {
    cart,
    cartLines,
    cartCount: cart.reduce((s, l) => s + l.qty, 0),
    subtotal: cartLines.reduce((s, l) => s + l.product.price * l.qty, 0),
    addToCart(productId, qty = 1) {
      setCart((c) => {
        const found = c.find((l) => l.productId === productId);
        return found ? c.map((l) => (l.productId === productId ? { ...l, qty: l.qty + qty } : l)) : [...c, { productId, qty }];
      });
      setToast("Added to your bag");
    },
    setQty(productId, qty) {
      setCart((c) => (qty <= 0 ? c.filter((l) => l.productId !== productId) : c.map((l) => (l.productId === productId ? { ...l, qty } : l))));
    },
    removeFromCart(productId) {
      setCart((c) => c.filter((l) => l.productId !== productId));
    },
    clearCart() {
      setCart([]);
    },
    wishlist,
    isWished: (id) => wishlist.includes(id),
    toggleWishlist(id) {
      setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
    },
    toast,
    showToast: setToast,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
