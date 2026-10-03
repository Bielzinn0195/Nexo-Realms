import Phaser from "phaser";
export type EnemyKind="crawler"|"archer"|"brute"|"elite";
export interface EnemyDefinition {id:string;name:string;kind:EnemyKind;hp:number;damage:number;speed:number;range:number;xp:number;gold:number;color:number;}
export const ENEMY_DEFINITIONS:Record<EnemyKind,EnemyDefinition>={
 crawler:{id:"forest-crawler",name:"Rastejante",kind:"crawler",hp:90,damage:10,speed:80,range:58,xp:22,gold:12,color:0x6d3547},
 archer:{id:"thorn-archer",name:"Arqueiro Espinhoso",kind:"archer",hp:65,damage:13,speed:55,range:260,xp:28,gold:18,color:0x4f713e},
 brute:{id:"moss-brute",name:"Bruto Musgoso",kind:"brute",hp:210,damage:22,speed:42,range:70,xp:65,gold:42,color:0x465d42},
 elite:{id:"ruin-warden",name:"Sentinela das Ruínas",kind:"elite",hp:360,damage:28,speed:58,range:120,xp:110,gold:75,color:0x554e75}
};
export class EnemyActor {
 readonly sprite:Phaser.Physics.Arcade.Sprite; hp:number; private attackAt=0; private hurtUntil=0;
 constructor(private scene:Phaser.Scene,public readonly definition:EnemyDefinition,x:number,y:number){this.hp=definition.hp;this.sprite=scene.physics.add.sprite(x,y,"placeholder-enemy").setDisplaySize(58,78).setTint(definition.color).setCollideWorldBounds(true);}
 update(player:Phaser.Physics.Arcade.Sprite,now:number){const dx=player.x-this.sprite.x,d= Math.abs(dx);if(this.hp<=0)return;if(now<this.hurtUntil){this.sprite.setVelocityX(0);return;}if(d>this.definition.range){this.sprite.setVelocityX(Math.sign(dx)*this.definition.speed);this.sprite.setFlipX(dx<0);}else{this.sprite.setVelocityX(0);if(now-this.attackAt>1400)this.attackAt=now;}}
 hit(damage:number){if(this.hp<=0)return;this.hp=Math.max(0,this.hp-damage);this.hurtUntil=this.scene.time.now+120;this.sprite.setTint(0xffffff);this.scene.tweens.add({targets:this.sprite,x:this.sprite.x+(Math.random()>.5?10:-10),duration:70,yoyo:true});this.scene.time.delayedCall(100,()=>this.sprite.setTint(this.definition.color));}
 isDead(){return this.hp<=0;} destroy(){this.sprite.destroy();}
}