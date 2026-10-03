-- NEXO REALMS: authoritative competitive persistence hardening.
-- Apply only to the dedicated NEXO REALMS Supabase project after 001 and 002.
drop policy if exists "own rating writable" on public.arena_ratings;
drop policy if exists "own rating updatable" on public.arena_ratings;
drop policy if exists "own boss rush score insert" on public.boss_rush_scores;

create index if not exists arena_ratings_season_rating_idx
  on public.arena_ratings(season_id, rating desc);
create index if not exists game_save_slots_user_updated_idx
  on public.game_save_slots(user_id, updated_at desc);

insert into public.arena_seasons(id,name,starts_at,ends_at,status)
values ('season-2026-10','Season 2026 • Eclipse','2026-10-01T00:00:00Z','2026-12-31T23:59:59Z','active')
on conflict (id) do update set name=excluded.name, starts_at=excluded.starts_at, ends_at=excluded.ends_at, status=excluded.status;

insert into public.boss_rush_seasons(id,name,starts_at,ends_at,status)
values ('season-2026-10','Season 2026 • Eclipse','2026-10-01T00:00:00Z','2026-12-31T23:59:59Z','active')
on conflict (id) do update set name=excluded.name, starts_at=excluded.starts_at, ends_at=excluded.ends_at, status=excluded.status;

