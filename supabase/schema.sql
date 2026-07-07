-- KinGraph schema. Run in the Supabase SQL editor.
-- Requires Supabase Auth (email/password enabled in Authentication settings).
--
-- Modeling notes:
--  * Every row is owned by a user (owner_id defaults to the signed-in user).
--  * 'parent' | 'adopted' | 'guardian' are DIRECTED: from_id = parent-figure, to_id = child.
--  * 'spouse' is symmetric: one row per couple (the app normalizes the pair order).
--  * Siblings are DERIVED from shared parents and never stored.

create table if not exists trees (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists members (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tree_id     uuid not null references trees(id) on delete cascade,
  name        text not null,
  gender      text check (gender in ('male', 'female', 'other')),
  photo_url   text,
  birth_date  date,
  death_date  date,
  occupation  text,
  notes       text,
  pos_x       double precision not null default 0,
  pos_y       double precision not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists relationships (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tree_id     uuid not null references trees(id) on delete cascade,
  from_id     uuid not null references members(id) on delete cascade,
  to_id       uuid not null references members(id) on delete cascade,
  type        text not null check (type in ('parent', 'spouse', 'adopted', 'guardian')),
  created_at  timestamptz not null default now(),
  constraint no_self_relationship check (from_id <> to_id),
  constraint unique_edge unique (from_id, to_id, type)
);

create index if not exists trees_owner_idx on trees (owner_id);
create index if not exists members_tree_idx on members (tree_id);
create index if not exists relationships_tree_idx on relationships (tree_id);
create index if not exists members_owner_idx on members (owner_id);
create index if not exists relationships_owner_idx on relationships (owner_id);
create index if not exists relationships_from_idx on relationships (from_id);
create index if not exists relationships_to_idx on relationships (to_id);

-- keep updated_at fresh
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trees_updated_at on trees;
create trigger trees_updated_at
  before update on trees
  for each row execute function set_updated_at();

drop trigger if exists members_updated_at on members;
create trigger members_updated_at
  before update on members
  for each row execute function set_updated_at();

-- Row Level Security: each user sees and edits only their own tree.
alter table trees enable row level security;
alter table members enable row level security;
alter table relationships enable row level security;

drop policy if exists "own trees" on trees;
create policy "own trees" on trees
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "own members" on members;
create policy "own members" on members
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "own relationships" on relationships;
create policy "own relationships" on relationships
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
