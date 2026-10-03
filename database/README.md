# NEXO REALMS database

The dedicated backend is the Supabase project `nexo-realms` (`wlrvjdxjburoaqbiikod`). Do not apply these migrations to the separate NEXO streaming database.

Repository migration order:

1. `001_game_persistence.sql`
2. `002_competitive_and_rewards.sql`
3. `003_authoritative_competitive_security.sql`
4. `004_competitive_access_lockdown.sql`
5. `005_test_seed_rewards.sql`

The management-side test database currently contains the equivalent migrations under its recorded names and has the initial Eclipse season and nine test reward definitions seeded.

## Security model

- Save slots are private to the authenticated user.
- Competitive write tables are server-only for anon/authenticated clients; the Colyseus backend uses the server-side secret.
- Public seasons, leaderboards and rewards are readable.
- Reward claims are readable/creatable only for the owning user.
- The client never uses a service-role/secret key.

## Local setup

Copy `.env.example` to `.env.local` or your preferred local environment file.

For the game client, the publishable key is safe for browser use and protected by RLS. The multiplayer server's `SUPABASE_SECRET_KEY` is intentionally blank in the example and must never be committed.

Before online persistence testing, verify Auth, client sign-in, the server-side secret, season `season-2026-10`, and Supabase advisors.

## Test data

The database is seeded with Arena, Boss Rush and Tower rewards for season `season-2026-10`. This is QA seed data and can be replaced with production season data later.