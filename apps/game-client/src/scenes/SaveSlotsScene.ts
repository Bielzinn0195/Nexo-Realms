import Phaser from "phaser";
import type {GameClass} from "@nexo-realms/shared";
import {SaveSystem} from "../systems/SaveSystem";
export class SaveSlotsScene extends Phaser.Scene {
 private saves=new SaveSystem();
 constructor(){super("SaveSlotsScene");}
 create(){
  this.cameras.main.setBackgroundColor("#080b11");this.add.text(this.scale.width/2,65,"NEXO REALMS • SLOTS",{fontFamily:"Arial",fontSize:"34px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);
  this.add.text(this.scale.width/2,105,"Três aventuras independentes. No futuro, sincronizadas pela conta.",{fontFamily:"Arial",fontSize:"13px",color:"#8e98ac"}).setOrigin(.5);
  [1,2,3].forEach((slot,index)=>{const x=this.scale.width/2+(index-1)*330;const save=this.saves.load(slot as 1|2|3);const card=this.add.rectangle(x,330,280,360,0x141923).setStrokeStyle(2,0x394256).setInteractive({useHandCursor:true});this.add.text(x,205,"SLOT "+slot,{fontFamily:"Arial",fontSize:"20px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);this.add.text(x,270,save?save.characterName+"\\n"+save.gameClass.toUpperCase()+" • NÍVEL "+save.level:"NOVO JOGO",{fontFamily:"Arial",fontSize:"17px",color:save?"#d8def0":"#737e94",align:"center"}).setOrigin(.5);this.add.text(x,370,save?"Área: "+save.areaId:"Comece uma nova aventura.",{fontFamily:"Arial",fontSize:"12px",color:"#aab3c5",align:"center",wordWrap:{width:220}}).setOrigin(.5);this.add.text(x,475,save?"CONTINUAR":"CRIAR AVENTURA",{fontFamily:"Arial",fontSize:"12px",color:"#7793ff",fontStyle:"bold"}).setOrigin(.5);
   card.on("pointerdown",()=>{if(save)this.scene.start("WorldScene",{gameClass:save.gameClass,load:save});else this.scene.start("CharacterSelectScene",{slot:slot as 1|2|3});});
  });
 }
}