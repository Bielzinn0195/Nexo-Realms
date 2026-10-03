export interface CloudSaveConfig{url:string;publishableKey:string;}
export interface CloudSavePayload{characterName:string;gameClass:string;level:number;areaId:string;checkpointId:string;[key:string]:unknown;}
export class CloudSaveService{
 private readonly config?:CloudSaveConfig;
 constructor(config?:CloudSaveConfig){this.config=config??(()=>{const url=String(import.meta.env.VITE_SUPABASE_URL??"").replace(/\/$/,"");const publishableKey=String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY??import.meta.env.VITE_SUPABASE_ANON_KEY??"");return url&&publishableKey?{url,publishableKey}:undefined;})();}
 get enabled(){return Boolean(this.config);}
 async upsert(userId:string,slot:1|2|3,payload:CloudSavePayload,accessToken:string){
   if(!this.config||!userId)return false;
   const body={user_id:userId,slot,payload,character_name:String(payload.characterName??"Hero"),game_class:String(payload.gameClass??"cavaleiro"),level:Number(payload.level??1),area_id:String(payload.areaId??"forest-of-beginnings"),checkpoint_id:String(payload.checkpointId??"world-auto"),updated_at:new Date().toISOString()};
   const res=await fetch(this.config.url+"/rest/v1/game_save_slots?on_conflict=user_id,slot",{method:"POST",headers:{apikey:this.config.publishableKey,Authorization:"Bearer "+accessToken,"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(body)});
   return res.ok;
 }
 async list(userId:string,accessToken:string){if(!this.config||!userId)return[];const res=await fetch(this.config.url+"/rest/v1/game_save_slots?user_id=eq."+encodeURIComponent(userId)+"&order=slot.asc",{headers:{apikey:this.config.publishableKey,Authorization:"Bearer "+accessToken}});if(!res.ok)return[];return await res.json() as Array<Record<string,unknown>>;}
}
