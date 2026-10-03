# Persistence Model

Planned Supabase tables:

- profiles
- game_characters
- game_save_slots
- game_inventory
- game_equipment
- game_achievements
- arena_seasons
- arena_ratings
- arena_matches
- arena_players
- boss_rush_seasons
- boss_rush_runs
- boss_rush_scores
- leaderboards
- rewards
- reward_claims

Competitive writes must originate from trusted backend/server logic.


## Security hardening

Apply migrations 001 → 002 → 003 on the dedicated NEXO REALMS Supabase project. Migration 003 removes client write policies from authoritative competitive tables, adds leaderboard/save indexes, and seeds `season-2026-10`. Never apply these migrations to the separate NEXO streaming project.
