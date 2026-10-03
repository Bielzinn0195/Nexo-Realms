import type { GameClass } from "@nexo-realms/shared";

export interface AttackDefinition {
 id:string; name:string; damageMultiplier:number; staminaCost:number; cooldownMs:number; range:number;
 hitType:"melee"|"projectile"|"area"; animation:string;
}
export interface CharacterDefinition {
 id:GameClass; name:string; spriteKey:string; animations:string[]; attacks:AttackDefinition[]; skills:AttackDefinition[];
}

export const CHARACTERS:Record<GameClass,CharacterDefinition> = {
 cavaleiro:{id:"cavaleiro",name:"Cavaleiro",spriteKey:"character-knight",animations:["idle","run","jump","fall","attack-1","attack-2","attack-3","dash","hurt","death"],attacks:[
  {id:"slash-1",name:"Corte",damageMultiplier:1,staminaCost:8,cooldownMs:220,range:75,hitType:"melee",animation:"attack-1"},
  {id:"slash-2",name:"Corte Ascendente",damageMultiplier:1.2,staminaCost:10,cooldownMs:260,range:82,hitType:"melee",animation:"attack-2"},
  {id:"shield-breaker",name:"Ruptura",damageMultiplier:1.65,staminaCost:18,cooldownMs:650,range:92,hitType:"melee",animation:"attack-3"}],
 skills:[
  {id:"shield-bash",name:"Impacto do Escudo",damageMultiplier:2,staminaCost:25,cooldownMs:5000,range:90,hitType:"melee",animation:"skill-1"},
  {id:"whirlwind",name:"Giro de Aço",damageMultiplier:2.6,staminaCost:35,cooldownMs:9000,range:125,hitType:"area",animation:"skill-2"},
  {id:"guardian-stance",name:"Postura Guardiã",damageMultiplier:.8,staminaCost:20,cooldownMs:14000,range:0,hitType:"area",animation:"skill-3"}]},
 arqueiro:{id:"arqueiro",name:"Arqueiro",spriteKey:"character-archer",animations:["idle","run","jump","fall","attack-1","attack-2","attack-3","dash","hurt","death"],attacks:[
  {id:"quick-shot",name:"Disparo Rápido",damageMultiplier:1,staminaCost:7,cooldownMs:180,range:330,hitType:"projectile",animation:"attack-1"},
  {id:"double-shot",name:"Duplo Disparo",damageMultiplier:1.45,staminaCost:12,cooldownMs:420,range:340,hitType:"projectile",animation:"attack-2"},
  {id:"piercing-shot",name:"Flecha Perfurante",damageMultiplier:2,staminaCost:20,cooldownMs:900,range:500,hitType:"projectile",animation:"attack-3"}],
 skills:[
  {id:"rain-of-arrows",name:"Chuva de Flechas",damageMultiplier:2.2,staminaCost:30,cooldownMs:6500,range:360,hitType:"area",animation:"skill-1"},
  {id:"evasive-shot",name:"Tiro Evasivo",damageMultiplier:1.8,staminaCost:22,cooldownMs:5000,range:260,hitType:"projectile",animation:"skill-2"},
  {id:"hunter-focus",name:"Foco do Caçador",damageMultiplier:.5,staminaCost:20,cooldownMs:15000,range:0,hitType:"area",animation:"skill-3"}]},
 mago:{id:"mago",name:"Mago",spriteKey:"character-mage",animations:["idle","run","jump","fall","attack-1","attack-2","attack-3","dash","hurt","death"],attacks:[
  {id:"arcane-bolt",name:"Projétil Arcano",damageMultiplier:1,staminaCost:10,cooldownMs:300,range:400,hitType:"projectile",animation:"attack-1"},
  {id:"frost-bolt",name:"Raio Gélido",damageMultiplier:1.4,staminaCost:16,cooldownMs:550,range:420,hitType:"projectile",animation:"attack-2"},
  {id:"arcane-burst",name:"Explosão Arcana",damageMultiplier:1.9,staminaCost:25,cooldownMs:1000,range:160,hitType:"area",animation:"attack-3"}],
 skills:[
  {id:"frost-nova",name:"Nova Congelante",damageMultiplier:2.1,staminaCost:30,cooldownMs:6500,range:180,hitType:"area",animation:"skill-1"},
  {id:"meteor",name:"Meteoro",damageMultiplier:3.2,staminaCost:45,cooldownMs:12000,range:520,hitType:"area",animation:"skill-2"},
  {id:"arcane-veil",name:"Véu Arcano",damageMultiplier:.4,staminaCost:35,cooldownMs:16000,range:0,hitType:"area",animation:"skill-3"}]}
};
