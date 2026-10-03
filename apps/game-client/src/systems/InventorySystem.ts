import type {EquipmentSlot,GameClass,InventoryItem,InventoryState,ItemStats} from "@nexo-realms/shared";
import {CLASS_CONFIG} from "@nexo-realms/shared";
import {getItemDefinition} from "../data/items";

export interface CharacterStats {attack:number;defense:number;magicPower:number;hp:number;resource:number;critChance:number;critDamage:number;attackSpeed:number;moveSpeed:number;lifesteal:number;}

export class InventorySystem {
 readonly state:InventoryState={capacity:36,gold:250,gems:0,materials:{iron:12,leather:8,arcaneDust:3},items:[
  {instanceId:"starter-sword",itemId:"iron-longblade",quantity:1,upgradeLevel:0,masteryLevel:0,imbueLevel:0,locked:false},
  {instanceId:"starter-bow",itemId:"hunter-bow",quantity:1,upgradeLevel:0,locked:false},
  {instanceId:"starter-staff",itemId:"apprentice-staff",quantity:1,upgradeLevel:0,locked:false},
  {instanceId:"starter-helm",itemId:"guardian-helm",quantity:1,upgradeLevel:0,locked:false},
  {instanceId:"starter-cloak",itemId:"traveler-cloak",quantity:1,upgradeLevel:0,locked:false},
  {instanceId:"starter-ring",itemId:"arcane-ring",quantity:1,upgradeLevel:0,locked:false},
  {instanceId:"starter-amulet",itemId:"ember-heart",quantity:1,upgradeLevel:0,locked:false},
  {instanceId:"potion-1",itemId:"health-potion",quantity:5,upgradeLevel:0,locked:false}],equipment:{}};
 constructor(private readonly characterClass:GameClass){}
 addItem(itemId:string,quantity=1){const def=getItemDefinition(itemId);if(!def)return false;const stack=def.type==="consumable"||def.type==="material";const existing=this.state.items.find(i=>i.itemId===itemId&&!i.locked);if(stack&&existing){existing.quantity+=quantity;return true;}if(this.state.items.length>=this.state.capacity)return false;this.state.items.push({instanceId:itemId+"-"+Date.now()+"-"+Math.random().toString(36).slice(2),itemId,quantity,upgradeLevel:0,masteryLevel:0,imbueLevel:0,locked:false});return true;}
 equip(instanceId:string,level=1){const item=this.state.items.find(i=>i.instanceId===instanceId);if(!item)return false;const def=getItemDefinition(item.itemId);if(!def?.slot||def.requiredLevel>level)return false;const old=this.state.equipment[def.slot];this.state.equipment[def.slot]=instanceId;item.locked=true;if(old){const previous=this.state.items.find(i=>i.instanceId===old);if(previous)previous.locked=false;}return true;}
 unequip(slot:EquipmentSlot){const id=this.state.equipment[slot];if(!id)return false;const item=this.state.items.find(i=>i.instanceId===id);if(item)item.locked=false;delete this.state.equipment[slot];return true;}
 upgrade(instanceId:string){const item=this.state.items.find(i=>i.instanceId===instanceId);if(!item)return{ok:false,reason:"Item não encontrado."};const def=getItemDefinition(item.itemId);if(!def||item.upgradeLevel>=def.maxUpgradeLevel)return{ok:false,reason:"Limite atingido."};const gold=60+item.upgradeLevel*45;const iron=2+Math.floor(item.upgradeLevel/2);if(this.state.gold<gold)return{ok:false,reason:"Ouro insuficiente."};if((this.state.materials.iron??0)<iron)return{ok:false,reason:"Ferro insuficiente."};this.state.gold-=gold;this.state.materials.iron-=iron;item.upgradeLevel++;return{ok:true};}
 ascend(instanceId:string){const item=this.state.items.find(i=>i.instanceId===instanceId);if(!item)return{ok:false,reason:"Item não encontrado."};const duplicate=this.state.items.find(i=>i.instanceId!==instanceId&&i.itemId===item.itemId&&!i.locked);if(!duplicate)return{ok:false,reason:"Precisa de uma cópia do mesmo equipamento."};this.state.items.splice(this.state.items.indexOf(duplicate),1);item.masteryLevel=(item.masteryLevel??0)+1;return{ok:true};}
 imbue(instanceId:string){const item=this.state.items.find(i=>i.instanceId===instanceId);if(!item)return{ok:false,reason:"Item não encontrado."};const cost=1+(item.imbueLevel??0);if((this.state.materials.arcaneDust??0)<cost)return{ok:false,reason:"Pó Arcano insuficiente."};this.state.materials.arcaneDust-=cost;item.imbueLevel=(item.imbueLevel??0)+1;return{ok:true};}
 dismantle(instanceId:string){const idx=this.state.items.findIndex(i=>i.instanceId===instanceId);if(idx<0)return{ok:false,gold:0};const item=this.state.items[idx];if(item.locked)return{ok:false,gold:0};const def=getItemDefinition(item.itemId);if(!def)return{ok:false,gold:0};const gold=Math.max(1,Math.floor(def.sellValue*(1+item.upgradeLevel*.1)));this.state.gold+=gold;this.state.materials.iron=(this.state.materials.iron??0)+Math.max(1,Math.floor(def.basePower/10));this.state.items.splice(idx,1);return{ok:true,gold};}
 getStats(level=1):CharacterStats{
  const base=CLASS_CONFIG[this.characterClass];
  const result:CharacterStats={attack:base.attack+level*3,defense:base.defense+level*2,magicPower:this.characterClass==="mago"?18+level*4:level,hp:base.baseHp+level*18,resource:base.baseResource+level*8,critChance:this.characterClass==="arqueiro"?7:3,critDamage:150,attackSpeed:1,moveSpeed:base.speed,lifesteal:0};
  const add=(stats:ItemStats,upgrade:number)=>{const multiplier=1+upgrade*.08;(Object.keys(stats) as Array<keyof ItemStats>).forEach(k=>{const value=stats[k];if(value===undefined)return;if(k==="attack")result.attack+=Math.round(value*multiplier);if(k==="defense")result.defense+=Math.round(value*multiplier);if(k==="magicPower")result.magicPower+=Math.round(value*multiplier);if(k==="hp")result.hp+=Math.round(value*multiplier);if(k==="resource")result.resource+=Math.round(value*multiplier);if(k==="critChance")result.critChance+=value;if(k==="critDamage")result.critDamage+=value;if(k==="attackSpeed")result.attackSpeed+=value/100;if(k==="moveSpeed")result.moveSpeed+=value;if(k==="lifesteal")result.lifesteal+=value;});};
  Object.values(this.state.equipment).forEach(id=>{if(!id)return;const item=this.state.items.find(i=>i.instanceId===id);const def=item?getItemDefinition(item.itemId):undefined;if(!item||!def)return;add(def.stats,item.upgradeLevel);const mastery=item.masteryLevel??0;const imbue=item.imbueLevel??0;result.attack+=Math.round((def.stats.attack??0)*mastery*.05);result.magicPower+=Math.round((def.stats.magicPower??0)*mastery*.05);result.attack+=Math.round((def.stats.attack??0)*imbue*.08);result.magicPower+=Math.round((def.stats.magicPower??0)*imbue*.08);});
  return result;
 }
 getEquippedItem(slot:EquipmentSlot):InventoryItem|undefined{const id=this.state.equipment[slot];return this.state.items.find(i=>i.instanceId===id);}
}