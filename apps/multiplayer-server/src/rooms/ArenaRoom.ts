import {Room,Client} from "colyseus";
import {Schema,type,MapSchema} from "@colyseus/schema";
export class ArenaPlayer extends Schema { @type("string") class="cavaleiro"; @type("number") x=0; @type("number") y=0; @type("number") hp=100; @type("number") facing=1; }
export class ArenaState extends Schema { @type({map:ArenaPlayer}) players=new MapSchema<ArenaPlayer>(); @type("string") status="waiting"; @type("number") startedAt=0; }
export class ArenaRoom extends Room<ArenaState>{
 maxClients=2;
 onCreate(){this.setState(new ArenaState());this.onMessage("input",(client,message:{x?:number;y?:number;attack?:boolean})=>{const p=this.state.players.get(client.sessionId);if(!p)return;if(typeof message.x==="number")p.x=Math.max(-600,Math.min(600,message.x));if(typeof message.y==="number")p.y=Math.max(-200,Math.min(300,message.y));if(message.attack)this.broadcast("combat",{attacker:client.sessionId,at:this.clock.currentTime});});}
 onJoin(client:Client,options:{gameClass?:string}){const p=new ArenaPlayer();p.class=options.gameClass??"cavaleiro";p.x=this.clients.length===1?-260:260;this.state.players.set(client.sessionId,p);if(this.clients.length===2){this.state.status="running";this.state.startedAt=Date.now();this.broadcast("match-start",{at:this.state.startedAt});}}
 onLeave(client:Client){this.state.players.delete(client.sessionId);if(this.clients.length===0)this.state.status="waiting";else this.state.status="waiting";}
}