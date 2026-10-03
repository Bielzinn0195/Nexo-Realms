# Multiplayer Plan

## Arena
Initial format: 1v1.
Queues:
- Casual
- Ranked
- Private room

Matchmaking considers rating, region and latency.

## Authoritative flow
1. Client authenticates.
2. Client requests matchmaking.
3. Server assigns a room.
4. Clients send input.
5. Server simulates/validates combat state.
6. Server publishes snapshots.
7. Server calculates the result.
8. Backend persists rating and match history.

## Boss Rush
Boss Rush is primarily PvE, but completion score/time is validated by the server when connected. Scores feed difficulty-specific leaderboards.

## Regions
Architecture is ready for South America, North America, Europe and Asia. Initial deployment can target South America.

## Anti-cheat
Validate movement, cooldowns, resources, damage, impossible state transitions and suspicious repeated behavior.
