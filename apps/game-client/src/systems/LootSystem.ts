import type { InventoryItem,Rarity } from "@nexo-realms/shared";
import { ITEM_DATABASE } from "../data/items";

const weights:Array<[Rarity,number]>=[["common",58],["uncommon",25],["rare",11],["epic",4.5],["legendary",1.3],["mythic",.2]];

export interface LootDrop { itemId:string; quantity:number; rarity:Rarity; }

export class LootSystem {
 roll(enemyLevel:number=1):LootDrop[]{
  const count=Math.random()<.12?2:1;const drops:LootDrop[]=[];
  for(let i=0;i<count;i++){const rarity=this.rollRarity();const candidates=ITEM_DATABASE.filter(x=>x.rarity===rarity&&x.requiredLevel<=Math.max(1,enemyLevel));const pool=candidates.length?candidates:ITEM_DATABASE.filter(x=>x.rarity==="common");if(!pool.length)continue;const item=pool[Math.floor(Math.random()*pool.length)];drops.push({itemId:item.id,quantity:item.type==="consumable"?1:1,rarity:item.rarity});}
  return drops;
 }
 rollRarity():Rarity{const total=weights.reduce((s,w)=>s+w[1],0);let r=Math.random()*total;for(const [rarity,weight] of weights){r-=weight;if(r<=0)return rarity;}return "common";}
}
