# NEXO REALMS — Local QA checklist

## Smoke
- [ ] `npm install` completes.
- [ ] `npm run dev:all` starts Vite and Colyseus.
- [ ] `http://localhost:5173` loads without a blank canvas.
- [ ] Auth screen appears after boot.
- [ ] Guest mode reaches the save-slot screen.

## Campaign
- [ ] Slot 1 creates a new adventure.
- [ ] Each of the 3 classes can enter the world.
- [ ] Player stays grounded and can move/jump.
- [ ] J attack, K dash and 1/2/3 skills respond.
- [ ] Enemies move, damage and die.
- [ ] Loot, XP, gold and leveling update.
- [ ] I/T/Q panels open and close.
- [ ] F5 saves; returning to the slot continues the same character.
- [ ] Crossing regions changes the region banner.
- [ ] Regional bosses spawn once and can be defeated.

## Modes
- [ ] M opens the mode menu and Escape returns to campaign.
- [ ] Tower loads and combatants remain grounded.
- [ ] Boss Rush works in local fallback mode without the server.
- [ ] With the server running, Boss Rush connects to Colyseus.
- [ ] Arena connects to `arena-casual` or `arena-ranked` when a second client is available.

## Cloud
- [ ] Copy `.env.example` to `.env.local`.
- [ ] Sign in with a test Supabase account.
- [ ] Cloud sync reports success for existing local slots.
- [ ] Verify `game_save_slots` contains only the authenticated user's rows.

## Security
- [ ] Never put `SUPABASE_SECRET_KEY` in Vite/client variables.
- [ ] Never commit `.env.local`.
- [ ] Supabase security advisor remains clean.
- [ ] Competitive authoritative tables reject direct anon/authenticated writes.