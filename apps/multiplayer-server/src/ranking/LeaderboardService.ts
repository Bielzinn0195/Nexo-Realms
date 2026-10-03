import {SupabaseService} from "../services/SupabaseService.js";
import {serverConfig} from "../config.js";
export interface LeaderboardRow{userId:string;score:number;rating?:number;position:number;}
export class LeaderboardService{
 private readonly local=new Map<string,LeaderboardRow[]>();
 constructor(private readonly db=new SupabaseService()){}
 async top(mode:"arena"|"boss-rush"|"tower",limit=20):Promise<LeaderboardRow[]>{
  limit=Math.max(1,Math.min(100,limit));
  if(this.db.enabled){
   try{
    if(mode==="arena"){const rows=await this.db.select("arena_ratings","select=user_id,rating&season_id=eq."+encodeURIComponent(serverConfig.seasonId)+"&order=rating.desc&limit="+limit) as Array<{user_id:string;rating:number}>;return rows.map((r,i)=>({userId:r.user_id,rating:r.rating,score:r.rating,position:i+1}));}
    if(mode==="boss-rush"){const rows=await this.db.select("boss_rush_runs","select=user_id,score,elapsed_ms&season_id=eq."+encodeURIComponent(serverConfig.seasonId)+"&validation_status=eq.validated&order=score.desc,elapsed_ms.asc&limit="+limit) as Array<{user_id:string;score:number;elapsed_ms:number}>;return rows.map((r,i)=>({userId:r.user_id,score:r.score,position:i+1}));}
    const rows=await this.db.select("leaderboards","select=user_id,score,rating,position&game_mode=eq.tower&season_id=eq."+encodeURIComponent(serverConfig.seasonId)+"&scope=eq.global&order=position.asc&limit="+limit) as Array<{user_id:string;score:number;rating?:number;position:number}>;return rows.map(r=>({userId:r.user_id,score:r.score,rating:r.rating,position:r.position}));
   }catch(error){console.error("leaderboard read failed",error);}
  }
  return(this.local.get(mode)??[]).slice(0,limit);
 }
 record(mode:"arena"|"boss-rush"|"tower",row:LeaderboardRow){const rows=this.local.get(mode)??[];const filtered=rows.filter(x=>x.userId!==row.userId);filtered.push(row);filtered.sort((a,b)=>(b.rating??b.score)-(a.rating??a.score)||a.score-b.score);const next=filtered.slice(0,100).map((x,i)=>({...x,position:i+1}));this.local.set(mode,next);return next.find(x=>x.userId===row.userId)??row;}
}