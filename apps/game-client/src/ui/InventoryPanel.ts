import Phaser from "phaser";
import { InventorySystem } from "../systems/InventorySystem";
import { getItemDefinition } from "../data/items";

export class InventoryPanel {
 private container?:Phaser.GameObjects.Container;
 constructor(private readonly scene:Phaser.Scene,private readonly inventory:InventorySystem){}
 toggle(){if(this.container){this.container.destroy(true);this.container=undefined;return;}this.open();}
 private open(){
  const {width,height}=this.scene.scale;const panel=this.scene.add.rectangle(width/2,height/2,Math.min(1060,width-40),Math.min(650,height-40),0x11131a,.98).setStrokeStyle(2,0x4b5368);
  const title=this.scene.add.text(panel.x-panel.width/2+28,panel.y-panel.height/2+20,"INVENTÁRIO",{fontFamily:"Arial",fontSize:"28px",color:"#fff",fontStyle:"bold"});
  const resources=this.scene.add.text(panel.x+panel.width/2-30,panel.y-panel.height/2+28,"Ouro: "+this.inventory.state.gold+" • Gemas: "+this.inventory.state.gems+" • Espaço: "+this.inventory.state.items.length+"/"+this.inventory.state.capacity,{fontFamily:"Arial",fontSize:"15px",color:"#d9dce5"}).setOrigin(1,.5);
  this.container=this.scene.add.container(0,0,[panel,title,resources]);
  const cols=8,startX=panel.x-panel.width/2+28,startY=panel.y-panel.height/2+90;
  this.inventory.state.items.slice(0,32).forEach((entry,index)=>{
   const x=startX+(index%cols)*82,y=startY+Math.floor(index/cols)*82,def=getItemDefinition(entry.itemId);if(!def)return;const color=this.rarityColor(def.rarity);
   const slot=this.scene.add.rectangle(x+34,y+34,68,68,color,.18).setStrokeStyle(1,color).setInteractive({useHandCursor:true});
   const icon=this.scene.add.text(x+34,y+24,def.iconKey.replace("item-","").toUpperCase(),{fontFamily:"Arial",fontSize:"10px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);
   const label=this.scene.add.text(x+34,y+52,def.name.slice(0,10)+(entry.upgradeLevel?" +"+entry.upgradeLevel:""),{fontFamily:"Arial",fontSize:"9px",color:"#fff"}).setOrigin(.5);
   slot.on("pointerdown",()=>this.select(entry.instanceId));this.container?.add([slot,icon,label]);
  });
  this.container.add(this.scene.add.text(startX,startY+4*82+15,"Clique para equipar. O ferreiro terá aprimoramento, comparação, desmontagem e materiais.",{fontFamily:"Arial",fontSize:"13px",color:"#aeb5c7"}));
 }
 private select(id:string){if(this.inventory.equip(id)){this.container?.destroy(true);this.container=undefined;this.open();}}
 private rarityColor(r:string){return ({common:0xbfc5d2,uncommon:0x62d39b,rare:0x55a8ff,epic:0xb17cff,legendary:0xffb347,mythic:0xff5d9e} as Record<string,number>)[r]??0xffffff;}
}
