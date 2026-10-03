import type { ItemDefinition, Rarity } from "@nexo-realms/shared";

export const RARITY_LABEL: Record<Rarity,string> = {
  common:"Comum", uncommon:"Incomum", rare:"Raro", epic:"Épico", legendary:"Lendário", mythic:"Mítico"
};

export const ITEM_DATABASE: ItemDefinition[] = [
 {id:"iron-longblade",name:"Lâmina de Ferro",type:"weapon",slot:"weapon",classes:["cavaleiro"],rarity:"common",requiredLevel:1,basePower:12,stats:{attack:12},description:"Uma espada simples e confiável.",maxUpgradeLevel:10,sellValue:45,iconKey:"item-sword"},
 {id:"hunter-bow",name:"Arco do Batedor",type:"weapon",slot:"weapon",classes:["arqueiro"],rarity:"uncommon",requiredLevel:1,basePower:18,stats:{attack:15,critChance:2},description:"Arco leve para mobilidade e precisão.",maxUpgradeLevel:12,sellValue:90,iconKey:"item-bow"},
 {id:"apprentice-staff",name:"Cajado do Aprendiz",type:"weapon",slot:"weapon",classes:["mago"],rarity:"uncommon",requiredLevel:1,basePower:18,stats:{magicPower:17,resource:12},description:"Amplifica os primeiros feitiços.",maxUpgradeLevel:12,sellValue:95,iconKey:"item-staff"},
 {id:"guardian-helm",name:"Elmo do Guardião",type:"armor",slot:"helmet",rarity:"rare",requiredLevel:1,basePower:22,stats:{defense:14,hp:30},description:"Proteção pesada sem perder visão.",maxUpgradeLevel:15,sellValue:140,iconKey:"item-helm"},
 {id:"traveler-cloak",name:"Manto do Viajante",type:"armor",slot:"chest",rarity:"rare",requiredLevel:1,basePower:24,stats:{defense:8,moveSpeed:10,hp:20},description:"Tecido leve para regiões perigosas.",maxUpgradeLevel:15,sellValue:150,iconKey:"item-cloak"},
 {id:"arcane-ring",name:"Anel Arcano",type:"accessory",slot:"ring",rarity:"epic",requiredLevel:1,basePower:34,stats:{magicPower:20,critDamage:10,resource:20},description:"Joia carregada de energia arcana.",maxUpgradeLevel:20,sellValue:260,iconKey:"item-ring"},
 {id:"ember-heart",name:"Coração de Brasa",type:"accessory",slot:"amulet",rarity:"legendary",requiredLevel:1,basePower:55,stats:{attack:12,magicPower:12,hp:55,lifesteal:2},description:"Fragmento vivo de uma criatura ancestral.",maxUpgradeLevel:25,sellValue:600,iconKey:"item-amulet"},
 {id:"health-potion",name:"Poção de Vida",type:"consumable",rarity:"common",requiredLevel:1,basePower:0,stats:{},description:"Recupera vida.",maxUpgradeLevel:0,sellValue:10,iconKey:"item-potion"}
];

export function getItemDefinition(itemId:string): ItemDefinition|undefined {
 return ITEM_DATABASE.find(item=>item.id===itemId);
}
