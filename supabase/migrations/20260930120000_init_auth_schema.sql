-- Purpose: Create per-user tables for profiles, brokerage connections, and holdings, locked down with row level security.

-- Keeps updated_at current on every row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- One profile per auth user; created automatically on sign-up.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  investing_goal text,
  risk_tolerance text check (risk_tolerance in ('conservative', 'balanced', 'growth', 'aggressive')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A brokerage or exchange account the user has linked (Wealthsimple, Robinhood, Coinbase, ...).
create table public.brokerage_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  provider text not null,
  status text not null default 'pending' check (status in ('pending', 'connected', 'error', 'disconnected')),
  account_name text,
  external_account_id text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Positions held by the user, either synced from a connection or entered manually (connection_id null).
create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  connection_id uuid references public.brokerage_connections (id) on delete set null,
  symbol text not null,
  name text,
  quantity numeric not null check (quantity >= 0),
  average_cost numeric check (average_cost >= 0),
  asset_type text,
  platform text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index brokerage_connections_user_id_idx on public.brokerage_connections (user_id);
create index holdings_user_id_idx on public.holdings (user_id);
create index holdings_connection_id_idx on public.holdings (connection_id);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger brokerage_connections_set_updated_at before update on public.brokerage_connections
  for each row execute function public.set_updated_at();
create trigger holdings_set_updated_at before update on public.holdings
  for each row execute function public.set_updated_at();

-- Row level security: every user can only see and change their own rows.
alter table public.profiles enable row level security;
alter table public.brokerage_connections enable row level security;
alter table public.holdings enable row level security;

create policy "Users read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users read own connections" on public.brokerage_connections
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add own connections" on public.brokerage_connections
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own connections" on public.brokerage_connections
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own connections" on public.brokerage_connections
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users read own holdings" on public.holdings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add own holdings" on public.holdings
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own holdings" on public.holdings
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own holdings" on public.holdings
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Create the profile row when a user signs up, copying the name they entered.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
