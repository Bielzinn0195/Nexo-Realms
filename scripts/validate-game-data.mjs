import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const required = [
  ["packages/shared/src/index.ts", ["cavaleiro", "arqueiro", "mago"]],
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
console.log("NEXO REALMS data validation passed.");
