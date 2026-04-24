create extension if not exists pgcrypto;

create table if not exists public.saved_skin_structure_pairings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  note text not null default '',
  structural_id text not null,
  skin_id text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.saved_skin_structure_pairings
add column if not exists note text not null default '';

alter table public.saved_skin_structure_pairings enable row level security;

create policy "Users can read their own saved pairings"
on public.saved_skin_structure_pairings
for select
using (auth.uid() = user_id);

create policy "Users can insert their own saved pairings"
on public.saved_skin_structure_pairings
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own saved pairings"
on public.saved_skin_structure_pairings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own saved pairings"
on public.saved_skin_structure_pairings
for delete
using (auth.uid() = user_id);

create table if not exists public.saved_hvac_scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  note text not null default '',
  option_id text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.saved_hvac_scenarios
add column if not exists note text not null default '';

alter table public.saved_hvac_scenarios enable row level security;

create policy "Users can read their own saved HVAC scenarios"
on public.saved_hvac_scenarios
for select
using (auth.uid() = user_id);

create policy "Users can insert their own saved HVAC scenarios"
on public.saved_hvac_scenarios
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own saved HVAC scenarios"
on public.saved_hvac_scenarios
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own saved HVAC scenarios"
on public.saved_hvac_scenarios
for delete
using (auth.uid() = user_id);

create table if not exists public.saved_guardrail_scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  note text not null default '',
  option_id text not null,
  mount_type text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.saved_guardrail_scenarios
add column if not exists note text not null default '';

alter table public.saved_guardrail_scenarios enable row level security;

create policy "Users can read their own saved guardrail scenarios"
on public.saved_guardrail_scenarios
for select
using (auth.uid() = user_id);

create policy "Users can insert their own saved guardrail scenarios"
on public.saved_guardrail_scenarios
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own saved guardrail scenarios"
on public.saved_guardrail_scenarios
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own saved guardrail scenarios"
on public.saved_guardrail_scenarios
for delete
using (auth.uid() = user_id);
