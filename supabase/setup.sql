-- One-paste setup: schema + sample catalogue. Paste into Supabase SQL Editor and Run.

-- Katyayini schema: catalogue, profiles with roles, cart, wishlist, orders, chat log.
-- Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists pgcrypto;

-- ---------- profiles & roles ----------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  phone text,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

-- Create a customer profile for every new sign-up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Customers may edit their name and phone, never their role.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  -- auth.uid() is null in the SQL editor, which is how the first admin is promoted.
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------- catalogue ----------

create table public.categories (
  slug text primary key,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  price_hint text not null default '',
  featured boolean not null default false,
  sort_order int not null default 0,
  art jsonb not null default '{}'
);

create table public.products (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  name text not null,
  category_slug text not null references public.categories (slug) on update cascade,
  colour text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  mrp numeric(10, 2) not null check (mrp >= 0),
  stock int not null default 0 check (stock >= 0),
  fabric text not null default '',
  zari text not null default '',
  weave text not null default '',
  occasions text[] not null default '{}',
  weight_grams int not null default 0,
  description text not null default '',
  care text not null default '',
  has_blouse_piece boolean not null default true,
  badge text check (badge in ('Bestseller', 'New')),
  featured boolean not null default false,
  images text[] not null default '{}',
  art jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index products_category_idx on public.products (category_slug);

-- ---------- cart & wishlist ----------

create table public.cart_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  qty int not null check (qty > 0),
  primary key (user_id, product_id)
);

create table public.wishlist (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------- orders ----------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  customer_email text,
  status text not null default 'placed' check (status in ('placed', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total numeric(10, 2) not null,
  payment_method text not null default 'cod',
  address jsonb not null,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text references public.products (id) on delete set null,
  name text not null,
  price numeric(10, 2) not null,
  qty int not null check (qty > 0)
);

create index orders_user_idx on public.orders (user_id);
create index order_items_order_idx on public.order_items (order_id);

-- Places an order atomically: prices and stock are read from the database, never trusted from the browser.
create or replace function public.place_order(p_items jsonb, p_address jsonb, p_payment_method text default 'cod')
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_order_id uuid;
  v_total numeric(10, 2) := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty int;
begin
  if auth.uid() is null then
    raise exception 'Please sign in to place an order';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Your bag is empty';
  end if;
  if p_payment_method not in ('cod', 'upi_on_delivery') then
    raise exception 'Unsupported payment method';
  end if;

  insert into public.orders (user_id, customer_email, total, payment_method, address)
  values (auth.uid(), (select email from auth.users where id = auth.uid()), 0, p_payment_method, p_address)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'qty')::int;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Invalid quantity';
    end if;

    select * into v_product from public.products where id = v_item ->> 'product_id' for update;
    if not found then
      raise exception 'A saree in your bag is no longer available';
    end if;
    if v_product.stock < v_qty then
      raise exception 'Only % left of %', v_product.stock, v_product.name;
    end if;

    update public.products set stock = stock - v_qty where id = v_product.id;
    insert into public.order_items (order_id, product_id, name, price, qty)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_qty);
    v_total := v_total + v_product.price * v_qty;
  end loop;

  update public.orders set total = v_total where id = v_order_id;
  delete from public.cart_items where user_id = auth.uid();
  return v_order_id;
end;
$$;

revoke all on function public.place_order(jsonb, jsonb, text) from public, anon;
grant execute on function public.place_order(jsonb, jsonb, text) to authenticated;

-- ---------- chatbot log (written by the chat Edge Function with the service role) ----------

create table public.chat_logs (
  id bigint generated always as identity primary key,
  user_message text not null,
  reply text not null,
  created_at timestamptz not null default now()
);

-- ---------- row level security ----------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.chat_logs enable row level security;

create policy "own profile or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "update own profile or admin" on public.profiles for update using (id = auth.uid() or public.is_admin());

create policy "categories are public" on public.categories for select using (true);
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products are public" on public.products for select using (true);
create policy "admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "own cart" on public.cart_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wishlist" on public.wishlist for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own orders or admin" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "admins update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());

create policy "own order items or admin" on public.order_items for select using (
  public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

create policy "admins read chat logs" on public.chat_logs for select using (public.is_admin());

-- ---------- storage: product images ----------

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product images are public" on storage.objects for select using (bucket_id = 'product-images');
create policy "admins upload product images" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "admins update product images" on storage.objects for update using (bucket_id = 'product-images' and public.is_admin());
create policy "admins delete product images" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());

