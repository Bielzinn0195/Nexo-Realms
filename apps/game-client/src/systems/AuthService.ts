export interface AuthSession { access_token:string; refresh_token:string; expires_at?:number; user:{id:string;email?:string}; }
const STORAGE_KEY="nexo-realms-auth";
export class AuthService {
  private readonly url:string=String(import.meta.env.VITE_SUPABASE_URL??"").replace(/\/$/,"");
  private readonly anonKey:string=String(import.meta.env.VITE_SUPABASE_ANON_KEY??"");
  get enabled(){return Boolean(this.url&&this.anonKey);}
  get session():AuthSession|undefined{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")??undefined;}catch{return undefined;}}
  private async request(path:string,body:Record<string,unknown>){if(!this.enabled)throw new Error("Supabase Auth não configurado.");const response=await fetch(this.url+path,{method:"POST",headers:{apikey:this.anonKey,"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(String(data.msg??data.error_description??data.message??"Falha na autenticação."));return data as AuthSession;}
  async signIn(email:string,password:string){const session=await this.request("/auth/v1/token?grant_type=password",{email,password});this.persist(session);return session;}
  async signUp(email:string,password:string){const session=await this.request("/auth/v1/signup",{email,password});if(session.access_token)this.persist(session);return session;}
  async refresh(){const current=this.session;if(!current?.refresh_token)return undefined;const session=await this.request("/auth/v1/token?grant_type=refresh_token",{refresh_token:current.refresh_token});this.persist(session);return session;}
  async signOut(){if(this.enabled&&this.session?.access_token)await fetch(this.url+"/auth/v1/logout",{method:"POST",headers:{apikey:this.anonKey,Authorization:"Bearer "+this.session.access_token}}).catch(()=>undefined);localStorage.removeItem(STORAGE_KEY);}
  persist(session:AuthSession){localStorage.setItem(STORAGE_KEY,JSON.stringify(session));}
}