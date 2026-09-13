-- ============================================================================
-- Sama-sama / ONETRAV — full database setup
-- Run this once on a FRESH Supabase project (ONETRAV) via the SQL Editor.
-- It reproduces the exact schema, RLS, functions, triggers and storage buckets
-- from the original sama-sama project, in dependency order.
-- Dashboard > SQL Editor > New query > paste all > Run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 01 · enums_and_group_core
-- ---------------------------------------------------------------------------
create type member_role as enum ('owner','admin','treasurer','member');
create type member_status as enum ('active','invited','removed');
create type trip_status as enum ('planning','funding','ready','ongoing','completed','cancelled');
create type cost_type as enum ('fixed','per_person','quantity');
create type contribution_status as enum ('pending','verified','rejected','refunded','cancelled');
create type expense_status as enum ('draft','recorded','adjusted');
create type item_category as enum ('transportation','accommodation','food','snacks','activity','entrance','shopping','other');
create type payment_status as enum ('unpaid','partial','paid');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index groups_owner_idx on groups(owner_id);

create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role member_role not null default 'member',
  status member_status not null default 'active',
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);
create index group_members_group_idx on group_members(group_id);
create index group_members_user_idx on group_members(user_id);

-- ---------------------------------------------------------------------------
-- 02 · trip_itinerary_budget
-- ---------------------------------------------------------------------------
create table trips (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  description text,
  destination text,
  start_date date,
  end_date date,
  funding_deadline date,
  status trip_status not null default 'planning',
  cover_seed text,
  cover_image_url text,
  target_centavos bigint not null default 0 check (target_centavos >= 0),
  created_by uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index trips_group_idx on trips(group_id);

create table trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  contribution_target_centavos bigint not null default 0 check (contribution_target_centavos >= 0),
  participation_status text not null default 'going',
  unique (trip_id, user_id)
);
create index trip_members_trip_idx on trip_members(trip_id);
create index trip_members_user_idx on trip_members(user_id);

create table itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  date date,
  title text,
  sort_order int not null default 0
);
create index itinerary_days_trip_idx on itinerary_days(trip_id);

create table itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_day_id uuid not null references itinerary_days(id) on delete cascade,
  trip_id uuid not null references trips(id) on delete cascade,
  title text not null,
  description text,
  start_time text,
  end_time text,
  location text,
  category item_category not null default 'other',
  cost_type cost_type not null default 'fixed',
  quantity int not null default 1 check (quantity >= 0),
  unit_price_centavos bigint not null default 0 check (unit_price_centavos >= 0),
  estimated_centavos bigint not null default 0 check (estimated_centavos >= 0),
  actual_centavos bigint check (actual_centavos is null or actual_centavos >= 0),
  payment_status payment_status not null default 'unpaid',
  sort_order int not null default 0
);
create index itinerary_items_day_idx on itinerary_items(itinerary_day_id);
create index itinerary_items_trip_idx on itinerary_items(trip_id);

create table budget_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  category item_category not null default 'other',
  name text not null,
  description text,
  cost_type cost_type not null default 'fixed',
  quantity int not null default 1 check (quantity >= 0),
  unit_price_centavos bigint not null default 0 check (unit_price_centavos >= 0),
  estimated_centavos bigint not null default 0 check (estimated_centavos >= 0),
  actual_centavos bigint check (actual_centavos is null or actual_centavos >= 0),
  status text not null default 'estimated',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index budget_items_trip_idx on budget_items(trip_id);

-- ---------------------------------------------------------------------------
-- 03 · financial_and_activity
-- ---------------------------------------------------------------------------
create table contributions (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  member_user_id uuid not null references profiles(id) on delete restrict,
  amount_centavos bigint not null check (amount_centavos > 0),
  payment_method text,
  status contribution_status not null default 'pending',
  notes text,
  submitted_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references profiles(id) on delete set null
);
create index contributions_trip_idx on contributions(trip_id);
create index contributions_member_idx on contributions(member_user_id);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  itinerary_item_id uuid references itinerary_items(id) on delete set null,
  category item_category not null default 'other',
  description text not null,
  amount_centavos bigint not null check (amount_centavos >= 0),
  paid_by uuid references profiles(id) on delete set null,
  expense_date date,
  status expense_status not null default 'recorded',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index expenses_trip_idx on expenses(trip_id);

