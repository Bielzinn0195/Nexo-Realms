import Phaser from "phaser";
import {Client} from "colyseus.js";
import type {GameClass} from "@nexo-realms/shared";
import {getTier} from "../systems/RankSystem";

export class ArenaScene extends Phaser.Scene {
 private rating=1000; private status?:Phaser.GameObjects.Text; private room?:any; private gameClass:GameClass="cavaleiro";
 constructor(){super("ArenaScene");}
 create(data:{gameClass:GameClass}){this.gameClass=data.gameClass;this.cameras.main.setBackgroundColor("#080c15");this.add.text(this.scale.width/2,60,"ARENA • ONLINE 1v1",{fontFamily:"Arial",fontSize:"34px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);this.add.text(this.scale.width/2,105,"Matchmaking por rating • casual • ranked • sala privada",{fontFamily:"Arial",fontSize:"14px",color:"#9ba6bc"}).setOrigin(.5);
  this.status=this.add.text(this.scale.width/2,220,"Pronto para buscar uma partida.",{fontFamily:"Arial",fontSize:"20px",color:"#fff",align:"center"}).setOrigin(.5);
  const queue=this.add.rectangle(this.scale.width/2,330,250,64,0x27385f).setStrokeStyle(2,0x739cff).setInteractive({useHandCursor:true});this.add.text(queue.x,queue.y,"BUSCAR PARTIDA",{fontFamily:"Arial",fontSize:"15px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);queue.on("pointerdown",()=>void this.queue());
  this.add.text(this.scale.width/2,470,"RATING "+this.rating+" • "+getTier(this.rating).name,{fontFamily:"Arial",fontSize:"22px",color:"#d8c6ff"}).setOrigin(.5);
  this.add.text(this.scale.width/2,540,"Servidor autoritativo Colyseus • validação de movimento, cooldown e dano.",{fontFamily:"Arial",fontSize:"12px",color:"#727e94"}).setOrigin(.5);
  this.input.keyboard?.on("keydown-ESC",()=>this.scene.start("WorldScene",{gameClass:this.gameClass}));
 }
 private async queue(){this.status?.setText("Conectando ao servidor...");try{const client=new Client((import.meta.env.VITE_MULTIPLAYER_URL as string|undefined)??"http://localhost:2567");this.room=await client.joinOrCreate("arena",{gameClass:this.gameClass});this.status?.setText("Sala encontrada • "+this.room.sessionId+"\\nAguardando oponente...");this.room.onMessage("match-start",()=>this.status?.setText("PARTIDA INICIADA\\nServidor autoritativo conectado."));this.room.onLeave(()=>this.status?.setText("Você saiu da sala."));}catch(error){console.warn(error);this.status?.setText("Servidor indisponível no momento.\\nModo de demonstração local.");this.time.delayedCall(900,()=>this.simulateMatch());}}
 private simulateMatch(){const win=Math.random()>.5;this.rating=Math.max(0,this.rating+(win?24:-18));this.status?.setText((win?"VITÓRIA DE TESTE":"DERROTA DE TESTE")+"\\nRating: "+this.rating+" • "+getTier(this.rating).name);}
}