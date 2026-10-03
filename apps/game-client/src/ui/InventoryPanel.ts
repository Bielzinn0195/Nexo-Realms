import Phaser from "phaser";
import {InventorySystem} from "../systems/InventorySystem";
import {getItemDefinition,RARITY_LABEL} from "../data/items";
export class InventoryPanel {
 private container?:Phaser.GameObjects.Container; private selected?:string;
 constructor(private readonly scene:Phaser.Scene,private readonly inventory:InventorySystem){}
 toggle(){if(this.container){this.container.destroy(true);this.container=undefined;return;}this.open();}
 private open(){
  const {width,height}=this.scene.scale;const panel=this.scene.add.rectangle(width/2,height/2,Math.min(1120,width-30),Math.min(680,height-30),0x0d1017,.98).setStrokeStyle(2,0x4b5368);
  const title=this.scene.add.text(panel.x-panel.width/2+24,panel.y-panel.height/2+20,"INVENTÁRIO",{fontFamily:"Arial",fontSize:"28px",color:"#fff",fontStyle:"bold"});
  const info=this.scene.add.text(panel.x+panel.width/2-24,panel.y-panel.height/2+28,"🪙 "+this.inventory.state.gold+"   💎 "+this.inventory.state.gems+"   "+this.inventory.state.items.length+"/"+this.inventory.state.capacity,{fontFamily:"Arial",fontSize:"15px",color:"#d9dce5"}).setOrigin(1,.5);
  this.container=this.scene.add.container(0,0,[panel,title,info]);
  const cols=8,startX=panel.x-panel.width/2+25,startY=panel.y-panel.height/2+90;
  this.inventory.state.items.slice(0,36).forEach((entry,index)=>{
   const x=startX+(index%cols)*84,y=startY+Math.floor(index/cols)*84,def=getItemDefinition(entry.itemId);if(!def)return;const color=this.rarityColor(def.rarity);
   const slot=this.scene.add.rectangle(x+34,y+34,70,70,entry.locked?0x26303b:0x171d28,.95).setStrokeStyle(entry.instanceId===this.selected?3:1,color).setInteractive({useHandCursor:true});
   const icon=this.scene.add.text(x+34,y+23,def.iconKey.replace("item-","").toUpperCase(),{fontFamily:"Arial",fontSize:"10px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);
   const label=this.scene.add.text(x+34,y+52,def.name.slice(0,11)+(entry.upgradeLevel?" +"+entry.upgradeLevel:""),{fontFamily:"Arial",fontSize:"9px",color:"#fff"}).setOrigin(.5);
   slot.on("pointerdown",()=>{this.selected=entry.instanceId;this.refresh();});const xp=this.scene.add.text(x+34,y+65,"XP "+(entry.experience??0),{fontFamily:"Arial",fontSize:"8px",color:"#8fa6ff"}).setOrigin(.5);this.container?.add([slot,icon,label,xp]);
  });
  const chosen=this.inventory.state.items.find(i=>i.instanceId===this.selected);const def=chosen?getItemDefinition(chosen.itemId):undefined;
  if(def&&chosen){
   const x=panel.x+panel.width/2-300,y=panel.y-panel.height/2+105;const box=this.scene.add.rectangle(x+120,y+150,270,330,0x171c26).setStrokeStyle(2,this.rarityColor(def.rarity));this.container.add(box);
   this.container.add(this.scene.add.text(x,y,def.name+" "+(chosen.upgradeLevel?"+"+chosen.upgradeLevel:""),{fontFamily:"Arial",fontSize:"20px",color:"#fff",fontStyle:"bold",wordWrap:{width:250}}));
   this.container.add(this.scene.add.text(x,y+50,RARITY_LABEL[def.rarity]+"\\nXP "+(chosen.experience??0)+" • Nível de item "+this.inventory.getItemLevel(chosen)+"\\n"+def.description+"\\n\\nATK "+(def.stats.attack??0)+"  DEF "+(def.stats.defense??0)+"\\nMAG "+(def.stats.magicPower??0)+"  HP "+(def.stats.hp??0)+"\\nCRIT "+(def.stats.critChance??0)+"%",{fontFamily:"Arial",fontSize:"13px",color:"#bfc7d8",lineSpacing:7,wordWrap:{width:250}}));
   this.button(x,y+245,"EQUIPAR",()=>{this.inventory.equip(chosen.instanceId);this.open();});
   if(def.maxUpgradeLevel>0)this.button(x+135,y+245,"APRIMORAR",()=>{this.inventory.upgrade(chosen.instanceId);this.refresh();});this.button(x,y+290,"ASCENDER",()=>{this.inventory.ascend(chosen.instanceId);this.refresh();});this.button(x+135,y+290,"IMBUIR",()=>{this.inventory.imbue(chosen.instanceId);this.refresh();});
   if(!chosen.locked)this.button(x,y+335,"DESMONTAR",()=>{this.inventory.dismantle(chosen.instanceId);this.selected=undefined;this.refresh();});
  }
  this.container.add(this.scene.add.text(startX,startY+4*84+15,"Clique em um item para comparar/equipar. Aprimore e desmonte equipamentos não bloqueados.",{fontFamily:"Arial",fontSize:"12px",color:"#7f899e"}));
 }
 private refresh(){if(this.container){this.container.destroy(true);this.container=undefined;}this.open();}
 private button(x:number,y:number,label:string,fn:()=>void){const b=this.scene.add.rectangle(x+55,y+20,110,38,0x263552).setStrokeStyle(1,0x6d7cff).setInteractive({useHandCursor:true});const t=this.scene.add.text(x+55,y+20,label,{fontFamily:"Arial",fontSize:"10px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);b.on("pointerdown",fn);this.container?.add([b,t]);}
 private rarityColor(r:string){return({common:0xbfc5d2,uncommon:0x62d39b,rare:0x55a8ff,epic:0xb17cff,legendary:0xffb347,mythic:0xff5d9e} as Record<string,number>)[r]??0xffffff;}
}