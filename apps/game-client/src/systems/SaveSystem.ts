import type {GameClass,InventoryState,SaveSlot} from "@nexo-realms/shared";
export interface RuntimeSave extends SaveSlot { experience:number; gold:number; inventory:InventoryState; defeatedBosses:string[]; discoveredAreas:string[]; quests:string[]; }
const key=(slot:number)=>"nexo-realms-save-"+slot;
export class SaveSystem {
 save(slot:1|2|3,data:Omit<RuntimeSave,"slot"|"updatedAt">){const value:RuntimeSave={...data,slot,updatedAt:new Date().toISOString()};localStorage.setItem(key(slot),JSON.stringify(value));return value;}
 load(slot:1|2|3):RuntimeSave|undefined{const raw=localStorage.getItem(key(slot));if(!raw)return;try{return JSON.parse(raw) as RuntimeSave;}catch{return;}}
 list():Array<SaveSlot|undefined>{return [1,2,3].map(slot=>{const s=this.load(slot);return s?{slot:s.slot,characterName:s.characterName,gameClass:s.gameClass,level:s.level,areaId:s.areaId,checkpointId:s.checkpointId,updatedAt:s.updatedAt}:undefined;});}
 delete(slot:1|2|3){localStorage.removeItem(key(slot));}
 static createNew(slot:1|2|3,name:string,gameClass:GameClass,inventory:InventoryState):RuntimeSave{return{slot,characterName:name,gameClass,level:1,experience:0,gold:inventory.gold,inventory,areaId:"forest-of-beginnings",checkpointId:"forest-gate",updatedAt:new Date().toISOString(),defeatedBosses:[],discoveredAreas:["forest-of-beginnings"],quests:["first-awakening"]};}
}