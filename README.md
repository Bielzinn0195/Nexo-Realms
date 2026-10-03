# NEXO REALMS

Standalone action RPG being developed before integration with the main NEXO platform.

## Current direction

Original dark-fantasy 2D side-scrolling action RPG. The combat feel uses Shadow of Death as a gameplay reference point: responsive hack-and-slash, touch controls, skills, deep equipment progression, forge-style enhancement, tower and arena concepts. NEXO REALMS uses its own characters, world, names, art and progression.

## Playable foundation

- Phaser + TypeScript + Vite client
- Cavaleiro, Arqueiro and Mago
- Original pixel-inspired generated placeholder art pipeline
- Movement, jump, attack chains, dash, skills, hit feedback
- HP/resource management
- Enemy AI foundation
- Connected six-region campaign
- Boss definitions and phases
- Inventory with 36 slots
- Equipment slots, rarity, gold, gems and materials
- Upgrade, dismantle, ascend and imbue systems
- Loot generation
- Equipment comparison
- Skill tree
- Three save slots with local persistence
- Optional Supabase cloud-save schema/client
- Tower
- Boss Rush
- Arena 1v1 client + Colyseus room server
- Arena rating tiers
- Touch/keyboard/controller detection foundation

## Reference notes

The public store descriptions for Shadow of Death document deep inventory/skill systems, dark-fantasy hack-and-slash combat, Arena, rare armor sets and a tower mode. Shadow of Death 2 also documents forge enhancement, equipment ascension/imbue and a 100+ floor tower. These are treated as design references, not assets or content to copy.

## Run

\`\`\`bash
npm install
npm run dev
\`\`\`

Multiplayer server:

\`\`\`bash
npm run dev:server
\`\`\`

Quality:

\`\`\`bash
npm run typecheck
npm run build
\`\`\`

## Important

The main NEXO repository is intentionally not modified by this project. Integration happens only after the standalone game is tested and audited.
