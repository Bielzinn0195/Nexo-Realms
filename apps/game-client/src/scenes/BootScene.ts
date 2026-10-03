import Phaser from "phaser";
import { detectInputMode } from "../main";

export class BootScene extends Phaser.Scene {
 constructor(){super("BootScene");}
 create(){
  this.cameras.main.setBackgroundColor("#07090d");
  this.add.text(this.scale.width/2,this.scale.height/2-80,"NEXO REALMS",{fontFamily:"Arial",fontSize:"54px",color:"#ffffff",fontStyle:"bold"}).setOrigin(.5);
  this.add.text(this.scale.width/2,this.scale.height/2,"Action RPG • Vertical Slice",{fontFamily:"Arial",fontSize:"18px",color:"#8e96aa"}).setOrigin(.5);
  this.add.text(this.scale.width/2,this.scale.height/2+45,"Entrada detectada: "+detectInputMode().toUpperCase(),{fontFamily:"Arial",fontSize:"15px",color:"#6d7890"}).setOrigin(.5);
  this.add.text(this.scale.width/2,this.scale.height-50,"Cavaleiro • Arqueiro • Mago • Combate • Inventário",{fontFamily:"Arial",fontSize:"14px",color:"#566075"}).setOrigin(.5);
  this.createTexture("placeholder-player",0x8d6b4f,64,96);
  this.createTexture("placeholder-enemy",0x8f303d,64,90);
  this.time.delayedCall(700,()=>this.scene.start("CharacterSelectScene"));
 }
 private createTexture(key:string,color:number,w:number,h:number){
  if(this.textures.exists(key))return;
  const g=this.add.graphics();g.fillStyle(color,1);g.fillRoundedRect(0,0,w,h,12);g.generateTexture(key,w,h);g.destroy();
 }
}
