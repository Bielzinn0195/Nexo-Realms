import Phaser from "phaser";
import type {GameClass,InputMode} from "@nexo-realms/shared";
import {CLASS_CONFIG} from "@nexo-realms/shared";
import {CHARACTERS} from "../data/characters";
import {REGIONS,regionAt} from "../data/world";
import {BOSSES} from "../data/bosses";
import {InventorySystem} from "../systems/InventorySystem";
import {CombatSystem} from "../systems/CombatSystem";
import {InventoryPanel} from "../ui/InventoryPanel";
import {HUD} from "../ui/HUD";
import {EnemyActor,ENEMY_DEFINITIONS} from "../systems/EnemySystem";
import {ProgressionSystem} from "../systems/ProgressionSystem";
import {QuestSystem} from "../systems/QuestSystem";
import {SaveSystem} from "../systems/SaveSystem";

export class WorldScene extends Phaser.Scene {
 private gameClass:GameClass="cavaleiro"; private inputMode:InputMode="keyboard"; private player!:Phaser.Physics.Arcade.Sprite; private floor?:Phaser.Physics.Arcade.Image;
 private combat!:CombatSystem; private inventory!:InventorySystem; private hud!:HUD; private inventoryPanel!:InventoryPanel; private progression=new ProgressionSystem(); private quests=new QuestSystem(); private saves=new SaveSystem();
 private enemies:EnemyActor[]=[]; private currentRegion=REGIONS[0]; private regionLabel?:Phaser.GameObjects.Text; private boss?:Phaser.GameObjects.Rectangle; private bossHp=0; private bossMax=0; private bossPhase=0; private lastBossHit=0; private saveTimer=0;
 private keys!:Record<string,Phaser.Input.Keyboard.Key>; private cursors!:Phaser.Types.Input.Keyboard.CursorKeys;

