-- NEXO REALMS: deny client writes to authoritative competitive tables and add FK indexes.
drop policy if exists "save slots are private" on public.game_save_slots;
create policy "save slots are private" on public.game_save_slots for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

drop policy if exists "own reward claims are readable" on public.reward_claims;
create policy "own reward claims are readable" on public.reward_claims for select using ((select auth.uid())=user_id);
drop policy if exists "own reward claim insert" on public.reward_claims;
create policy "own reward claim insert" on public.reward_claims for insert with check ((select auth.uid())=user_id);

create policy "arena matches are server only" on public.arena_matches for all to anon, authenticated using (false) with check (false);
create policy "arena ratings are server only" on public.arena_ratings for all to anon, authenticated using (false) with check (false);
create policy "boss rush runs are server only" on public.boss_rush_runs for all to anon, authenticated using (false) with check (false);

create index if not exists arena_matches_player_a_idx on public.arena_matches(player_a);
create index if not exists arena_matches_player_b_idx on public.arena_matches(player_b);
create index if not exists arena_matches_winner_idx on public.arena_matches(winner);
create index if not exists boss_rush_runs_user_idx on public.boss_rush_runs(user_id);
create index if not exists boss_rush_scores_user_idx on public.boss_rush_scores(user_id);
create index if not exists leaderboards_user_idx on public.leaderboards(user_id);
create index if not exists reward_claims_approved_by_idx on public.reward_claims(approved_by);
create index if not exists reward_claims_user_idx on public.reward_claims(user_id);
