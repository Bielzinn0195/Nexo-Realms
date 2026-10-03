import Phaser from "phaser";
import {BOSSES} from "../data/bosses";
import type {GameClass} from "@nexo-realms/shared";
export class BossRushScene extends Phaser.Scene {
 private index=0;private hp=0;private startedAt=0;private boss?:Phaser.GameObjects.Rectangle;private label?:Phaser.GameObjects.Text;
 constructor(){super("BossRushScene");}
 create(data:{gameClass:GameClass}){this.cameras.main.setBackgroundColor("#0c0810");this.add.text(this.scale.width/2,55,"BOSS RUSH",{fontFamily:"Arial",fontSize:"36px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);this.add.text(this.scale.width/2,92,"Tempo e pontuação entram no ranking da temporada.",{fontFamily:"Arial",fontSize:"14px",color:"#aeb5c7"}).setOrigin(.5);this.startedAt=this.time.now;this.spawnBoss();this.input.keyboard?.on("keydown-J",()=>this.damage());this.input.keyboard?.on("keydown-SPACE",()=>this.damage());this.input.keyboard?.on("keydown-ESC",()=>this.scene.start("WorldScene",{gameClass:data.gameClass}));}
 update(){if(this.label)this.label.setText(BOSSES[this.index].name+"\\nHP "+Math.max(0,this.hp)+"/"+BOSSES[this.index].hp+"\\nTempo "+Math.floor((this.time.now-this.startedAt)/1000)+"s");}
 private spawnBoss(){const d=BOSSES[this.index];this.hp=d.hp;this.boss=this.add.rectangle(this.scale.width/2,420,190,250,0x4b2d5d).setStrokeStyle(4,0xd0a4ff);this.label=this.add.text(this.scale.width/2,160,"",{fontFamily:"Arial",fontSize:"22px",color:"#fff",align:"center"}).setOrigin(.5);}
 private damage(){if(!this.boss)return;this.hp=Math.max(0,this.hp-250);if(this.hp===0){this.boss.destroy();this.index++;if(this.index>=BOSSES.length){this.label?.setText("BOSS RUSH CONCLUÍDO");return;}this.spawnBoss();}}
}