create table expense_participants (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  share_centavos bigint not null default 0 check (share_centavos >= 0),
  unique (expense_id, user_id)
);
create index expense_participants_expense_idx on expense_participants(expense_id);
create index expense_participants_trip_idx on expense_participants(trip_id);

create table settlements (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  from_user_id uuid not null references profiles(id) on delete restrict,
  to_user_id uuid not null references profiles(id) on delete restrict,
  amount_centavos bigint not null check (amount_centavos > 0),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  settled_at timestamptz
);
create index settlements_trip_idx on settlements(trip_id);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  trip_id uuid references trips(id) on delete cascade,
  actor_user_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_logs_trip_idx on activity_logs(trip_id, created_at desc);
create index activity_logs_group_idx on activity_logs(group_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 04 · triggers_updated_at_and_profile
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on profiles for each row execute function set_updated_at();
create trigger groups_set_updated_at before update on groups for each row execute function set_updated_at();
create trigger trips_set_updated_at before update on trips for each row execute function set_updated_at();
create trigger budget_items_set_updated_at before update on budget_items for each row execute function set_updated_at();
create trigger expenses_set_updated_at before update on expenses for each row execute function set_updated_at();

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- 05 · rls_helpers_and_policies
-- ---------------------------------------------------------------------------
create or replace function public.app_is_group_member(gid uuid) returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.group_members gm where gm.group_id = gid and gm.user_id = (select auth.uid()) and gm.status = 'active');
$$;

create or replace function public.app_is_group_owner(gid uuid) returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.groups g where g.id = gid and g.owner_id = (select auth.uid()));
$$;

create or replace function public.app_can_manage_group(gid uuid) returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.group_members gm where gm.group_id = gid and gm.user_id = (select auth.uid()) and gm.status = 'active' and gm.role in ('owner','admin'));
$$;

create or replace function public.app_is_trip_member(tid uuid) returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.trips t join public.group_members gm on gm.group_id = t.group_id where t.id = tid and gm.user_id = (select auth.uid()) and gm.status = 'active');
$$;

create or replace function public.app_trip_group(tid uuid) returns uuid language sql security definer stable set search_path = '' as $$
  select group_id from public.trips where id = tid;
$$;

create or replace function public.app_can_manage_trip_finance(tid uuid) returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.trips t join public.group_members gm on gm.group_id = t.group_id where t.id = tid and gm.user_id = (select auth.uid()) and gm.status = 'active' and gm.role in ('owner','admin','treasurer'));
$$;

alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table trips enable row level security;
alter table trip_members enable row level security;
alter table itinerary_days enable row level security;
alter table itinerary_items enable row level security;
alter table budget_items enable row level security;
alter table contributions enable row level security;
alter table expenses enable row level security;
alter table expense_participants enable row level security;
alter table settlements enable row level security;
alter table activity_logs enable row level security;

create policy profiles_select on profiles for select to authenticated using (true);
create policy profiles_insert_self on profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update_self on profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy groups_select on groups for select to authenticated using (public.app_is_group_member(id) or owner_id = (select auth.uid()));
create policy groups_insert on groups for insert to authenticated with check (owner_id = (select auth.uid()));
create policy groups_update on groups for update to authenticated using (public.app_can_manage_group(id)) with check (public.app_can_manage_group(id));
create policy groups_delete on groups for delete to authenticated using (owner_id = (select auth.uid()));

create policy gm_select on group_members for select to authenticated using (public.app_is_group_member(group_id));
create policy gm_insert on group_members for insert to authenticated with check (public.app_can_manage_group(group_id) or (user_id = (select auth.uid()) and public.app_is_group_owner(group_id)));
create policy gm_update on group_members for update to authenticated using (public.app_can_manage_group(group_id)) with check (public.app_can_manage_group(group_id));
create policy gm_delete on group_members for delete to authenticated using (public.app_can_manage_group(group_id) or user_id = (select auth.uid()));

create policy trips_select on trips for select to authenticated using (public.app_is_group_member(group_id));
create policy trips_insert on trips for insert to authenticated with check (public.app_is_group_member(group_id) and created_by = (select auth.uid()));
create policy trips_update on trips for update to authenticated using (public.app_can_manage_group(group_id) or created_by = (select auth.uid())) with check (public.app_can_manage_group(group_id) or created_by = (select auth.uid()));
create policy trips_delete on trips for delete to authenticated using (public.app_can_manage_group(group_id) or created_by = (select auth.uid()));

