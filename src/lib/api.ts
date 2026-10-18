import { categories as seedCategories, products as seedProducts } from "@/data/catalogue";
import { isDemo, supabase } from "@/lib/supabase";
import type { Address, Category, Order, OrderItem, OrderStatus, Product, Profile } from "@/lib/types";

// One data-access layer for the whole app. Each function talks to Supabase when it is
// configured, otherwise to a small localStorage-backed demo store.

// ---------- localStorage helpers ----------

export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable: ignore */
    }
  },
};

const DEMO_PRODUCTS = "kat.demo.products";
const DEMO_USERS = "kat.demo.users";
const DEMO_SESSION = "kat.demo.session";
const DEMO_ORDERS = "kat.demo.orders";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);

function need<T>(value: T | null | undefined, message = "Something went wrong"): T {
  if (value === null || value === undefined) throw new Error(message);
  return value;
}

// ---------- row mapping ----------

/* eslint-disable @typescript-eslint/no-explicit-any */
const toProduct = (r: any): Product => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  category: r.category_slug,
  colour: r.colour,
  price: Number(r.price),
  mrp: Number(r.mrp),
  stock: r.stock,
  fabric: r.fabric,
  zari: r.zari,
  weave: r.weave,
  occasions: r.occasions ?? [],
  weightGrams: r.weight_grams,
  description: r.description,
  care: r.care,
  hasBlousePiece: r.has_blouse_piece,
  badge: r.badge,
  featured: r.featured,
  images: r.images ?? [],
  art: r.art,
  createdAt: r.created_at,
});

const fromProduct = (p: Product) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  category_slug: p.category,
  colour: p.colour,
  price: p.price,
  mrp: p.mrp,
  stock: p.stock,
  fabric: p.fabric,
  zari: p.zari,
  weave: p.weave,
  occasions: p.occasions,
  weight_grams: p.weightGrams,
  description: p.description,
  care: p.care,
  has_blouse_piece: p.hasBlousePiece,
  badge: p.badge,
  featured: p.featured,
  images: p.images,
  art: p.art,
});

const toCategory = (r: any): Category => ({
  slug: r.slug,
  name: r.name,
  tagline: r.tagline,
  description: r.description,
  seoTitle: r.seo_title,
  seoDescription: r.seo_description,
  priceHint: r.price_hint,
  featured: r.featured,
  art: r.art,
});

const toOrder = (r: any): Order => ({
  id: r.id,
  userId: r.user_id,
  status: r.status,
  total: Number(r.total),
  paymentMethod: r.payment_method,
  address: r.address,
  customerEmail: r.customer_email ?? undefined,
  createdAt: r.created_at,
  items: (r.order_items ?? []).map((i: any) => ({ productId: i.product_id, name: i.name, price: Number(i.price), qty: i.qty })),
});
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------- catalogue ----------

export async function getCategories(): Promise<Category[]> {
  if (!supabase) return seedCategories;
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data.map(toCategory);
}

export function demoProducts(): Product[] {
  return store.get<Product[]>(DEMO_PRODUCTS, seedProducts);
}

export async function getProducts(): Promise<Product[]> {
  if (!supabase) return demoProducts();
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toProduct);
}

