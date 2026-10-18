# Banarasi Saree Store — Development Plan

## 1. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Vite + React + TypeScript + Tailwind CSS + shadcn/ui** | Same stack Lovable generates, so the reference design ports over cleanly |
| SEO | **Vike (vite-plugin-ssr) prerendering** or `vite-react-ssg` + `react-helmet-async` | A plain Vite app is a client-side SPA — Google sees an almost empty HTML page. Prerendering gives every catalogue/product page real HTML, titles, meta tags and structured data |
| Backend + Database | **Supabase** (Postgres) — no separate Express server | Relational data (orders → items → products) fits Postgres; Lovable integrates with Supabase natively; generous free tier |
| Auth | **Supabase Auth** (email + password), `profiles.role` = `admin` / `customer`, enforced with **Row Level Security** | Two logins, one user table; customers can only read their own cart/orders, only admins can edit products |
| Images | **Supabase Storage** bucket `product-images` (public read, admin-only write) | |
| Server-side logic | **Supabase Edge Function** `chat` (chatbot) and Postgres function `place_order` (checks stock and price server-side, in one transaction) | Secrets and price checks never run in the browser |
| Chatbot | Claude API (`claude-opus-5-5` at low effort; switchable with the `CHAT_MODEL` secret) called from the `chat` Edge Function, with the saree knowledge base (section 4) and live catalogue as context | API key never reaches the browser |
| Payments | Phase 2 — Razorpay (UPI, cards, netbanking) | Start with Cash on Delivery / "order request" |

## 1a. Design system — "Katyayini" (from the Lovable reference)

- **Brand**: Katyayini, with a round saffron-gradient logo bearing a trishul
- **Palette**: cream background (~`#FBF1E6`), maroon/sindoor (~`#8B2A1F`), saffron (~`#E07A1F`), deep brown text (~`#3B1F14`), gold accents
- **Type**: elegant high-contrast serif for headings (Cormorant Garamond style); clean sans for body; wide-letter-spaced uppercase for nav, eyebrows and labels
- **Motifs**: maroon/saffron zigzag border along the top of the header; faint dotted pattern on cream sections; thin maroon rule under section titles; **temple-arch shapes** for category cards and product images
- **Header**: HOME · CATALOGUE on the left, logo + wordmark centered, search / wishlist / cart icons on the right
- **Hero**: full-width Varanasi ghat at sunset with a woman in a Banarasi saree; "KASHI…" eyebrow, large serif headline, short poetic line, saffron uppercase CTA button
- **"Four traditions, one city"**: four arch cards — Katan Silk ("Pure silk, timeless zari"), Tissue ("Shimmer of metallic threads"), Organza ("Light as the morning ghat"), Georgette ("Fluid drape, everyday grace")
- **"New on the loom — Fresh arrivals"**: product cards with arch-framed photos, BESTSELLER / NEW badges, round wishlist heart, label `TYPE · COLOUR` (e.g. KATAN SILK · SAFFRON), poetic serif product names (Sindoori Kalga, Mitti Jaal, Ghat Sandhya)

## 2. Pages

### Public
- **Home / Landing** — hero banner, featured collections, "Shop by type" (Katan, Organza, Georgette…), bestsellers, why-Banarasi story, testimonials, chatbot launcher
- **Catalogue** `/sarees` — grid with filters: type, fabric, zari type, weave technique, colour, occasion, price range; sort by price / newest
- **Collection pages** `/sarees/katan-silk` etc. — one per saree type, each with its own SEO text (these are what rank on Google)
- **Product detail** `/saree/:slug` — image gallery + zoom, price, fabric/zari/weave specs, care instructions, blouse piece info, add to cart, related sarees
- **Saree Guide** `/guide` — the knowledge in section 4 as readable content (great for SEO)
- **About, Contact, Shipping & Returns, Privacy, Terms**

