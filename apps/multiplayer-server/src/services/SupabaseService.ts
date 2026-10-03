import {serverConfig,hasSupabase} from "../config.js";
export class SupabaseService{
 get enabled(){return hasSupabase;}
 private async request(path:string,init:RequestInit={}){if(!this.enabled)throw new Error("Supabase não configurado.");return fetch(serverConfig.supabaseUrl+path,{...init,headers:{apikey:serverConfig.supabaseSecretKey,Authorization:"Bearer "+serverConfig.supabaseSecretKey,"Content-Type":"application/json",...(init.headers??{})}});}
 async insert(table:string,payload:unknown){const res=await this.request("/rest/v1/"+table,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(payload)});if(!res.ok)throw new Error("Supabase insert failed: "+res.status);}
 async upsert(table:string,payload:unknown,onConflict:string){const res=await this.request("/rest/v1/"+table+"?on_conflict="+encodeURIComponent(onConflict),{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(payload)});if(!res.ok)throw new Error("Supabase upsert failed: "+res.status);}
 async select(table:string,query:string){const res=await this.request("/rest/v1/"+table+"?"+query);if(!res.ok)throw new Error("Supabase select failed: "+res.status);return res.json() as Promise<unknown[]>;}
 async validateAccessToken(token:string){if(!serverConfig.supabaseUrl||!serverConfig.supabasePublishableKey)return undefined;const res=await fetch(serverConfig.supabaseUrl+"/auth/v1/user",{headers:{apikey:serverConfig.supabasePublishableKey,Authorization:"Bearer "+token}});if(!res.ok)return undefined;return await res.json() as {id:string;email?:string};}
}