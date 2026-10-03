import Phaser from "phaser";
import type {GameClass} from "@nexo-realms/shared";
import {ENEMY_DEFINITIONS,EnemyActor} from "../systems/EnemySystem";
export class TowerScene extends Phaser.Scene {
 private floor=1;private enemy?:EnemyActor;private player!:Phaser.GameObjects.Rectangle;private hp=100;
 constructor(){super("TowerScene");}
 create(data:{gameClass:GameClass}){this.cameras.main.setBackgroundColor("#0a0b11");this.add.text(this.scale.width/2,55,"TORRE DO ECLIPSE",{fontFamily:"Arial",fontSize:"34px",color:"#fff",fontStyle:"bold"}).setOrigin(.5);this.add.text(this.scale.width/2,92,"Andar 1 • sobreviva e avance",{fontFamily:"Arial",fontSize:"14px",color:"#9099ac"}).setOrigin(.5);
  this.player=this.add.rectangle(300,520,60,90,0x5d78d8);this.enemy=new EnemyActor(this,ENEMY_DEFINITIONS.brute,900,520);this.add.text(300,650,"A/D move • J atacar • K dash",{fontFamily:"Arial",fontSize:"13px",color:"#aeb5c7"}).setOrigin(.5);
  this.input.keyboard?.on("keydown-J",()=>this.enemy?.hit(50));this.input.keyboard?.on("keydown-SPACE",()=>this.nextFloor());this.input.keyboard?.on("keydown-ESC",()=>this.scene.start("WorldScene",{gameClass:data.gameClass}));
 }
 update(){if(!this.enemy||this.enemy.isDead())return;const x=this.player.x;this.enemy.update(this.player as unknown as Phaser.Physics.Arcade.Sprite,this.time.now);}
 private nextFloor(){if(this.enemy&&!this.enemy.isDead())return;this.floor++;this.enemy=new EnemyActor(this,ENEMY_DEFINITIONS[this.floor%3===0?"elite":this.floor%2===0?"archer":"brute"],850,520);this.add.text(this.scale.width/2,130,"ANDAR "+this.floor,{fontFamily:"Arial",fontSize:"22px",color:"#d9c7ff"}).setOrigin(.5);}
}