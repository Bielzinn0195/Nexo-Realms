import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const required = [
  ["packages/shared/src/index.ts", ["export type GameClass = \"cavaleiro\" | \"arqueiro\" | \"mago\";","experience:number"]],
  ["apps/game-client/src/data/characters.ts", ["cavaleiro:", "arqueiro:", "mago:"]],
  ["apps/game-client/src/data/world.ts", ["forest-of-beginnings", "central-city", "forgotten-mines", "drowned-swamp", "ancient-ruins", "final-fortress"]],
  ["apps/game-client/src/data/modes.ts", ["campaign", "tower", "boss-rush", "arena"]],
  ["apps/game-client/src/data/bosses.ts", ["warden-of-roots", "iron-queen", "eclipse-lord"]],
  ["database/migrations/001_game_persistence.sql", ["game_save_slots", "arena_ratings", "boss_rush_scores"]],
  ["database/migrations/002_competitive_and_rewards.sql", ["arena_seasons", "arena_matches", "boss_rush_runs", "leaderboards", "rewards", "reward_claims"]],
];
for (const [file, tokens] of required) {
  const content = read(file);
  for (const token of tokens) {
    if (!content.includes(token)) throw new Error(file + " is missing " + token);
  }
}
const modes=read("apps/game-client/src/data/modes.ts");\nfor(const token of ["campaign","tower","boss-rush","arena"]) if(!modes.includes(token)) throw new Error("Missing game mode: "+token);\nconst shared=read("packages/shared/src/index.ts");\nfor(const token of ["cavaleiro","arqueiro","mago"]) if(!shared.includes(token)) throw new Error("Missing class: "+token);\nconst world=read("apps/game-client/src/data/world.ts");\nfor(const token of ["forest-of-beginnings","central-city","forgotten-mines","drowned-swamp","ancient-ruins","final-fortress"]) if(!world.includes(token)) throw new Error("Missing world area: "+token);\nconst inventory=read("packages/shared/src/index.ts");\nif(!inventory.includes("experience:number")) throw new Error("Inventory experience field missing.");\nconst securityMigration=read("database/migrations/003_authoritative_competitive_security.sql");
for(const token of ["drop policy if exists \"own rating writable\"","drop policy if exists \"own rating updatable\"","drop policy if exists \"own boss rush score insert\""]) if(!securityMigration.includes(token)) throw new Error("Competitive security migration incomplete.");
console.log("NEXO REALMS data validation passed.");
