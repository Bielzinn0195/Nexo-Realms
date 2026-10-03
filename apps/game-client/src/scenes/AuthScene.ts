import Phaser from "phaser";
import {AuthService} from "../systems/AuthService";
export class AuthScene extends Phaser.Scene{
 private auth=new AuthService(); private email!:Phaser.GameObjects.DOMElement; private password!:Phaser.GameObjects.DOMElement; private status!:Phaser.GameObjects.Text;
 constructor(){super("AuthScene");}
 create(){
  this.cameras.main.setBackgroundColor("#070a10");
  this.add.text(this.scale.width/2,80,"NEXO REALMS",{fontFamily:"Arial",fontSize:"44px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);
  this.add.text(this.scale.width/2,122,"CONTA E SINCRONIZAÇÃO",{fontFamily:"Arial",fontSize:"14px",color:"#8792a8"}).setOrigin(.5);
  this.add.rectangle(this.scale.width/2,330,430,390,0x121824).setStrokeStyle(2,0x35415a);
  const makeInput=(y:number,type:"text"|"password",placeholder:string)=>{const input=document.createElement("input");input.type=type;input.placeholder=placeholder;input.autocomplete=type==="password"?"current-password":"email";input.style.cssText="width:320px;height:44px;padding:0 14px;border:1px solid #3a465f;border-radius:8px;background:#0a0f18;color:#fff;font-size:15px;outline:none;box-sizing:border-box;";return this.add.dom(this.scale.width/2,y,input).setOrigin(.5);};
  this.email=makeInput(250,"text","E-mail");this.password=makeInput(310,"password","Senha");
  this.status=this.add.text(this.scale.width/2,535,this.auth.enabled?"Use sua conta Supabase ou continue como convidado.":"Modo convidado ativo • conecte as keys para habilitar contas.",{fontFamily:"Arial",fontSize:"12px",color:"#9da8bb",align:"center",wordWrap:{width:370}}).setOrigin(.5);
  const button=(x:number,y:number,label:string,fn:()=>void)=>{const b=this.add.rectangle(x,y,170,48,0x26375d).setStrokeStyle(2,0x718cff).setInteractive({useHandCursor:true});this.add.text(x,y,label,{fontFamily:"Arial",fontSize:"13px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);b.on("pointerdown",fn);};
  button(this.scale.width/2-95,410,"ENTRAR",()=>void this.signIn());button(this.scale.width/2+95,410,"CRIAR CONTA",()=>void this.signUp());
  const guest=this.add.text(this.scale.width/2,475,"JOGAR COMO CONVIDADO",{fontFamily:"Arial",fontSize:"13px",color:"#8fa6ff",fontStyle:"bold"}).setOrigin(.5).setInteractive({useHandCursor:true});guest.on("pointerdown",()=>this.scene.start("SaveSlotsScene"));
  if(this.auth.session)this.scene.start("SaveSlotsScene");
 }
 private values(){return{email:(this.email.node as HTMLInputElement).value.trim(),password:(this.password.node as HTMLInputElement).value};}
 private async signIn(){const v=this.values();await this.submit(()=>this.auth.signIn(v.email,v.password),"Login realizado.");}
 private async signUp(){const v=this.values();await this.submit(()=>this.auth.signUp(v.email,v.password),"Conta criada. Verifique o e-mail se a confirmação estiver ativa.");}
 private async submit(action:()=>Promise<unknown>,success:string){try{if(!this.auth.enabled){this.status.setText("Conecte VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para usar contas.");return;}await action();this.status.setText(success);this.time.delayedCall(350,()=>this.scene.start("SaveSlotsScene"));}catch(error){this.status.setText(String(error instanceof Error?error.message:error));}}
}