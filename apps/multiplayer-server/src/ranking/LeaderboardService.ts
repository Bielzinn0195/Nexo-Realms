import {SupabaseService} from "../services/SupabaseService.js";
import {serverConfig} from "../config.js";
export interface LeaderboardRow{userId:string;score:number;rating?:number;position:number;}
export class LeaderboardService{
 private readonly local=new Map<string,LeaderboardRow[]>();
 constructor(private readonly db=new SupabaseService()){}
 async top(mode:"arena"|"boss-rush"|"tower",limit=20){if(this.db.enabled){try{return await this.db.select("leaderboards","select=user_id,score,rating,position&game_mode=eq."+mode+"&season_id=eq."+encodeURIComponent(serverConfig.seasonId)+"&scope=eq.global&order=position.asc&limit="+Math.max(1,Math.min(100,limit)) as Promise<LeaderboardRow[]>;}catch{}}return(this.local.get(mode)??[]).slice(0,limit);}
 record(mode:"arena"|"boss-rush"|"tower",row:LeaderboardRow){const rows=this.local.get(mode)??[];const filtered=rows.filter(x=>x.userId!==row.userId);filtered.push(row);filtered.sort((a,b)=>(b.rating??b.score)-(a.rating??a.score)||a.score-b.score);const next=filtered.slice(0,100).map((x,i)=>({...x,position:i+1}));this.local.set(mode,next);return next.find(x=>x.userId===row.userId)??row;}
}