### Customer (logged in)
- **Login / Register / Forgot password**
- **Cart** — quantity, remove, subtotal; guest cart in localStorage that merges on login
- **Checkout** — address, order summary, place order
- **My Account** — profile, addresses, order history + status, wishlist

### Admin (separate login at `/admin/login`)
- **Dashboard** — orders today, revenue, low stock
- **Products** — add/edit/delete sarees, upload images, set stock, featured flag
- **Categories / Collections** — manage saree types
- **Orders** — list, view, update status (Placed → Confirmed → Shipped → Delivered / Cancelled)
- **Customers** — list, view orders
- **Chatbot knowledge** — edit the saree-type info the bot uses

## 3. Data model (first cut)

All tables live in Supabase Postgres with Row Level Security.

- **profiles** — id (= `auth.users.id`), name, phone, role (`admin`/`customer`), createdAt. Login email and password are handled by Supabase Auth
- **Category** — id, name, slug, description, seoTitle, seoDescription, image
- **Product** — id, name, slug, categoryId, description, price, mrp, stock, fabric, zariType, weave, colour, occasion[], weightGrams, careInstructions, hasBlousePiece, isFeatured, images[]
- **CartItem** — userId, productId, qty
- **Address** — userId, name, phone, line1, line2, city, state, pincode
- **Order** — id, userId, addressSnapshot, status, total, paymentMethod, createdAt
- **OrderItem** — orderId, productId, nameSnapshot, priceSnapshot, qty
- **Wishlist** — userId, productId
- **ChatSession / ChatMessage** — optional, to review what customers ask

## 4. Banarasi saree basics (chatbot + guide content)

Prices are indicative retail ranges (INR) and should be replaced with your actual pricing.

### By fabric / base

| Type | What it is | Feel & ease of wear | Indicative price | Best for |
|---|---|---|---|---|
| **Katan (pure silk)** | Pure mulberry silk, twisted threads; the classic Banarasi | Heavy, rich, structured drape; needs practice | ₹8k – ₹1.5L+ | Bride, wedding rituals, heirloom |
| **Organza / Kora** | Silk + zari on a sheer, crisp base | Light, see-through, stiff-ish; easy to carry | ₹5k – ₹40k | Sangeet, receptions, summer weddings |
| **Georgette** | Light crinkled silk/georgette base with Banarasi motifs | Very light, flowy, easiest drape | ₹3k – ₹25k | Parties, first-time saree wearers |
| **Chiffon** | Sheer, soft, lightweight | Very easy, fluid fall | ₹3k – ₹20k | Day functions, evening parties |
| **Shattir** | Plain silk weave, modern minimal designs | Medium weight, comfortable | ₹3k – ₹15k | Office events, festive, gifting |
| **Tissue** | Zari woven into the weft, metallic sheen | Light but crisp, shiny | ₹6k – ₹50k | Festive, Durga Puja, receptions |
| **Silk-cotton / Cotton Banarasi** | Cotton or blend with zari motifs | Breathable, everyday-friendly | ₹1.5k – ₹8k | Daily/office wear, hot weather, budget |
| **Semi-silk / Art silk** | Polyester/viscose blends, powerloom | Light, low-maintenance | ₹800 – ₹4k | Budget buyers, one-time events |

### By design / weave technique

| Design | Description |
|---|---|
| **Jangla** | Dense, all-over vine/floral jungle pattern — very grand, bridal |
| **Tanchoi** | Multi-coloured weft creating a self-patterned, brocade-like texture, often no zari |
| **Butidar** | Small scattered motifs (butis) in gold/silver zari |
| **Cutwork** | Motifs woven with loose threads cut away on the back — lighter, more affordable |
| **Jamdani (Banarasi)** | Motifs woven on a sheer base, often cotton-silk |
| **Meenakari** | Coloured threads (like enamel work) added to zari motifs |
| **Kadhua vs Phekwa** | Kadhua: each motif woven separately by hand (premium, no floats on the back). Phekwa: thread runs across the whole width and extra is cut off (faster, cheaper) |

### Quality signals (for the chatbot to explain)

