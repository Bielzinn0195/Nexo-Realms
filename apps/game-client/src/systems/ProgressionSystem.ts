export interface Progression {level:number;xp:number;xpToNext:number;skillPoints:number;}
export class ProgressionSystem {
 state:Progression={level:1,xp:0,xpToNext:100,skillPoints:0};
 addXp(amount:number){if(!Number.isFinite(amount)||amount<=0)return 0;this.state.xp+=amount;let levels=0;while(this.state.xp>=this.state.xpToNext){this.state.xp-=this.state.xpToNext;this.state.level++;this.state.skillPoints++;this.state.xpToNext=Math.floor(this.state.xpToNext*1.24);levels++;}return levels;}
}