create policy tm_select on trip_members for select to authenticated using (public.app_is_trip_member(trip_id));
create policy tm_insert on trip_members for insert to authenticated with check (public.app_is_trip_member(trip_id));
create policy tm_update on trip_members for update to authenticated using (public.app_can_manage_trip_finance(trip_id) or user_id = (select auth.uid())) with check (public.app_can_manage_trip_finance(trip_id) or user_id = (select auth.uid()));
create policy tm_delete on trip_members for delete to authenticated using (public.app_can_manage_trip_finance(trip_id) or user_id = (select auth.uid()));

create policy id_select on itinerary_days for select to authenticated using (public.app_is_trip_member(trip_id));
create policy id_write on itinerary_days for all to authenticated using (public.app_is_trip_member(trip_id)) with check (public.app_is_trip_member(trip_id));

create policy ii_select on itinerary_items for select to authenticated using (public.app_is_trip_member(trip_id));
create policy ii_write on itinerary_items for all to authenticated using (public.app_is_trip_member(trip_id)) with check (public.app_is_trip_member(trip_id));

create policy bi_select on budget_items for select to authenticated using (public.app_is_trip_member(trip_id));
create policy bi_write on budget_items for all to authenticated using (public.app_is_trip_member(trip_id)) with check (public.app_is_trip_member(trip_id));

create policy con_select on contributions for select to authenticated using (public.app_is_trip_member(trip_id));
create policy con_insert on contributions for insert to authenticated with check (member_user_id = (select auth.uid()) and public.app_is_trip_member(trip_id));
create policy con_update on contributions for update to authenticated using (public.app_can_manage_trip_finance(trip_id)) with check (public.app_can_manage_trip_finance(trip_id));
create policy con_delete on contributions for delete to authenticated using (public.app_can_manage_trip_finance(trip_id) or (member_user_id = (select auth.uid()) and status = 'pending'));

create policy exp_select on expenses for select to authenticated using (public.app_is_trip_member(trip_id));
create policy exp_insert on expenses for insert to authenticated with check (public.app_is_trip_member(trip_id));
create policy exp_update on expenses for update to authenticated using (public.app_can_manage_trip_finance(trip_id) or created_by = (select auth.uid())) with check (public.app_can_manage_trip_finance(trip_id) or created_by = (select auth.uid()));
create policy exp_delete on expenses for delete to authenticated using (public.app_can_manage_trip_finance(trip_id) or created_by = (select auth.uid()));

create policy ep_select on expense_participants for select to authenticated using (public.app_is_trip_member(trip_id));
create policy ep_write on expense_participants for all to authenticated using (public.app_is_trip_member(trip_id)) with check (public.app_is_trip_member(trip_id));

create policy set_select on settlements for select to authenticated using (public.app_is_trip_member(trip_id));
create policy set_write on settlements for all to authenticated using (public.app_can_manage_trip_finance(trip_id)) with check (public.app_can_manage_trip_finance(trip_id));

create policy al_select on activity_logs for select to authenticated using ((trip_id is not null and public.app_is_trip_member(trip_id)) or (group_id is not null and public.app_is_group_member(group_id)));
create policy al_insert on activity_logs for insert to authenticated with check (actor_user_id = (select auth.uid()) and ((trip_id is not null and public.app_is_trip_member(trip_id)) or (group_id is not null and public.app_is_group_member(group_id))));

-- ---------------------------------------------------------------------------
-- 06 · harden_functions_private_schema
-- ---------------------------------------------------------------------------
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();
drop function if exists public.handle_new_user();

create or replace function private.app_is_group_member(gid uuid) returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.group_members gm where gm.group_id = gid and gm.user_id = (select auth.uid()) and gm.status = 'active');
$$;
create or replace function private.app_is_group_owner(gid uuid) returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.groups g where g.id = gid and g.owner_id = (select auth.uid()));
$$;
create or replace function private.app_can_manage_group(gid uuid) returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.group_members gm where gm.group_id = gid and gm.user_id = (select auth.uid()) and gm.status = 'active' and gm.role in ('owner','admin'));
$$;
create or replace function private.app_is_trip_member(tid uuid) returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.trips t join public.group_members gm on gm.group_id = t.group_id where t.id = tid and gm.user_id = (select auth.uid()) and gm.status = 'active');
$$;
create or replace function private.app_can_manage_trip_finance(tid uuid) returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.trips t join public.group_members gm on gm.group_id = t.group_id where t.id = tid and gm.user_id = (select auth.uid()) and gm.status = 'active' and gm.role in ('owner','admin','treasurer'));
$$;
grant execute on all functions in schema private to authenticated;