- **Handloom vs powerloom** — handloom has slight irregularities, weaver's flaws, takes days to weeks; powerloom is uniform and much cheaper
- **Zari** — *Real zari* (silver thread with gold plating, most expensive), *tested zari* (copper with silver/gold electroplating, most common good quality), *imitation/metallic zari* (plastic-based, budget)
- **Certifications** — GI tag (Banaras Brocades & Sarees, 2009) and **Silk Mark** for pure silk
- **Back side check** — Kadhua handloom has a neat reverse; Phekwa/powerloom shows floats or cut threads
- **Burn test** for silk (smells like burnt hair, turns to ash) — mention only as info

### Care

Dry clean only for silk/zari; store wrapped in muslin cloth, refold every few months to avoid creases cracking the zari; keep away from perfume and moisture.

## 5. Chatbot — "Saree Sahayak"

- Floating chat button on every page
- Opens with quick questions: **Occasion? Budget? Comfort level with heavy sarees? Weather/season?**
- Backend `POST /api/chat` sends: system prompt (store persona + section 4 knowledge + rules: be honest about trade-offs, never invent prices or stock), the customer's answers, and a short list of **matching products from the DB** filtered by budget/type
- Replies with a recommendation + explanation + clickable product cards
- Guardrails: rate limit per IP, max message length, stays on saree/store topics

## 5a. WhatsApp support

- **Click-to-chat (free, built)**: floating WhatsApp button + "Ask on WhatsApp" on each product page, opening `https://wa.me/<number>?text=Hi, I'm interested in <product name> (<link>)`. Use the free **WhatsApp Business app** on the store phone
- **Order updates**: from the admin Orders page, "Message customer on WhatsApp" opens a pre-filled chat to send manually. No paid WhatsApp Business API is used.

## 6. SEO plan (to rank on Google)

- Prerender all public pages to static HTML
- Unique `<title>` and meta description per page; keyword-rich slugs (`/sarees/pure-katan-silk-banarasi`)
- **JSON-LD structured data**: `Product` (price, availability), `BreadcrumbList`, `Organization`, `FAQPage` on the guide
- `sitemap.xml` + `robots.txt` generated at build
- Image `alt` text, WebP images, lazy loading, good Core Web Vitals
- Content pages (guide, "how to identify real Banarasi") — these bring organic traffic
- Register with Google Search Console + Google Business Profile after launch

## 7. Data access (Supabase)

```
Auth:      supabase.auth.signUp / signInWithPassword / signOut / getUser
Products:  select from products, categories (public read via RLS)
Cart:      select/insert/update/delete cart_items (own rows only)
Wishlist:  wishlist (own rows only)
Orders:    rpc place_order (validates stock + price); select own orders
Chat:      Edge Function chat
Admin:     products, categories, orders writable only when profiles.role = 'admin' (RLS)
```

## 8. Folder structure

```
Kat/
  src/                     Vite + React (pages, components, hooks, lib/supabase.ts)
  supabase/
    migrations/            tables, RLS policies, seed data
    functions/chat/        Edge Function

```

## 9. Build phases

1. **Setup** — Vite + React + Tailwind/shadcn, Supabase project, migrations + RLS, seed data (sample sarees per type)
2. **Design system + Landing page** — match the Katyayini reference
3. **Catalogue + Product pages** with filters
4. **Auth** — customer + admin login, protected routes
5. **Cart + Checkout + Orders**
6. **Admin panel**
7. **Chatbot**
8. **SEO pass** — prerendering, meta, JSON-LD, sitemap
9. **Deploy** — frontend on Vercel/Netlify; Supabase hosts DB, auth, storage and functions
10. Phase 2 — Razorpay payments, order emails, reviews

## 10. Open questions

- Is the Lovable project already connected to a Supabase project we should reuse, or do we create a new one?
- Real product photos and prices available, or start with placeholders?
- Payments at launch: COD only, or Razorpay from day one?
- Shipping: India only or international?
