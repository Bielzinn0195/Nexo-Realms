import {Server} from "colyseus";
import {WebSocketTransport} from "@colyseus/ws-transport";
import {createServer} from "node:http";
import {ArenaRoom} from "./rooms/ArenaRoom.js";
import {BossRushRoom} from "./rooms/BossRushRoom.js";
import {handleApi} from "./api.js";
import {serverConfig} from "./config.js";

const httpServer=createServer(async(req,res)=>{if(await handleApi(req,res))return;res.statusCode=404;res.setHeader("Content-Type","application/json");res.end(JSON.stringify({error:"not_found"}));});
const gameServer=new Server({transport:new WebSocketTransport({server:httpServer})});
gameServer.define("arena",ArenaRoom);
gameServer.define("boss-rush",BossRushRoom);
httpServer.listen(serverConfig.port,()=>console.log("NEXO REALMS multiplayer server listening on http://localhost:"+serverConfig.port));
