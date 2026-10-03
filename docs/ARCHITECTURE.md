# Architecture

## Client
Phaser 3 + TypeScript + Vite.

Responsibilities:
- rendering
- local input
- camera
- UI
- presentation
- client prediction where appropriate

## Multiplayer
Colyseus + Node.js/TypeScript.

Responsibilities:
- authoritative room state
- matchmaking
- combat validation
- player state
- result calculation
- anti-cheat checks

The client sends intentions/input. The server owns authoritative competitive outcomes.

## Persistence
Supabase PostgreSQL/Auth will store:
- profiles
- characters
- save slots
- inventory/equipment
- quests
- rankings
- seasons
- rewards

Supabase is not used as the real-time combat transport.

## Security
Never trust client-provided:
- damage
- score
- cooldown completion
- movement speed
- match result
- rank changes
