# Katyayini — Banarasi saree store

Vite + React + TypeScript + Tailwind storefront with Supabase (Postgres, auth, storage, Edge Functions).
Public pages are prerendered to static HTML at build time for SEO.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

With no `.env`, the site runs in **demo mode**: sample catalogue, and accounts, cart and orders
kept in the browser's localStorage. The chatbot uses a simple rule-based stand-in.

Demo-mode test accounts (they exist only in your browser):

| Role | Email | Password |
|---|---|---|
| Admin (`/admin/login`) | admin@katyayini.test | admin12345 |
| Customer (`/login`) | customer@katyayini.test | customer12345 |

## Go live with Supabase

1. Create a project at supabase.com.
2. In **SQL Editor**, run `supabase/migrations/0001_schema.sql`, then `0002_seed.sql` (sample sarees).
3. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   (Project Settings → API), `VITE_WHATSAPP_NUMBER` and `VITE_SITE_URL`.
4. Sign up on the site with the store owner's email, then make that account an admin in the SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'owner@example.com';
   ```
5. Deploy the chatbot:
   ```bash
   npx supabase functions deploy chat --no-verify-jwt --project-ref <your-ref>
   npx supabase secrets set ANTHROPIC_API_KEY=<key> --project-ref <your-ref>
   ```
   The bot uses `claude-opus-5-5` at low effort. Set the `CHAT_MODEL` secret to use another model.
6. Under **Authentication → URL Configuration**, add your site URL so confirmation and reset links work.

## Build and deploy

```bash
npm run build      # type-check, client build, SSR build, prerender + sitemap.xml
```

Deploy `dist/` to Vercel or Netlify (`vercel.json` and `public/_redirects` route
non-prerendered pages such as `/cart` and `/admin` to `200.html`).
After launch, submit `https://<site>/sitemap.xml` in Google Search Console.

## Where things live

| Path | What |
|---|---|
| `src/data/catalogue.ts` | Sample sarees and categories (also used for prerendering). Regenerate the seed SQL with `node scripts/generate-seed.mjs` |
| `src/data/guide.ts` | Banarasi knowledge for `/guide`; `supabase/functions/chat/knowledge.ts` holds the same facts for the bot |
| `src/lib/api.ts` | All data access (Supabase or demo store) |
| `src/pages/admin/` | Admin panel: dashboard, products, orders, customers |
| `supabase/migrations/` | Tables, row level security, `place_order` function, storage bucket |

## Placeholders to replace

- Contact email, visit address and returns policy text in `src/pages/InfoPages.tsx`
- Store WhatsApp number (`VITE_WHATSAPP_NUMBER`)
- Saree illustrations: upload real photos per product in the admin panel
- Hero illustration: `src/components/GhatScene.tsx`
