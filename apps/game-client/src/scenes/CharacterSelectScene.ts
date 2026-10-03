import Phaser from "phaser";
import type { GameClass } from "@nexo-realms/shared";
import { CHARACTERS } from "../data/characters";

export class CharacterSelectScene extends Phaser.Scene {
 constructor(){super("CharacterSelectScene");}
 create(){
  this.cameras.main.setBackgroundColor("#090b10");
  this.add.text(this.scale.width/2,70,"ESCOLHA SEU CAMINHO",{fontFamily:"Arial",fontSize:"34px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);
  (["cavaleiro","arqueiro","mago"] as GameClass[]).forEach((gameClass,index)=>{
   const x=this.scale.width/2+(index-1)*300;
   const card=this.add.rectangle(x,330,250,370,0x151922).setStrokeStyle(2,0x343b4d).setInteractive({useHandCursor:true});
   this.add.text(x,205,CHARACTERS[gameClass].name,{fontFamily:"Arial",fontSize:"25px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);
   const color=gameClass==="cavaleiro"?0x9aa1ad:gameClass==="arqueiro"?0x719b57:0x557dcc;
   const hero=this.add.image(x,330,"hero-"+gameClass+"-idle").setDisplaySize(100,140);
   
   this.add.text(x,490,this.description(gameClass),{fontFamily:"Arial",fontSize:"14px",color:"#aeb5c7",align:"center",wordWrap:{width:210}}).setOrigin(.5);
   this.add.text(x,575,"CLIQUE PARA JOGAR",{fontFamily:"Arial",fontSize:"11px",color:"#6d7cff"}).setOrigin(.5);
   card.on("pointerdown",()=>this.scene.start("WorldScene",{gameClass}));
   card.on("pointerover",()=>{card.setStrokeStyle(2,0x6d7cff);hero.setScale(1.06);});
   card.on("pointerout",()=>{card.setStrokeStyle(2,0x343b4d);hero.setScale(1);});
  });
 }
 private description(c:GameClass){return c==="cavaleiro"?"Espada e escudo. Alta defesa, resistência e combate próximo.":c==="arqueiro"?"Arco e flechas. Mobilidade, crítico e pressão à distância.":"Cajado e magia. Grande recurso, alcance e dano elemental.";}
}