-- Generated by scripts/generate-seed.mjs from src/data/catalogue.ts. Sample catalogue.

insert into public.categories (slug, name, tagline, description, seo_title, seo_description, price_hint, featured, sort_order, art) values
  ('katan-silk', 'Katan Silk', 'Pure silk, timeless zari', 'Katan is the classic Banarasi: pure mulberry silk threads twisted together and woven with gold and silver zari. Rich, structured and heirloom-worthy, it is the first choice for brides and wedding rituals.', 'Pure Katan Silk Banarasi Sarees | Handwoven in Varanasi', 'Shop pure Katan silk Banarasi sarees handwoven in Varanasi with real and tested zari. Bridal, wedding and heirloom sarees with Silk Mark assurance.', '₹8,000 – ₹1,50,000+', true, 0, '{"base":"#8B2A1F","accent":"#E3C77E","border":"#C9A24A","motif":"paisley","backdrop":"#F3E3CF"}'::jsonb),
  ('tissue', 'Tissue', 'Shimmer of metallic threads', 'Tissue Banarasi sarees carry zari in the weft itself, giving the whole drape a soft metallic glow. Light yet crisp, they shine at festive evenings, Durga Puja and receptions.', 'Tissue Banarasi Sarees | Gold and Silver Zari Tissue Silk', 'Discover tissue Banarasi sarees with gold and silver zari woven through the weft. Lightweight festive and reception sarees from Varanasi.', '₹6,000 – ₹50,000', true, 1, '{"base":"#6B3F26","accent":"#E3C77E","border":"#B9874A","motif":"jaal","backdrop":"#E07A1F"}'::jsonb),
  ('organza', 'Organza', 'Light as the morning ghat', 'Organza (Kora) Banarasi sarees pair a sheer, crisp silk base with zari motifs. They are airy, easy to carry and perfect for sangeet, receptions and summer weddings.', 'Organza Banarasi Sarees | Kora Silk with Zari', 'Shop sheer organza (Kora) Banarasi sarees with zari butis and borders. Lightweight sarees for sangeet, receptions and summer weddings.', '₹5,000 – ₹40,000', true, 2, '{"base":"#E07A1F","accent":"#F6D58A","border":"#C9A24A","motif":"buti","backdrop":"#6B3F26"}'::jsonb),
  ('georgette', 'Georgette', 'Fluid drape, everyday grace', 'Banarasi georgette sarees are light and flowing, with woven zari motifs on a soft crinkled base. The easiest Banarasi to drape, ideal for parties and first-time saree wearers.', 'Banarasi Georgette Sarees | Lightweight Party Wear', 'Lightweight Banarasi georgette sarees with zari weaving. Easy-to-drape party and festive sarees, perfect for first-time saree wearers.', '₹3,000 – ₹25,000', true, 3, '{"base":"#2F4A6B","accent":"#E3C77E","border":"#C9A24A","motif":"buti","backdrop":"#F3E3CF"}'::jsonb),
  ('shattir', 'Shattir', 'Quiet silk, modern lines', 'Shattir is a plain-weave silk with minimal, modern Banarasi designs. Comfortable and understated, it suits office events, festive days and gifting.', 'Shattir Banarasi Silk Sarees | Minimal Modern Designs', 'Shop Shattir Banarasi silk sarees with minimal modern designs. Comfortable, understated sarees for office events, festivals and gifting.', '₹3,000 – ₹15,000', false, 4, '{"base":"#5A5A66","accent":"#D9C08A","border":"#B39A5C","motif":"stripe","backdrop":"#F3E3CF"}'::jsonb),
  ('silk-cotton', 'Silk Cotton', 'Breathable, everyday Banaras', 'Silk-cotton Banarasi sarees blend breathable cotton with silk and zari motifs. Easy on the budget and the body, they are made for daily wear and warm weather.', 'Silk Cotton Banarasi Sarees | Breathable Daily Wear', 'Breathable silk-cotton Banarasi sarees with zari motifs. Affordable, comfortable sarees for daily and office wear in warm weather.', '₹1,500 – ₹8,000', false, 5, '{"base":"#D9B23A","accent":"#8B2A1F","border":"#8B2A1F","motif":"buti","backdrop":"#F3E3CF"}'::jsonb)
