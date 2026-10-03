export type ArenaTier="bronze"|"prata"|"ouro"|"platina"|"diamante"|"eclipse";
export const TIERS:Array<{id:ArenaTier,name:string,min:number,max:number}>= [
{id:"bronze",name:"Bronze",min:0,max:999},{id:"prata",name:"Prata",min:1000,max:1599},{id:"ouro",name:"Ouro",min:1600,max:2199},{id:"platina",name:"Platina",min:2200,max:2899},{id:"diamante",name:"Diamante",min:2900,max:3699},{id:"eclipse",name:"Eclipse",min:3700,max:Infinity}];
export const getTier=(rating:number)=>TIERS.find(t=>rating>=t.min&&rating<=t.max)??TIERS[0];
export function applyArenaResult(rating:number,win:boolean,opponentRating:number){const expected=1/(1+Math.pow(10,(opponentRating-rating)/400));const actual=win?1:0;return Math.max(0,Math.round(rating+32*(actual-expected)));}