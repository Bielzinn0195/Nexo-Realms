import Phaser from "phaser";
import type { GameClass } from "@nexo-realms/shared";
import { CLASS_CONFIG } from "@nexo-realms/shared";
import { CHARACTERS,type AttackDefinition } from "../data/characters";
import { InventorySystem } from "./InventorySystem";

export type CombatState="idle"|"attack"|"dash"|"hurt"|"dead"|"skill";
export class CombatSystem {
 state:CombatState="idle";private lastAttackAt=0;private comboIndex=0;private invulnerableUntil=0;private lastSkillAt=0;
 constructor(private readonly scene:Phaser.Scene,private readonly body:Phaser.Physics.Arcade.Sprite,private readonly characterClass:GameClass,private readonly inventory:InventorySystem){}
 get stats(){return this.inventory.getStats(1);}
 attack(now:number):AttackDefinition|undefined{if(!this.canAct())return;const attacks=CHARACTERS[this.characterClass].attacks;const attack=attacks[this.comboIndex%attacks.length];if(now-this.lastAttackAt<attack.cooldownMs)return;const withinCombo=now-this.lastAttackAt<650;this.lastAttackAt=now;this.comboIndex=withinCombo?(this.comboIndex+1)%attacks.length:0;this.state="attack";this.animate(attack);this.scene.time.delayedCall(Math.max(120,attack.cooldownMs*.75),()=>{if(this.state==="attack")this.state="idle";});return attack;}
 skill(index:number):AttackDefinition|undefined{if(!this.canAct()||this.scene.time.now-this.lastSkillAt<700)return;const skill=CHARACTERS[this.characterClass].skills[index];if(!skill)return;this.lastSkillAt=this.scene.time.now;this.state="skill";this.animate(skill);this.scene.time.delayedCall(380,()=>{if(this.state==="skill")this.state="idle";});return skill;}
 dash(direction:-1|1){if(!this.canAct())return false;this.state="dash";this.invulnerableUntil=this.scene.time.now+280;this.body.setVelocityX(direction*(this.inventory.getStats().moveSpeed+180));this.scene.tweens.add({targets:this.body,alpha:{from:.65,to:1},duration:120,yoyo:true,repeat:1});this.scene.time.delayedCall(260,()=>{if(this.state==="dash")this.state="idle";});return true;}
 takeDamage(amount:number){if(this.scene.time.now<this.invulnerableUntil||this.state==="dead")return 0;const reduced=Math.max(1,Math.round(amount*(100/(100+this.stats.defense))));this.state="hurt";this.body.setTint(0xff7777);this.scene.time.delayedCall(100,()=>this.body.clearTint());this.scene.time.delayedCall(240,()=>{if(reduced>=this.stats.hp)this.state="dead";else this.state="idle";});return reduced;}
 applyHitFeedback(target:Phaser.Physics.Arcade.Sprite,mult:number){const base=this.characterClass==="mago"?CLASS_CONFIG[this.characterClass].attack+this.stats.magicPower:this.stats.attack;const crit=Math.random()*100<this.stats.critChance;const damage=Math.max(1,Math.round(base*mult*(crit?this.stats.critDamage/100:1)));target.setTint(crit?0xffd166:0xffffff);this.scene.tweens.add({targets:target,x:target.x+(this.body.x<target.x?14:-14),duration:90,yoyo:true});this.scene.time.delayedCall(100,()=>target.clearTint());return damage;}
 private canAct(){return this.state!=="hurt"&&this.state!=="dead";}
 private animate(attack:AttackDefinition){const key=this.characterClass+"-"+attack.animation;if(this.body.anims.exists(key))this.body.anims.play(key,true);else{const d=this.body.flipX?-1:1;this.scene.tweens.add({targets:this.body,angle:{from:-8*d,to:8*d},duration:90,yoyo:true,repeat:1});}}
}
