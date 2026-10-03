-- NEXO REALMS competitive persistence.
-- Apply after 001_game_persistence.sql. Server-side writes should use a trusted
-- backend/service key; clients may only read public leaderboard rows permitted by RLS.

create table if not exists public.arena_seasons (
  id text primary key,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('scheduled','active','finished')),
  created_at timestamptz not null default now()
);

create table if not exists public.arena_matches (
  id uuid primary key default gen_random_uuid(),
  season_id text not null references public.arena_seasons(id),
  room_id text,
  player_a uuid references auth.users(id) on delete set null,
  player_b uuid references auth.users(id) on delete set null,
  winner uuid references auth.users(id) on delete set null,
  rating_a_before integer not null default 1000,
  rating_b_before integer not null default 1000,
  rating_a_after integer not null default 1000,
  rating_b_after integer not null default 1000,
  duration_ms integer not null default 0,
  reason text not null default 'knockout',
  created_at timestamptz not null default now()
);
create index if not exists arena_matches_season_idx on public.arena_matches(season_id, created_at desc);

create table if not exists public.boss_rush_seasons (
  id text primary key,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('scheduled','active','finished')),
  created_at timestamptz not null default now()
);

create table if not exists public.boss_rush_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  season_id text not null references public.boss_rush_seasons(id),
  difficulty text not null,
  score integer not null check (score >= 0),
  elapsed_ms integer not null check (elapsed_ms > 0),
  bosses_defeated integer not null default 0 check (bosses_defeated between 0 and 100),
  validation_status text not null default 'pending' check (validation_status in ('pending','validated','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists boss_rush_runs_leaderboard_idx
  on public.boss_rush_runs(season_id, difficulty, validation_status, score desc, elapsed_ms asc);

create table if not exists public.leaderboards (
  id uuid primary key default gen_random_uuid(),
  season_id text not null,
  game_mode text not null check (game_mode in ('arena','boss-rush','tower')),
  scope text not null default 'global' check (scope in ('global','country','region')),
  country_code text,
  region_code text,
  user_id uuid not null references auth.users(id) on delete cascade,
  position integer not null,
  score integer not null,
  rating integer,
  updated_at timestamptz not null default now(),
  unique(season_id, game_mode, scope, country_code, region_code, user_id)
);
create index if not exists leaderboards_lookup_idx
  on public.leaderboards(season_id, game_mode, scope, position);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  season_id text not null,
  game_mode text not null,
  position integer not null check (position between 1 and 3),
  reward_type text not null check (reward_type in ('cosmetic','title','frame','emote','currency','physical')),
  description text not null,
  created_at timestamptz not null default now(),
  unique(season_id, game_mode, position)
);

create table if not exists public.reward_claims (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.rewards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','delivered','rejected')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique(reward_id, user_id)
);

alter table public.arena_seasons enable row level security;
alter table public.arena_matches enable row level security;
alter table public.boss_rush_seasons enable row level security;
alter table public.boss_rush_runs enable row level security;
alter table public.leaderboards enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_claims enable row level security;

create policy "arena seasons are public" on public.arena_seasons for select using (true);
create policy "boss rush seasons are public" on public.boss_rush_seasons for select using (true);
create policy "leaderboards are public" on public.leaderboards for select using (true);
create policy "rewards are public" on public.rewards for select using (true);
create policy "own reward claims are readable" on public.reward_claims for select using (auth.uid() = user_id);
create policy "own reward claim insert" on public.reward_claims for insert with check (auth.uid() = user_id);
