# NEXO REALMS

Standalone dark-fantasy 2D side-scrolling action RPG, kept separate from the main NEXO streaming repository until the standalone build is fully tested.

## Ready for local testing

Run:
```bash
npm install
npm run dev:all
```

Then open **http://localhost:5173**.

The local runner starts both the Vite game client on port 5173 and the Colyseus/API server on port 2567.

## Test flow

1. Boot detects keyboard, touch or controller.
2. Authentication supports Supabase account login/signup when configured and guest play for immediate local testing.
3. Three independent save slots.
4. Class selection: **Cavaleiro**, **Arqueiro**, **Mago**.
5. Six connected regions: Floresta do Começo, Cidade de Aster, Minas Esquecidas, Pântano Afogado, Ruínas Antigas and Fortaleza do Eclipse.
6. Real-time movement, jump, combo attacks, dash, skills, enemies, loot, XP, equipment and quests.
7. Regional bosses with phases and checkpoints.
8. Inventory, skill tree and quest panels.
9. Campaign, Tower, Boss Rush and Arena 1v1 modes.
10. Local autosave plus F5 manual save.
11. Supabase cloud-save path uses the dedicated REALMS project.
12. Arena/Boss Rush use the local Colyseus server when it is running.

## Controls

Keyboard: A/D or arrows move; W/up jump; J attack; K dash; 1/2/3 skills; I inventory; T skill tree; Q quests; M modes; F5 save.

Controller and touch input are detected automatically.

## Quality checks

```bash
npm run validate:data
npm run audit:runtime
npm run typecheck
npm run build
npm run smoke:server
npm run verify
```

## Supabase

REALMS uses its own Supabase project and never the main NEXO streaming database.

- Project: `nexo-realms`
- Region: `sa-east-1`
- Project ref: `wlrvjdxjburoaqbiikod`
- Client URL is prefilled in `.env.example`.
- The client uses a publishable key only.
- The multiplayer server needs a server-side secret through the local environment for authoritative competitive persistence.

Never commit a Supabase secret/service-role key.

## Project separation

The main NEXO repository is intentionally not modified by this project. Integration happens only after standalone gameplay and online QA pass.