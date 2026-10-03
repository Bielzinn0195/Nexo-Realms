export interface Quest {id:string;title:string;description:string;target:number;progress:number;rewardGold:number;rewardXp:number;completed:boolean;claimed:boolean;}
export const INITIAL_QUESTS:Quest[]=[
{id:"first-awakening",title:"O Despertar",description:"Derrote 3 criaturas da floresta.",target:3,progress:0,rewardGold:120,rewardXp:80,completed:false,claimed:false},
{id:"pathfinder",title:"Abrir o Caminho",description:"Descubra 3 regiões.",target:3,progress:1,rewardGold:250,rewardXp:180,completed:false,claimed:false},
{id:"forge-apprentice",title:"Aprendiz de Ferreiro",description:"Aprimore um equipamento.",target:1,progress:0,rewardGold:180,rewardXp:120,completed:false,claimed:false}];
export class QuestSystem {
 quests:Quest[]=INITIAL_QUESTS.map(q=>({...q}));
 progress(id:string,amount=1){const q=this.quests.find(x=>x.id===id);if(!q||q.completed)return;q.progress=Math.min(q.target,q.progress+amount);q.completed=q.progress>=q.target;}
 claim(id:string){const q=this.quests.find(x=>x.id===id);if(!q||!q.completed||q.claimed)return; q.claimed=true;return{gold:q.rewardGold,xp:q.rewardXp};}
}