export async function saveProduct(p: Product): Promise<Product> {
  if (!supabase) {
    const list = demoProducts();
    const i = list.findIndex((x) => x.id === p.id);
    if (i >= 0) list[i] = p;
    else list.unshift(p);
    store.set(DEMO_PRODUCTS, list);
    return p;
  }
  const { data, error } = await supabase.from("products").upsert(fromProduct(p)).select().single();
  if (error) throw error;
  return toProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  if (!supabase) {
    store.set(DEMO_PRODUCTS, demoProducts().filter((p) => p.id !== id));
    return;
  }
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!supabase) {
    // Demo mode: keep the image inline as a data URL.
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
  const path = `${uid()}-${file.name.replace(/[^a-zA-Z0-9.]+/g, "-")}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

// ---------- auth ----------

export interface SessionUser {
  id: string;
  email: string;
  profile: Profile;
}

interface DemoUser extends Profile {
  email: string;
  passwordHash: string;
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Demo-mode accounts, created on first use. Credentials are listed in README.md.
async function demoUsers(): Promise<DemoUser[]> {
  const users = store.get<DemoUser[]>(DEMO_USERS, []);
  if (users.length) return users;
  const seeded: DemoUser[] = [
    { id: "demo-admin", email: "admin@katyayini.test", name: "Store Admin", phone: null, role: "admin", passwordHash: await sha256("admin12345") },
    { id: "demo-customer", email: "customer@katyayini.test", name: "Demo Customer", phone: null, role: "customer", passwordHash: await sha256("customer12345") },
  ];
  store.set(DEMO_USERS, seeded);
  return seeded;
}

const toSession = (u: DemoUser): SessionUser => ({
  id: u.id,
  email: u.email,
  profile: { id: u.id, name: u.name, phone: u.phone, role: u.role },
});

async function loadProfile(id: string): Promise<Profile> {
  const { data, error } = await need(supabase).from("profiles").select("*").eq("id", id).single();
  if (error) throw error;
  return { id: data.id, name: data.name, phone: data.phone, role: data.role };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!supabase) {
    const id = store.get<string | null>(DEMO_SESSION, null);
    const user = id ? (await demoUsers()).find((u) => u.id === id) : undefined;
    return user ? toSession(user) : null;
  }
  const { data } = await supabase.auth.getSession();
  const u = data.session?.user;
  if (!u) return null;
  return { id: u.id, email: u.email ?? "", profile: await loadProfile(u.id) };
}

export async function signIn(email: string, password: string): Promise<SessionUser> {
  if (!supabase) {
    const hash = await sha256(password);
    const user = (await demoUsers()).find((u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hash);
    if (!user) throw new Error("Incorrect email or password");
    store.set(DEMO_SESSION, user.id);
    return toSession(user);
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { id: data.user.id, email: data.user.email ?? email, profile: await loadProfile(data.user.id) };
}

export async function signUp(name: string, email: string, password: string): Promise<SessionUser | null> {
  if (!supabase) {
    const users = await demoUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error("An account with this email already exists");
    const user: DemoUser = { id: uid(), email, name, phone: null, role: "customer", passwordHash: await sha256(password) };
    store.set(DEMO_USERS, [...users, user]);
    store.set(DEMO_SESSION, user.id);
    return toSession(user);
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: `${window.location.origin}/login` },
  });
  if (error) throw error;
  // With email confirmation enabled there is no session until the user clicks the link.
  if (!data.session || !data.user) return null;
  return { id: data.user.id, email, profile: await loadProfile(data.user.id) };
}

export async function signOut() {
  if (!supabase) {
    store.set(DEMO_SESSION, null);
    return;
  }
  await supabase.auth.signOut();
}

export async function resendConfirmation(email: string) {
  if (!supabase) return;
  const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${window.location.origin}/login` } });
  if (error) throw error;
}

