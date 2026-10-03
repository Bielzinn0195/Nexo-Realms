import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const checks=[
 ["arena-client-room",read("apps/game-client/src/scenes/ArenaScene.ts"),["arena-ranked","arena-casual"]],
 ["arena-server-room",read("apps/multiplayer-server/src/index.ts"),["arena-ranked","arena-casual"]],
 ["boss-rush-auth",read("apps/game-client/src/scenes/BossRushScene.ts"),["client.auth.token","joinOrCreate"]],
 ["arena-auth",read("apps/game-client/src/scenes/ArenaScene.ts"),["client.auth.token","arena-ranked","arena-casual"]],
 ["shared-classes",read("packages/shared/src/index.ts"),["cavaleiro","arqueiro","mago"]],
 ["world-areas",read("apps/game-client/src/data/world.ts"),["forest-of-beginnings","central-city","forgotten-mines","drowned-swamp","ancient-ruins","final-fortress"]],
];
for(const [name,content,tokens] of checks)for(const token of tokens)if(!content.includes(token))throw new Error(name+" missing "+token);
const clientFiles=["apps/game-client/src/systems/AuthService.ts","apps/game-client/src/systems/CloudSaveService.ts","apps/game-client/src/scenes/ArenaScene.ts","apps/game-client/src/scenes/BossRushScene.ts"];\nfor(const file of clientFiles){const content=read(file);if(content.includes("SUPABASE_SECRET_KEY")||content.includes("SUPABASE_SERVICE_ROLE_KEY"))throw new Error("Secret Supabase key reference in client: "+file);}\nconsole.log("NEXO REALMS runtime contract audit passed.");
