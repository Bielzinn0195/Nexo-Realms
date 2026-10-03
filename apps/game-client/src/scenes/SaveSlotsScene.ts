import Phaser from "phaser";
import type {GameClass} from "@nexo-realms/shared";
import {SaveSystem} from "../systems/SaveSystem";
import {AuthService} from "../systems/AuthService";
import {CloudSaveService} from "../systems/CloudSaveService";

export class SaveSlotsScene extends Phaser.Scene{
 private saves=new SaveSystem(); private auth=new AuthService(); private cloud=new CloudSaveService(); private status?:Phaser.GameObjects.Text;
 constructor(){super("SaveSlotsScene");}
 create(){
  this.cameras.main.setBackgroundColor("#080b11");
  this.add.text(this.scale.width/2,55,"NEXO REALMS • SLOTS",{fontFamily:"Arial",fontSize:"34px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);
  this.add.text(this.scale.width/2,95,"Três aventuras independentes • local + cloud quando a conta estiver configurada.",{fontFamily:"Arial",fontSize:"13px",color:"#8e98ac"}).setOrigin(.5);
  this.status=this.add.text(this.scale.width/2,125,this.auth.session?"CONTA CONECTADA • "+(this.auth.session.user.email??this.auth.session.user.id):"MODO CONVIDADO",{fontFamily:"Arial",fontSize:"11px",color:"#7f8ba2"}).setOrigin(.5);
  [1,2,3].forEach((slot,index)=>{const x=this.scale.width/2+(index-1)*330;const save=this.saves.load(slot as 1|2|3);const card=this.add.rectangle(x,330,280,360,0x141923).setStrokeStyle(2,0x394256).setInteractive({useHandCursor:true});this.add.text(x,205,"SLOT "+slot,{fontFamily:"Arial",fontSize:"20px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);this.add.text(x,270,save?save.characterName+"\n"+save.gameClass.toUpperCase()+" • NÍVEL "+save.level:"NOVO JOGO",{fontFamily:"Arial",fontSize:"17px",color:save?"#d8def0":"#737e94",align:"center"}).setOrigin(.5);this.add.text(x,370,save?"Área: "+save.areaId:"Comece uma nova aventura.",{fontFamily:"Arial",fontSize:"12px",color:"#aab3c5",align:"center",wordWrap:{width:220}}).setOrigin(.5);this.add.text(x,475,save?"CONTINUAR":"CRIAR AVENTURA",{fontFamily:"Arial",fontSize:"12px",color:"#7793ff",fontStyle:"bold"}).setOrigin(.5);card.on("pointerdown",()=>{if(save)this.scene.start("WorldScene",{gameClass:save.gameClass,load:save});else this.scene.start("CharacterSelectScene",{slot:slot as 1|2|3});});});
  const sync=this.add.text(24,this.scale.height-42,"☁ SINCRONIZAR CLOUD",{fontFamily:"Arial",fontSize:"12px",color:"#8fa6ff",fontStyle:"bold"}).setInteractive({useHandCursor:true});sync.on("pointerdown",()=>void this.syncCloud());
  const logout=this.add.text(this.scale.width-24,this.scale.height-42,this.auth.session?"SAIR DA CONTA":"VOLTAR AO LOGIN",{fontFamily:"Arial",fontSize:"12px",color:"#aab3c5"}).setOrigin(1,0).setInteractive({useHandCursor:true});logout.on("pointerdown",()=>void this.logout());
 }
 private async syncCloud(){const session=this.auth.session;if(!session){this.status?.setText("Entre em uma conta para sincronizar os saves.");return;}if(!this.cloud.enabled){this.status?.setText("Cloud desativado: preencha as VITE_SUPABASE_* para sincronizar.");return;}this.status?.setText("Sincronizando...");for(const slot of [1,2,3] as const){const save=this.saves.load(slot);if(save)await this.cloud.upsert(session.user.id,slot,save,session.access_token);}this.status?.setText("Cloud sincronizado • 3 slots independentes.");}
 private async logout(){await this.auth.signOut();this.scene.start("AuthScene");}
}