export async function sendPasswordReset(email: string) {
  if (!supabase) throw new Error("Password reset needs Supabase. In demo mode use the accounts listed in README.md.");
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account` });
  if (error) throw error;
}

export async function updateProfile(id: string, fields: { name: string; phone: string }) {
  if (!supabase) {
    const users = await demoUsers();
    store.set(DEMO_USERS, users.map((u) => (u.id === id ? { ...u, ...fields } : u)));
    return;
  }
  const { error } = await supabase.from("profiles").update(fields).eq("id", id);
  if (error) throw error;
}

export async function listCustomers(): Promise<(Profile & { email?: string; createdAt?: string })[]> {
  if (!supabase) return (await demoUsers()).map(({ passwordHash: _ignored, ...u }) => u);
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({ id: r.id, name: r.name, phone: r.phone, role: r.role, email: r.email, createdAt: r.created_at }));
}

// ---------- cart & wishlist sync (logged-in users) ----------

export interface CartLine {
  productId: string;
  qty: number;
}

export async function loadRemoteCart(): Promise<CartLine[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("cart_items").select("product_id, qty");
  if (error) return null;
  return data.map((r) => ({ productId: r.product_id, qty: r.qty }));
}

export async function saveRemoteCart(userId: string, lines: CartLine[]) {
  if (!supabase) return;
  await supabase.from("cart_items").delete().eq("user_id", userId);
  if (lines.length)
    await supabase.from("cart_items").insert(lines.map((l) => ({ user_id: userId, product_id: l.productId, qty: l.qty })));
}

export async function loadRemoteWishlist(): Promise<string[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("wishlist").select("product_id");
  if (error) return null;
  return data.map((r) => r.product_id);
}

export async function saveRemoteWishlist(userId: string, ids: string[]) {
  if (!supabase) return;
  await supabase.from("wishlist").delete().eq("user_id", userId);
  if (ids.length) await supabase.from("wishlist").insert(ids.map((id) => ({ user_id: userId, product_id: id })));
}

// ---------- orders ----------

export async function placeOrder(user: SessionUser, lines: CartLine[], address: Address, paymentMethod: string): Promise<string> {
  if (!supabase) {
    const all = demoProducts();
    const items: OrderItem[] = lines.map((l) => {
      const p = need(all.find((x) => x.id === l.productId), "A saree in your cart is no longer available");
      if (p.stock < l.qty) throw new Error(`Only ${p.stock} left of ${p.name}`);
      return { productId: p.id, name: p.name, price: p.price, qty: l.qty };
    });
    store.set(
      DEMO_PRODUCTS,
      all.map((p) => {
        const line = lines.find((l) => l.productId === p.id);
        return line ? { ...p, stock: p.stock - line.qty } : p;
      }),
    );
    const order: Order = {
      id: uid(),
      userId: user.id,
      customerEmail: user.email,
      status: "placed",
      total: items.reduce((s, i) => s + i.price * i.qty, 0),
      paymentMethod,
      address,
      items,
      createdAt: new Date().toISOString(),
    };
    store.set(DEMO_ORDERS, [order, ...store.get<Order[]>(DEMO_ORDERS, [])]);
    return order.id;
  }
  // place_order is a Postgres function: it re-reads prices and stock on the server inside one transaction.
  const { data, error } = await supabase.rpc("place_order", {
    p_items: lines.map((l) => ({ product_id: l.productId, qty: l.qty })),
    p_address: address,
    p_payment_method: paymentMethod,
  });
  if (error) throw error;
  return data as string;
}

export async function listOrders(scope: { userId?: string }): Promise<Order[]> {
  if (!supabase) {
    const all = store.get<Order[]>(DEMO_ORDERS, []);
    return scope.userId ? all.filter((o) => o.userId === scope.userId) : all;
  }
  let q = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
  if (scope.userId) q = q.eq("user_id", scope.userId);
  const { data, error } = await q;
  if (error) throw error;
  return data.map(toOrder);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (!supabase) {
    store.set(DEMO_ORDERS, store.get<Order[]>(DEMO_ORDERS, []).map((o) => (o.id === id ? { ...o, status } : o)));
    return;
  }
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

// ---------- chatbot ----------

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatReply {
  reply: string;
  productIds: string[];
}

export async function askSahayak(messages: ChatMessage[]): Promise<ChatReply> {
  if (!supabase) {
    const { demoSahayak } = await import("@/lib/demoSahayak");
    return demoSahayak(messages, demoProducts());
  }
  const { data, error } = await supabase.functions.invoke("chat", { body: { messages } });
  if (error) throw error;
  return data as ChatReply;
}

export { isDemo };
