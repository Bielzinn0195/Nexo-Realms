export type GameMode="campaign"|"tower"|"boss-rush"|"arena";
export interface ModeDefinition {id:GameMode;name:string;description:string;online:boolean;}
export const MODES:ModeDefinition[]=[
{id:"campaign",name:"Campanha",description:"Explore o reino conectado, encontre atalhos, quests e bosses.",online:false},
{id:"tower",name:"Torre do Eclipse",description:"Suba por andares com modificadores e recompensas crescentes.",online:false},
{id:"boss-rush",name:"Boss Rush",description:"Derrote bosses em sequência e dispute tempo e pontuação.",online:false},
{id:"arena",name:"Arena",description:"PvP online 1v1 com partidas casuais, ranqueadas e privadas.",online:true}];