drop policy groups_select on groups;
drop policy groups_update on groups;
drop policy gm_select on group_members;
drop policy gm_insert on group_members;
drop policy gm_update on group_members;
drop policy gm_delete on group_members;
drop policy trips_select on trips;
drop policy trips_insert on trips;
drop policy trips_update on trips;
drop policy trips_delete on trips;
drop policy tm_select on trip_members;
drop policy tm_insert on trip_members;
drop policy tm_update on trip_members;
drop policy tm_delete on trip_members;
drop policy id_select on itinerary_days;
drop policy id_write on itinerary_days;
drop policy ii_select on itinerary_items;
drop policy ii_write on itinerary_items;
drop policy bi_select on budget_items;
drop policy bi_write on budget_items;
drop policy con_select on contributions;
drop policy con_insert on contributions;
drop policy con_update on contributions;
drop policy con_delete on contributions;
drop policy exp_select on expenses;
drop policy exp_insert on expenses;
drop policy exp_update on expenses;
drop policy exp_delete on expenses;
drop policy ep_select on expense_participants;
drop policy ep_write on expense_participants;
drop policy set_select on settlements;
drop policy set_write on settlements;
drop policy al_select on activity_logs;
drop policy al_insert on activity_logs;

drop function public.app_is_group_member(uuid);
drop function public.app_is_group_owner(uuid);
drop function public.app_can_manage_group(uuid);
drop function public.app_is_trip_member(uuid);
drop function public.app_can_manage_trip_finance(uuid);
drop function public.app_trip_group(uuid);

create policy groups_select on groups for select to authenticated using (private.app_is_group_member(id) or owner_id = (select auth.uid()));
create policy groups_update on groups for update to authenticated using (private.app_can_manage_group(id)) with check (private.app_can_manage_group(id));

create policy gm_select on group_members for select to authenticated using (private.app_is_group_member(group_id));
create policy gm_insert on group_members for insert to authenticated with check (private.app_can_manage_group(group_id) or (user_id = (select auth.uid()) and private.app_is_group_owner(group_id)));
create policy gm_update on group_members for update to authenticated using (private.app_can_manage_group(group_id)) with check (private.app_can_manage_group(group_id));
create policy gm_delete on group_members for delete to authenticated using (private.app_can_manage_group(group_id) or user_id = (select auth.uid()));

create policy trips_select on trips for select to authenticated using (private.app_is_group_member(group_id));
create policy trips_insert on trips for insert to authenticated with check (private.app_is_group_member(group_id) and created_by = (select auth.uid()));
create policy trips_update on trips for update to authenticated using (private.app_can_manage_group(group_id) or created_by = (select auth.uid())) with check (private.app_can_manage_group(group_id) or created_by = (select auth.uid()));
create policy trips_delete on trips for delete to authenticated using (private.app_can_manage_group(group_id) or created_by = (select auth.uid()));

create policy tm_select on trip_members for select to authenticated using (private.app_is_trip_member(trip_id));
create policy tm_insert on trip_members for insert to authenticated with check (private.app_is_trip_member(trip_id));
create policy tm_update on trip_members for update to authenticated using (private.app_can_manage_trip_finance(trip_id) or user_id = (select auth.uid())) with check (private.app_can_manage_trip_finance(trip_id) or user_id = (select auth.uid()));
create policy tm_delete on trip_members for delete to authenticated using (private.app_can_manage_trip_finance(trip_id) or user_id = (select auth.uid()));

create policy id_select on itinerary_days for select to authenticated using (private.app_is_trip_member(trip_id));
create policy id_write on itinerary_days for all to authenticated using (private.app_is_trip_member(trip_id)) with check (private.app_is_trip_member(trip_id));

create policy ii_select on itinerary_items for select to authenticated using (private.app_is_trip_member(trip_id));
create policy ii_write on itinerary_items for all to authenticated using (private.app_is_trip_member(trip_id)) with check (private.app_is_trip_member(trip_id));

