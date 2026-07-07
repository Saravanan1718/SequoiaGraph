-- KinGraph schema. Run in the Supabase SQL editor.
--
-- Modeling notes:
--  * 'parent' | 'adopted' | 'guardian' are DIRECTED: from_id = parent-figure, to_id = child.
--  * 'spouse' is symmetric: one row per couple (the app normalizes the pair order).
--  * Siblings are DERIVED from shared parents and never stored.

create table if not exists members (
  id          uuid primary key default gen_random_uuid(),
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
  from_id     uuid not null references members(id) on delete cascade,
  to_id       uuid not null references members(id) on delete cascade,
  type        text not null check (type in ('parent', 'spouse', 'adopted', 'guardian')),
  created_at  timestamptz not null default now(),
  constraint no_self_relationship check (from_id <> to_id),
  constraint unique_edge unique (from_id, to_id, type)
);

create index if not exists relationships_from_idx on relationships (from_id);
create index if not exists relationships_to_idx on relationships (to_id);

-- keep updated_at fresh
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists members_updated_at on members;
create trigger members_updated_at
  before update on members
  for each row execute function set_updated_at();

-- RLS: personal single-user project — the anon key may read/write.
-- If you later add Supabase Auth, add an owner_id column and replace these
-- policies with (auth.uid() = owner_id) checks.
alter table members enable row level security;
alter table relationships enable row level security;

create policy "anon full access members" on members
  for all using (true) with check (true);
create policy "anon full access relationships" on relationships
  for all using (true) with check (true);