 constructor(){super("WorldScene");}
 init(data:{gameClass?:GameClass;load?:ReturnType<SaveSystem["load"]>}){this.gameClass=data.gameClass??data.load?.gameClass??"cavaleiro";this.inputMode=(navigator.getGamepads?.().some(Boolean)?"controller":navigator.maxTouchPoints>0&&window.matchMedia("(pointer:coarse)").matches?"touch":"keyboard");}
 create(){
  const cfg=CLASS_CONFIG[this.gameClass];this.physics.world.setBounds(0,0,4300,900);this.cameras.main.setBounds(0,0,4300,900);
  this.buildWorld();this.player=this.physics.add.sprite(360,620,"hero-"+this.gameClass+"-idle").setDisplaySize(80,112).setCollideWorldBounds(true);this.player.setDepth(5);
  this.inventory=new InventorySystem(this.gameClass);this.combat=new CombatSystem(this,this.player,this.gameClass,this.inventory);this.hud=new HUD(this,this.inputMode,this.gameClass);
  this.inventoryPanel=new InventoryPanel(this,this.inventory);
  this.cursors=this.input.keyboard!.createCursorKeys();this.keys=this.input.keyboard!.addKeys("W,A,S,D,J,K,ONE,TWO,THREE,I,M,F5") as Record<string,Phaser.Input.Keyboard.Key>;
  this.input.keyboard!.on("keydown-I",()=>this.inventoryPanel.toggle());
  this.input.keyboard!.on("keydown-J",()=>this.attack());this.input.keyboard!.on("keydown-K",()=>this.dash());
  this.input.keyboard!.on("keydown-ONE",()=>this.skill(0));this.input.keyboard!.on("keydown-TWO",()=>this.skill(1));this.input.keyboard!.on("keydown-THREE",()=>this.skill(2));
  this.input.keyboard!.on("keydown-M",()=>this.scene.launch("ModeMenuScene",{gameClass:this.gameClass}));
  this.input.keyboard!.on("keydown-F5",()=>this.saveGame());
  this.hud.setActions(()=>this.attack(),()=>this.dash(),i=>this.skill(i),()=>this.inventoryPanel.toggle());
  this.cameras.main.startFollow(this.player,true,.08,.08);this.hud.update(cfg.baseHp,cfg.baseHp,cfg.baseResource,cfg.baseResource);
  this.spawnWave(0);this.showRegion(this.currentRegion);this.showGuide();
 }
 update(time:number){
  if(!this.player||this.combat.state==="dead")return;
  const stats=this.inventory.getStats(this.progression.state.level);const left=this.cursors.left.isDown||this.keys.A.isDown;const right=this.cursors.right.isDown||this.keys.D.isDown;
  if(left){this.player.setVelocityX(-stats.moveSpeed);this.player.setFlipX(true);}else if(right){this.player.setVelocityX(stats.moveSpeed);this.player.setFlipX(false);}else if(this.combat.state!=="dash"){this.player.setVelocityX((this.player.body as Phaser.Physics.Arcade.Body).velocity.x*.82);}
  if((this.cursors.up.isDown||this.keys.W.isDown)&&(this.player.body as Phaser.Physics.Arcade.Body).blocked.down)this.player.setVelocityY(-470);
  this.player.setTexture("hero-"+this.gameClass+"-"+(this.combat.state==="attack"?"attack-1":this.combat.state==="skill"?"skill-1":this.combat.state==="dash"?"dash":this.combat.state==="hurt"?"hurt":"idle"));
  this.hud.update(stats.hp,stats.hp,stats.resource,stats.resource);
  this.enemies.forEach(e=>e.update(this.player,time));
  this.handleEnemyDamage(time);this.cleanupDead();this.updateRegion();this.updateBoss();
  if(time-this.saveTimer>30000){this.saveTimer=time;this.saveGame();}
 }
 private attack(){const a=this.combat.attack(this.time.now);if(!a)return;this.hitTargets(a.range,a.damageMultiplier);}
 private skill(index:number){const a=this.combat.skill(index);if(!a)return;this.hitTargets(a.range||520,a.damageMultiplier);if(index===2)this.player.setAlpha(.55);}
 private dash(){this.combat.dash(this.player.flipX?-1:1);}
 private hitTargets(range:number,mult:number){
  const stats=this.inventory.getStats(this.progression.state.level);const base=this.gameClass==="mago"?stats.magicPower+CLASS_CONFIG.mago.attack:stats.attack;const damage=Math.max(1,Math.round(base*mult));
  this.enemies.forEach(e=>{if(!e.isDead()&&Math.abs(e.sprite.x-this.player.x)<=range)e.hit(damage);});
  if(this.boss&&Math.abs(this.boss.x-this.player.x)<=range){const crit=Math.random()<stats.critChance/100;this.bossHp=Math.max(0,this.bossHp-Math.round(damage*(crit?stats.critDamage/100:1)));this.flashHit(this.boss);if(this.bossHp<=0)this.defeatBoss();}
  const fx=this.add.image(this.player.x+(this.player.flipX?-50:50),this.player.y-20,this.gameClass==="arqueiro"?"arrow-fx":this.gameClass==="mago"?"magic-fx":"slash-fx").setDepth(7).setFlipX(this.player.flipX);this.tweens.add({targets:fx,alpha:0,x:fx.x+(this.player.flipX?-60:60),duration:180,onComplete:()=>fx.destroy()});
 }
 private handleEnemyDamage(time:number){this.enemies.forEach(e=>{if(e.isDead())return;const d=Math.abs(e.sprite.x-this.player.x);if(d<=e.definition.range&&time%30<16)this.combat.takeDamage(e.definition.damage);});}
 private updateRegion(){const next=regionAt(this.player.x);if(next.id!==this.currentRegion.id){this.currentRegion=next;this.showRegion(next);if(!this.quests.quests[1].completed)this.quests.progress("pathfinder");if(next.id==="final-fortress")this.spawnBoss(2);}}
 private spawnWave(offset:number){
  const positions=[650,980,1280,1700,2050,2450,2750,3150,3400,3800].map(x=>x+offset);
  positions.forEach((x,i)=>{const kind=i%7===0?"brute":i%3===0?"archer":"crawler";const e=new EnemyActor(this,ENEMY_DEFINITIONS[kind],x,620);this.enemies.push(e);this.physics.add.collider(e.sprite,this.floor!);});
 }
 private cleanupDead(){this.enemies=this.enemies.filter(e=>{if(!e.isDead())return true;const x=e.sprite.x;e.destroy();this.inventory.addItem(Math.random()>.65?"health-potion":Math.random()>.7?"arcane-ring":"iron-longblade");this.inventory.state.gold+=e.definition.gold;this.progression.addXp(e.definition.xp);this.quests.progress("first-awakening");return false;});}
 private spawnBoss(index:number){
  if(this.boss||index<0||index>=BOSSES.length)return;const def=BOSSES[index];this.bossMax=def.hp;this.bossHp=def.hp;this.bossPhase=0;this.boss=this.add.rectangle(Math.min(this.player.x+520,4100),520,150,210,0x4d2b5d).setStrokeStyle(4,0xc58cff).setDepth(4);
  this.add.text(this.boss.x,this.boss.y-150,def.name,{fontFamily:"Arial",fontSize:"22px",color:"#fff",fontStyle:"bold"}).setOrigin(.5).setDepth(8);
  this.showBanner("BOSS: "+def.title);
 }
 private updateBoss(){if(!this.boss)return;const def=BOSSES.find(b=>b.hp===this.bossMax)||BOSSES[0];const ratio=this.bossHp/this.bossMax;const phase=Math.max(0,def.phases.findIndex((p,i)=>ratio<=p.threshold && (i===def.phases.length-1 || ratio>def.phases[i+1].threshold)));if(phase>=0&&phase!==this.bossPhase){this.bossPhase=phase;this.showBanner(def.phases[phase].name);this.boss.setScale(1+phase*.08);}}
 private defeatBoss(){if(!this.boss)return;this.inventory.state.gold+=500;this.inventory.addItem("ember-heart");this.progression.addXp(500);this.showBanner("BOSS DERROTADO");this.boss.destroy();this.boss=undefined;this.bossHp=0;this.saveGame();}
 private flashHit(target:Phaser.GameObjects.Rectangle){target.setFillStyle(0xffffff);this.time.delayedCall(80,()=>target.setFillStyle(0x4d2b5d));}
 private buildWorld(){
  const g=this.add.graphics();g.fillStyle(0x080b10).fillRect(0,0,4300,900);
  REGIONS.forEach(r=>{g.fillStyle(r.color).fillRect(r.start,420,r.end-r.start,480);for(let x=r.start;x<r.end;x+=170){g.fillStyle(0x25392b,.75);g.fillTriangle(x+80,420,x+20,690,x+140,690);}});
  g.fillStyle(0x141a20).fillRect(0,730,4300,170);
  this.floor=this.physics.add.staticImage(2150,730,"floor").setDisplaySize(4300,340).setVisible(false);
  this.add.text(430,570,"Siga a estrada. O reino começa aqui.",{fontFamily:"Arial",fontSize:"20px",color:"#d3dccf"});
  [900,1500,2200,2900,3500].forEach(x=>this.add.rectangle(x,575,8,310,0x8c6b40,.6));
 }
 private showRegion(region:typeof REGIONS[number]){this.regionLabel?.destroy();this.regionLabel=this.add.text(this.scale.width/2,90,region.name+"\\n"+region.subtitle,{fontFamily:"Arial",fontSize:"24px",color:"#fff",align:"center",fontStyle:"bold"}).setOrigin(.5).setScrollFactor(0).setAlpha(0);this.tweens.add({targets:this.regionLabel,alpha:1,duration:350,yoyo:true,hold:1700});}
 private showBanner(text:string){const t=this.add.text(this.scale.width/2,145,text,{fontFamily:"Arial",fontSize:"28px",color:"#fff",fontStyle:"bold",stroke:"#000",strokeThickness:6}).setOrigin(.5).setScrollFactor(0);this.tweens.add({targets:t,y:110,alpha:0,duration:1800,onComplete:()=>t.destroy()});}
 private showGuide(){const t=this.add.text(16,this.scale.height-60,this.inputMode==="touch"?"Toque nos botões para atacar, usar habilidades e abrir o inventário.":"J atacar • K dash • 1/2/3 habilidades • I inventário • M modos • F5 salvar",{fontFamily:"Arial",fontSize:"12px",color:"#8f98aa"}).setScrollFactor(0);this.time.delayedCall(6000,()=>t.destroy());}
 private saveGame(){if(!this.inventory)return;this.saves.save(1,{characterName:CLASS_CONFIG[this.gameClass].name,gameClass:this.gameClass,level:this.progression.state.level,experience:this.progression.state.xp,gold:this.inventory.state.gold,inventory:this.inventory.state,areaId:this.currentRegion.id,checkpointId:"world-auto",defeatedBosses:[],discoveredAreas:REGIONS.filter(r=>r.start<=this.player.x).map(r=>r.id),quests:this.quests.quests.filter(q=>q.completed).map(q=>q.id)});}
}