create policy bi_select on budget_items for select to authenticated using (private.app_is_trip_member(trip_id));
create policy bi_write on budget_items for all to authenticated using (private.app_is_trip_member(trip_id)) with check (private.app_is_trip_member(trip_id));

create policy con_select on contributions for select to authenticated using (private.app_is_trip_member(trip_id));
create policy con_insert on contributions for insert to authenticated with check (member_user_id = (select auth.uid()) and private.app_is_trip_member(trip_id));
create policy con_update on contributions for update to authenticated using (private.app_can_manage_trip_finance(trip_id)) with check (private.app_can_manage_trip_finance(trip_id));
create policy con_delete on contributions for delete to authenticated using (private.app_can_manage_trip_finance(trip_id) or (member_user_id = (select auth.uid()) and status = 'pending'));

create policy exp_select on expenses for select to authenticated using (private.app_is_trip_member(trip_id));
create policy exp_insert on expenses for insert to authenticated with check (private.app_is_trip_member(trip_id));
create policy exp_update on expenses for update to authenticated using (private.app_can_manage_trip_finance(trip_id) or created_by = (select auth.uid())) with check (private.app_can_manage_trip_finance(trip_id) or created_by = (select auth.uid()));
create policy exp_delete on expenses for delete to authenticated using (private.app_can_manage_trip_finance(trip_id) or created_by = (select auth.uid()));

create policy ep_select on expense_participants for select to authenticated using (private.app_is_trip_member(trip_id));
create policy ep_write on expense_participants for all to authenticated using (private.app_is_trip_member(trip_id)) with check (private.app_is_trip_member(trip_id));

create policy set_select on settlements for select to authenticated using (private.app_is_trip_member(trip_id));
create policy set_write on settlements for all to authenticated using (private.app_can_manage_trip_finance(trip_id)) with check (private.app_can_manage_trip_finance(trip_id));

create policy al_select on activity_logs for select to authenticated using ((trip_id is not null and private.app_is_trip_member(trip_id)) or (group_id is not null and private.app_is_group_member(group_id)));
create policy al_insert on activity_logs for insert to authenticated with check (actor_user_id = (select auth.uid()) and ((trip_id is not null and private.app_is_trip_member(trip_id)) or (group_id is not null and private.app_is_group_member(group_id))));

-- ---------------------------------------------------------------------------
-- 07 · perf_indexes_and_policy_dedupe
-- ---------------------------------------------------------------------------
create index if not exists activity_logs_actor_idx on activity_logs(actor_user_id);
create index if not exists budget_items_created_by_idx on budget_items(created_by);
create index if not exists contributions_verified_by_idx on contributions(verified_by);
create index if not exists expense_participants_user_idx on expense_participants(user_id);
create index if not exists expenses_created_by_idx on expenses(created_by);
create index if not exists expenses_itinerary_item_idx on expenses(itinerary_item_id);
create index if not exists expenses_paid_by_idx on expenses(paid_by);
create index if not exists settlements_from_idx on settlements(from_user_id);
create index if not exists settlements_to_idx on settlements(to_user_id);
create index if not exists trips_created_by_idx on trips(created_by);

drop policy bi_select on budget_items;
drop policy ep_select on expense_participants;
drop policy id_select on itinerary_days;
drop policy ii_select on itinerary_items;

drop policy set_write on settlements;
create policy set_insert on settlements for insert to authenticated with check (private.app_can_manage_trip_finance(trip_id));
create policy set_update on settlements for update to authenticated using (private.app_can_manage_trip_finance(trip_id)) with check (private.app_can_manage_trip_finance(trip_id));
create policy set_delete on settlements for delete to authenticated using (private.app_can_manage_trip_finance(trip_id));

-- ---------------------------------------------------------------------------
-- 08 · public_ids_itinerary_categories_trip_fields
-- ---------------------------------------------------------------------------
create or replace function private.generate_public_id() returns text language plpgsql security definer set search_path = '' as $$
declare
  alphabet text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  candidate text;
  i int;
begin
  loop
    candidate := 'SAM-';
    for i in 1..5 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.profiles where public_id = candidate);
  end loop;
  return candidate;
end;
$$;

alter table profiles add column public_id text;
update profiles set public_id = private.generate_public_id() where public_id is null;
alter table profiles alter column public_id set not null;
alter table profiles add constraint profiles_public_id_key unique (public_id);

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, public_id)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1)),
    private.generate_public_id()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

