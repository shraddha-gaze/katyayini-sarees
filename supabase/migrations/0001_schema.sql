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
