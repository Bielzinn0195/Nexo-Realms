# NEXO REALMS

Standalone action RPG built before integration into NEXO.

## Direction
- 2D side-scrolling dark-fantasy world
- Real-time hack-and-slash combat
- Connected exploration instead of stage-by-stage progression
- Classes: Guardião, Errante, Arcanista
- Mobile, PC and controller input
- 3 cloud save slots
- Campaign, Arena PvP, Tower and Boss Rush
- Authoritative multiplayer architecture with Colyseus
- Supabase reserved for authentication and persistence

## Development rule
This repository is independent from `Bielzinn0195/Nexo`. No NEXO integration is performed until NEXO REALMS is tested and considered integration-ready.

## Workspace
```
apps/game-client       Phaser + TypeScript client
apps/multiplayer-server Colyseus server
packages/shared        shared types/constants
docs                   design and architecture
```

## First run
```bash
npm install
npm run dev
```