on conflict (slug) do nothing;

insert into public.products (id, slug, name, category_slug, colour, price, mrp, stock, fabric, zari, weave, occasions, weight_grams, description, care, has_blouse_piece, badge, featured, images, art, created_at) values
  ('kesariya-buti', 'kesariya-buti-katan-silk-saffron', 'Kesariya Buti', 'katan-silk', 'Saffron', 18500, 21000, 6, 'Pure Katan silk', 'Tested zari', 'Handloom, Kadhua', array['Wedding', 'Festive']::text[], 720, 'A saffron Katan silk saree scattered with hand-woven zari butis and a deep floral border. Each buti is woven separately on the handloom (Kadhua), leaving a clean reverse.', 'Dry clean only. Store wrapped in muslin and refold every few months.', true, 'Bestseller', true, array[]::text[], '{"base":"#E07A1F","accent":"#F2C766","border":"#C9A24A","motif":"buti","backdrop":"#6B3F26"}'::jsonb, '2026-09-01T00:00:00Z'),
  ('sindoori-kalga', 'sindoori-kalga-katan-silk-brick-red', 'Sindoori Kalga', 'katan-silk', 'Brick Red', 24900, 27500, 4, 'Pure Katan silk', 'Tested zari', 'Handloom, Kadhua', array['Bridal', 'Wedding']::text[], 780, 'Sindoor-red Katan silk with small kalga (paisley) motifs and a broad paisley pallu in gold zari. A bridal classic for pheras and family heirlooms.', 'Dry clean only. Keep away from perfume and moisture.', true, 'New', true, array[]::text[], '{"base":"#7A1F1B","accent":"#E3C77E","border":"#C9A24A","motif":"paisley","backdrop":"#F3E3CF"}'::jsonb, '2026-10-10T00:00:00Z'),
  ('mitti-jaal', 'mitti-jaal-tissue-earth-brown', 'Mitti Jaal', 'tissue', 'Earth Brown', 16800, 18500, 5, 'Silk tissue', 'Tested zari (copper tone)', 'Handloom, Jaal', array['Festive', 'Reception']::text[], 560, 'An earth-brown tissue saree covered in a floral jaal (net) of copper-toned zari, finished with a shimmering tissue border.', 'Dry clean only. Fold with the zari side in.', true, null, true, array[]::text[], '{"base":"#4A2C1E","accent":"#D8A66A","border":"#B9874A","motif":"jaal","backdrop":"#E07A1F"}'::jsonb, '2026-10-05T00:00:00Z'),
  ('ghat-sandhya', 'ghat-sandhya-organza-saffron', 'Ghat Sandhya', 'organza', 'Saffron', 12400, 13800, 8, 'Organza (Kora) silk', 'Tested zari', 'Handloom, Cutwork', array['Sangeet', 'Reception']::text[], 420, 'Sheer saffron organza that glows like the ghats at dusk, woven with zari butis and a floral border.', 'Dry clean only. Iron on low heat with a cloth in between.', true, null, true, array[]::text[], '{"base":"#E2762A","accent":"#F6D58A","border":"#C9A24A","motif":"buti","backdrop":"#5A3420"}'::jsonb, '2026-10-01T00:00:00Z'),
  ('panna-bagh', 'panna-bagh-katan-silk-emerald', 'Panna Bagh', 'katan-silk', 'Emerald', 42000, 46000, 2, 'Pure Katan silk', 'Real zari (silver, gold-plated)', 'Handloom, Jangla', array['Bridal', 'Heirloom']::text[], 900, 'An emerald Katan silk woven all over with a jangla of vines and blossoms in real zari. Takes weeks on the loom.', 'Dry clean only. Store flat in muslin; avoid hangers.', true, null, false, array[]::text[], '{"base":"#1F5A45","accent":"#E3C77E","border":"#C9A24A","motif":"jaal","backdrop":"#F3E3CF"}'::jsonb, '2026-09-01T00:00:00Z'),
  ('ganga-aarti', 'ganga-aarti-tissue-gold', 'Ganga Aarti', 'tissue', 'Gold', 14500, 16000, 7, 'Silk tissue', 'Tested zari', 'Handloom', array['Festive', 'Puja']::text[], 520, 'A golden tissue saree with a maroon border, made for evening aartis, Diwali and Durga Puja.', 'Dry clean only.', true, 'Bestseller', false, array[]::text[], '{"base":"#C9A24A","accent":"#FFF1C2","border":"#8B2A1F","motif":"stripe","backdrop":"#F3E3CF"}'::jsonb, '2026-09-01T00:00:00Z'),
  ('chandni-ghat', 'chandni-ghat-tissue-silver', 'Chandni Ghat', 'tissue', 'Silver', 13200, 14500, 3, 'Silk tissue', 'Tested silver zari', 'Handloom', array['Reception', 'Cocktail']::text[], 500, 'Moonlit silver tissue with fine silver zari butis, a quieter shimmer for evening receptions.', 'Dry clean only.', true, null, false, array[]::text[], '{"base":"#9EA3AE","accent":"#F4F4F4","border":"#6F7480","motif":"buti","backdrop":"#2F3A4A"}'::jsonb, '2026-09-01T00:00:00Z'),
  ('haldi-phool', 'haldi-phool-organza-yellow', 'Haldi Phool', 'organza', 'Turmeric Yellow', 8900, 9900, 10, 'Organza (Kora) silk', 'Tested zari', 'Powerloom, Cutwork', array['Haldi', 'Mehendi']::text[], 380, 'Turmeric-yellow organza with marigold butis, made for haldi and mehendi mornings.', 'Dry clean only.', true, 'New', false, array[]::text[], '{"base":"#E7B52C","accent":"#FFF0B3","border":"#C47A12","motif":"buti","backdrop":"#8B2A1F"}'::jsonb, '2026-10-12T00:00:00Z'),
  ('neel-kamal', 'neel-kamal-georgette-indigo', 'Neel Kamal', 'georgette', 'Indigo', 7600, 8500, 12, 'Pure georgette', 'Tested zari', 'Handloom', array['Party', 'Festive']::text[], 360, 'Deep indigo georgette with lotus butis in zari. Light and fluid, an easy first Banarasi.', 'Dry clean recommended.', true, null, false, array[]::text[], '{"base":"#2F4A6B","accent":"#E3C77E","border":"#C9A24A","motif":"buti","backdrop":"#F3E3CF"}'::jsonb, '2026-09-01T00:00:00Z'),
  ('gulabi-shaam', 'gulabi-shaam-georgette-rose', 'Gulabi Shaam', 'georgette', 'Rose Pink', 6800, 7500, 9, 'Pure georgette', 'Tested zari', 'Handloom', array['Party', 'Engagement']::text[], 340, 'Soft rose georgette with a delicate zari jaal and slim border for evening parties.', 'Dry clean recommended.', true, null, false, array[]::text[], '{"base":"#D9768A","accent":"#F7E3B0","border":"#B9874A","motif":"jaal","backdrop":"#F3E3CF"}'::jsonb, '2026-09-01T00:00:00Z'),
  ('shyam-megh', 'shyam-megh-shattir-slate', 'Shyam Megh', 'shattir', 'Slate Grey', 5400, 6000, 11, 'Shattir silk', 'Tested zari', 'Powerloom', array['Office', 'Gifting']::text[], 450, 'Monsoon-grey Shattir silk with fine zari stripes, understated for office events and gifting.', 'Dry clean recommended.', true, null, false, array[]::text[], '{"base":"#5A5A66","accent":"#D9C08A","border":"#B39A5C","motif":"stripe","backdrop":"#F3E3CF"}'::jsonb, '2026-09-01T00:00:00Z'),
  ('amrit-kesar', 'amrit-kesar-silk-cotton-mustard', 'Amrit Kesar', 'silk-cotton', 'Mustard', 3200, 3600, 15, 'Silk-cotton', 'Imitation zari', 'Powerloom', array['Daily', 'Office']::text[], 400, 'Breathable mustard silk-cotton with maroon butis. A comfortable everyday Banarasi.', 'Gentle hand wash in cold water or dry clean.', true, null, false, array[]::text[], '{"base":"#D9B23A","accent":"#8B2A1F","border":"#8B2A1F","motif":"buti","backdrop":"#F3E3CF"}'::jsonb, '2026-09-01T00:00:00Z')
on conflict (id) do nothing;
