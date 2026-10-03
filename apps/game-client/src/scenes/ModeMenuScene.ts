import Phaser from "phaser";
import type {GameClass} from "@nexo-realms/shared";
import {MODES,GameMode} from "../data/modes";
export class ModeMenuScene extends Phaser.Scene {
 constructor(){super("ModeMenuScene");}
 create(data:{gameClass:GameClass}){
  const gameClass=data.gameClass;this.cameras.main.setBackgroundColor("#080a10");
  this.add.text(this.scale.width/2,70,"MODOS DE JOGO",{fontFamily:"Arial",fontSize:"38px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);
  MODES.forEach((mode,i)=>{const x=this.scale.width/2+(i%2===0?-210:210),y=220+Math.floor(i/2)*190;const card=this.add.rectangle(x,y,370,150,0x151a25).setStrokeStyle(2,0x3b4355).setInteractive({useHandCursor:true});this.add.text(x,y-35,mode.name,{fontFamily:"Arial",fontSize:"24px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);this.add.text(x,y+8,mode.description,{fontFamily:"Arial",fontSize:"13px",color:"#aeb5c7",align:"center",wordWrap:{width:320}}).setOrigin(.5);this.add.text(x,y+54,mode.online?"ONLINE":"SOLO",{fontFamily:"Arial",fontSize:"10px",color:mode.online?"#70b8ff":"#9ca4b7"}).setOrigin(.5);card.on("pointerdown",()=>this.openMode(mode.id,gameClass));});
  this.add.text(this.scale.width/2,this.scale.height-45,"ESC ou clique no canto para voltar • M abre esta tela durante a campanha",{fontFamily:"Arial",fontSize:"12px",color:"#667085"}).setOrigin(.5);
  this.input.keyboard?.on("keydown-ESC",()=>this.scene.stop());
 }
 private openMode(mode:GameMode,gameClass:GameClass){if(mode==="campaign"){this.scene.stop();return;}this.scene.start(mode==="tower"?"TowerScene":mode==="boss-rush"?"BossRushScene":"ArenaScene",{gameClass});}
}