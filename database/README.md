# NEXO REALMS database

Migration order:

1. `001_game_persistence.sql`
2. `002_competitive_and_rewards.sql`
3. `003_authoritative_competitive_security.sql`

These migrations are for the dedicated NEXO REALMS Supabase project. Do not apply them to the separate NEXO streaming database.

Before enabling online persistence, verify:
- Auth is enabled.
- Publishable key is configured in the client.
- Secret key exists only on the multiplayer server.
- The seeded `season-2026-10` exists.
- Security and performance advisors have been reviewed.
