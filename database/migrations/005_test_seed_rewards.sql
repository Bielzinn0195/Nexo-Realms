-- QA seed for the dedicated NEXO REALMS test season.
insert into public.rewards(season_id,game_mode,position,reward_type,description)
values
('season-2026-10','arena',1,'cosmetic','Cosmético exclusivo — Campeão do Eclipse'),
('season-2026-10','arena',2,'title','Título — Duelista do Eclipse'),
('season-2026-10','arena',3,'frame','Moldura — Arena Eclipse'),
('season-2026-10','boss-rush',1,'cosmetic','Cosmético exclusivo — Caçador de Chefes'),
('season-2026-10','boss-rush',2,'title','Título — Executor de Chefes'),
('season-2026-10','boss-rush',3,'frame','Moldura — Boss Rush'),
('season-2026-10','tower',1,'cosmetic','Cosmético exclusivo — Ascendente'),
('season-2026-10','tower',2,'title','Título — Mestre da Torre'),
('season-2026-10','tower',3,'frame','Moldura — Torre do Eclipse')
on conflict (season_id,game_mode,position) do update set reward_type=excluded.reward_type,description=excluded.description;
