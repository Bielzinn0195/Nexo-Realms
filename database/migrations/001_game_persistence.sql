-- NEXO REALMS persistence blueprint. Apply only after Supabase project/auth is configured.
create table if not exists public.game_save_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slot smallint not null check (slot between 1 and 3),
  character_name text not null,
  game_class text not null check (game_class in ('cavaleiro','arqueiro','mago')),
  level integer not null default 1 check (level >= 1),
  area_id text not null,
  checkpoint_id text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id,slot)
);
create index if not exists game_save_slots_user_idx on public.game_save_slots(user_id);
alter table public.game_save_slots enable row level security;
create policy "save slots are private" on public.game_save_slots for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

create table if not exists public.arena_ratings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  season_id text not null,
  rating integer not null default 1000,
  wins integer not null default 0,
  losses integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.arena_ratings enable row level security;
create policy "own rating writable" on public.arena_ratings for insert with check (auth.uid()=user_id);
create policy "own rating updatable" on public.arena_ratings for update using (auth.uid()=user_id) with check (auth.uid()=user_id);

create table if not exists public.boss_rush_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  season_id text not null,
  difficulty text not null,
  score integer not null,
  elapsed_ms integer not null,
  created_at timestamptz not null default now()
);
create index if not exists boss_rush_leaderboard_idx on public.boss_rush_scores(season_id,difficulty,score desc);
alter table public.boss_rush_scores enable row level security;
create policy "boss rush scores readable" on public.boss_rush_scores for select using (true);
create policy "own boss rush score insert" on public.boss_rush_scores for insert with check (auth.uid()=user_id);