alter table itinerary_items add column map_link text;
alter table itinerary_items add column notes text;
alter table itinerary_items add column status text not null default 'planned';

alter table budget_items alter column category drop default;
alter table budget_items alter column category type text using category::text;
alter table budget_items alter column category set default 'other';

alter table itinerary_items alter column category drop default;
alter table itinerary_items alter column category type text using category::text;
alter table itinerary_items alter column category set default 'other';

alter table expenses alter column category drop default;
alter table expenses alter column category type text using category::text;
alter table expenses alter column category set default 'other';

alter table trips add column contribution_mode text not null default 'equal' check (contribution_mode in ('equal','custom'));

-- ---------------------------------------------------------------------------
-- 09 · invitations_and_join_policies
-- ---------------------------------------------------------------------------
create table invitations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  inviter_id uuid not null references profiles(id) on delete cascade,
  invitee_id uuid references profiles(id) on delete cascade,
  invitee_email text,
  role member_role not null default 'member',
  status text not null default 'pending' check (status in ('pending','accepted','declined','expired','cancelled')),
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  responded_at timestamptz
);
create index invitations_invitee_idx on invitations(invitee_id, status);
create index invitations_trip_idx on invitations(trip_id);
create unique index invitations_unique_pending on invitations(trip_id, invitee_id) where status = 'pending';

create or replace function private.has_pending_trip_invite(p_trip uuid) returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.invitations i where i.trip_id = p_trip and i.invitee_id = (select auth.uid()) and i.status = 'pending');
$$;
create or replace function private.has_pending_group_invite(p_group uuid) returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.invitations i join public.trips t on t.id = i.trip_id where t.group_id = p_group and i.invitee_id = (select auth.uid()) and i.status = 'pending');
$$;
grant execute on all functions in schema private to authenticated;

alter table invitations enable row level security;
create policy inv_select on invitations for select to authenticated using (invitee_id = (select auth.uid()) or private.app_is_trip_member(trip_id));
create policy inv_insert on invitations for insert to authenticated with check (inviter_id = (select auth.uid()) and private.app_is_trip_member(trip_id));
create policy inv_update on invitations for update to authenticated using (invitee_id = (select auth.uid()) or private.app_can_manage_trip_finance(trip_id)) with check (invitee_id = (select auth.uid()) or private.app_can_manage_trip_finance(trip_id));
create policy inv_delete on invitations for delete to authenticated using (private.app_can_manage_trip_finance(trip_id));

drop policy gm_insert on group_members;
create policy gm_insert on group_members for insert to authenticated with check (
  private.app_can_manage_group(group_id)
  or (user_id = (select auth.uid()) and private.app_is_group_owner(group_id))
  or (user_id = (select auth.uid()) and private.has_pending_group_invite(group_id))
);

drop policy tm_insert on trip_members;
create policy tm_insert on trip_members for insert to authenticated with check (
  private.app_is_trip_member(trip_id)
  or (user_id = (select auth.uid()) and private.has_pending_trip_invite(trip_id))
);

-- ---------------------------------------------------------------------------
-- 10 · storage_buckets_covers_avatars
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('trip-covers','trip-covers', true), ('avatars','avatars', true) on conflict (id) do nothing;

create policy "media public read" on storage.objects for select to public using (bucket_id in ('trip-covers','avatars'));
create policy "media authed insert" on storage.objects for insert to authenticated with check (bucket_id in ('trip-covers','avatars'));
create policy "media authed update" on storage.objects for update to authenticated using (bucket_id in ('trip-covers','avatars')) with check (bucket_id in ('trip-covers','avatars'));
create policy "media authed delete" on storage.objects for delete to authenticated using (bucket_id in ('trip-covers','avatars'));

-- ---------------------------------------------------------------------------
-- 11 · allow pending invitees to read the trip they were invited to
-- Without this, RLS hides the trip from a non-member invitee, so invitation
-- cards show "A trip" and accepting fails with "That trip no longer exists."
-- ---------------------------------------------------------------------------
create policy trips_select_invitee on trips
  for select to authenticated
  using (private.has_pending_trip_invite(id));

-- ============================================================================
-- Done. ONETRAV now matches the sama-sama schema.
-- ============================================================================
