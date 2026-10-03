import Phaser from "phaser";
import type { GameClass,InputMode } from "@nexo-realms/shared";
import { CLASS_CONFIG } from "@nexo-realms/shared";

export class HUD {
 private hp?:Phaser.GameObjects.Graphics;private resource?:Phaser.GameObjects.Graphics;private touchGroup?:Phaser.GameObjects.Container;
 constructor(private readonly scene:Phaser.Scene,private readonly inputMode:InputMode,gameClass:GameClass){
  const cfg=CLASS_CONFIG[gameClass];this.hp=scene.add.graphics().setScrollFactor(0);this.resource=scene.add.graphics().setScrollFactor(0);
  scene.add.text(24,18,cfg.name.toUpperCase(),{fontFamily:"Arial",fontSize:"18px",color:"#fff",fontStyle:"bold"}).setScrollFactor(0);
  scene.add.text(24,42,"HP",{fontFamily:"Arial",fontSize:"11px",color:"#d8dbe5"}).setScrollFactor(0);
  scene.add.text(24,70,cfg.resourceName.toUpperCase(),{fontFamily:"Arial",fontSize:"11px",color:"#d8dbe5"}).setScrollFactor(0);
  scene.add.text(24,scene.scale.height-28,this.controlsText(),{fontFamily:"Arial",fontSize:"13px",color:"#c9cede"}).setScrollFactor(0);
  if(inputMode==="touch")this.createTouchControls();
 }
 update(hp:number,maxHp:number,resource:number,maxResource:number){
  const draw=(g:Phaser.GameObjects.Graphics,y:number,value:number,max:number,fill:number)=>{g.clear();g.fillStyle(0x1c202b);g.fillRect(24,y,220,16);g.fillStyle(fill);g.fillRect(24,y,220*Phaser.Math.Clamp(value/max,0,1),16);g.lineStyle(1,0x4a5264);g.strokeRect(24,y,220,16);};
  if(this.hp)draw(this.hp,54,hp,maxHp,0xd94b5b);if(this.resource)draw(this.resource,82,resource,maxResource,0x4f8fff);
 }
 private createTouchControls(){
  this.touchGroup=this.scene.add.container(0,0).setScrollFactor(0);
  const joy=this.scene.add.circle(110,this.scene.scale.height-115,58,0x222838,.72).setStrokeStyle(2,0x66708a);
  this.touchGroup.add(joy);
  [["ATK",this.scene.scale.width-105,this.scene.scale.height-120],["DASH",this.scene.scale.width-205,this.scene.scale.height-65],["S1",this.scene.scale.width-310,this.scene.scale.height-80],["S2",this.scene.scale.width-390,this.scene.scale.height-120],["S3",this.scene.scale.width-300,this.scene.scale.height-190]].forEach(([label,x,y])=>{
   const c=this.scene.add.circle(Number(x),Number(y),34,0x262d40,.85).setStrokeStyle(2,0x69779a);const t=this.scene.add.text(Number(x),Number(y),String(label),{fontFamily:"Arial",fontSize:"11px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);this.touchGroup?.add([c,t]);
  });
 }
 private controlsText(){return this.inputMode==="touch"?"TOQUE: analógico • ataque • dash • habilidades • inventário":this.inputMode==="controller"?"CONTROLE: movimento • ataque • dash • habilidades • inventário":"PC: WASD • J atacar • K dash • 1/2/3 habilidades • I inventário";}
}
