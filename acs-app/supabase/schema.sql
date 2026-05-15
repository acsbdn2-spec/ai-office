-- ============================================================
-- ACS Business Suite — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'sales' check (role in ('admin','sales','telecaller','support')),
  is_active   boolean not null default true,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

-- Anyone can read their own profile; admins see all
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'sales')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ──────────────────────────────────────────────────────────────
-- PRODUCTS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.products (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  category       text,
  brand          text,
  variant        text,
  eu_price       numeric(12,2) default 0,
  cost_price     numeric(12,2) default 0,
  renewal_price  numeric(12,2) default 0,
  renewal_cost   numeric(12,2) default 0,
  plan_variants  jsonb,
  specs          text,
  is_active      boolean not null default true,
  created_at     timestamptz default now()
);

alter table public.products enable row level security;
create policy "Authenticated can read products" on public.products for select using (auth.role() = 'authenticated');
create policy "Admins can manage products"      on public.products for all    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ──────────────────────────────────────────────────────────────
-- CLIENTS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  phone            text,
  whatsapp         text,
  business_type    text,
  products_used    text,
  start_date       date,
  expiry_date      date,
  amount_ex_gst    numeric(12,2),
  amount_incl_gst  numeric(12,2),
  notes            text,
  created_by       uuid references auth.users(id),
  created_at       timestamptz default now()
);

alter table public.clients enable row level security;
create policy "Staff can read clients"  on public.clients for select using (auth.role() = 'authenticated');
create policy "Staff can insert clients" on public.clients for insert with check (auth.role() = 'authenticated');
create policy "Staff can update clients" on public.clients for update using (auth.role() = 'authenticated');
create policy "Admins can delete clients" on public.clients for delete using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ──────────────────────────────────────────────────────────────
-- QUOTES
-- ──────────────────────────────────────────────────────────────
create table if not exists public.quotes (
  id             uuid primary key default uuid_generate_v4(),
  client_id      uuid references public.clients(id),
  client_name    text,
  business_type  text,
  users          int default 1,
  items          jsonb not null default '[]',
  total_eu       numeric(12,2) default 0,
  total_cost     numeric(12,2) default 0,
  total_profit   numeric(12,2) default 0,
  gst_included   boolean default false,
  notes          text,
  validity_date  date,
  status         text default 'draft' check (status in ('draft','sent','accepted','rejected')),
  created_by     uuid references auth.users(id),
  created_at     timestamptz default now()
);

alter table public.quotes enable row level security;
create policy "Staff can read own quotes"   on public.quotes for select using (created_by = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Staff can insert quotes"     on public.quotes for insert with check (auth.role() = 'authenticated');
create policy "Staff can update own quotes" on public.quotes for update using (created_by = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ──────────────────────────────────────────────────────────────
-- CALL LOGS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.call_logs (
  id               uuid primary key default uuid_generate_v4(),
  client_id        uuid references public.clients(id),
  telecaller_id    uuid references auth.users(id),
  called_at        timestamptz default now(),
  outcome          text,
  notes            text,
  callback_date    date,
  duration_seconds int
);

alter table public.call_logs enable row level security;
create policy "Telecallers see own logs" on public.call_logs for select using (telecaller_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Telecallers can insert logs" on public.call_logs for insert with check (auth.role() = 'authenticated');


-- ──────────────────────────────────────────────────────────────
-- TELECALLER SESSIONS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.telecaller_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id),
  login_at    timestamptz default now(),
  logout_at   timestamptz,
  total_calls int default 0
);

alter table public.telecaller_sessions enable row level security;
create policy "Users see own sessions" on public.telecaller_sessions for select using (user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Users can manage own sessions" on public.telecaller_sessions for all using (user_id = auth.uid());


-- ──────────────────────────────────────────────────────────────
-- TICKETS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.tickets (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  client_id    uuid references public.clients(id),
  description  text,
  priority     text default 'Medium' check (priority in ('Low','Medium','High','Urgent')),
  category     text default 'Technical' check (category in ('Technical','Billing','New requirement','General')),
  status       text default 'open' check (status in ('open','in_progress','pending_client','resolved','closed')),
  assigned_to  uuid references auth.users(id),
  created_by   uuid references auth.users(id),
  created_at   timestamptz default now(),
  resolved_at  timestamptz
);

alter table public.tickets enable row level security;
create policy "Staff can see assigned or own tickets"
  on public.tickets for select
  using (
    created_by = auth.uid()
    or assigned_to = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "Authenticated can create tickets" on public.tickets for insert with check (auth.role() = 'authenticated');
create policy "Staff can update assigned tickets" on public.tickets for update using (
  assigned_to = auth.uid() or created_by = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);


-- ──────────────────────────────────────────────────────────────
-- TICKET COMMENTS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.ticket_comments (
  id         uuid primary key default uuid_generate_v4(),
  ticket_id  uuid references public.tickets(id) on delete cascade,
  user_id    uuid references auth.users(id),
  comment    text not null,
  created_at timestamptz default now()
);

alter table public.ticket_comments enable row level security;
create policy "Staff can read ticket comments"
  on public.ticket_comments for select
  using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and (t.created_by = auth.uid() or t.assigned_to = auth.uid()
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    )
  );
create policy "Authenticated can add comments" on public.ticket_comments for insert with check (auth.role() = 'authenticated');


-- ──────────────────────────────────────────────────────────────
-- INDEXES for performance
-- ──────────────────────────────────────────────────────────────
create index if not exists idx_clients_expiry    on public.clients(expiry_date);
create index if not exists idx_clients_name      on public.clients(name);
create index if not exists idx_quotes_created_by on public.quotes(created_by);
create index if not exists idx_tickets_status    on public.tickets(status);
create index if not exists idx_tickets_assigned  on public.tickets(assigned_to);
create index if not exists idx_call_logs_caller  on public.call_logs(telecaller_id);
