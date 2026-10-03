import Phaser from "phaser";
import type { GameClass,InputMode } from "@nexo-realms/shared";
import { CLASS_CONFIG } from "@nexo-realms/shared";
import { InventorySystem } from "../systems/InventorySystem";
import { CombatSystem } from "../systems/CombatSystem";
import { HUD } from "../ui/HUD";
import { InventoryPanel } from "../ui/InventoryPanel";

export class WorldScene extends Phaser.Scene {
 private floor?:Phaser.Physics.Arcade.Image;private gameClass!:GameClass;private inputMode!:InputMode;private player!:Phaser.Physics.Arcade.Sprite;private enemy!:Phaser.Physics.Arcade.Sprite;private combat!:CombatSystem;private inventory!:InventorySystem;private hud!:HUD;private inventoryPanel!:InventoryPanel;private cursors?:Phaser.Types.Input.Keyboard.CursorKeys;private keys?:Record<string,Phaser.Input.Keyboard.Key>;private enemyHp=120;private resource=80;
 constructor(){super("WorldScene");}
 init(data:{gameClass?:GameClass}){this.gameClass=data.gameClass??"cavaleiro";const touch=navigator.maxTouchPoints>0&&window.matchMedia("(pointer:coarse)").matches;this.inputMode=touch?"touch":"keyboard";}
 create(){
  const cfg=CLASS_CONFIG[this.gameClass];this.resource=cfg.baseResource;this.physics.world.setBounds(0,0,3600,900);this.cameras.main.setBounds(0,0,3600,900);
  this.createWorld();
  this.player=this.physics.add.sprite(420,620,"placeholder-player").setDisplaySize(64,96).setCollideWorldBounds(true).setDragX(700);
  this.enemy=this.physics.add.sprite(900,620,"placeholder-enemy").setDisplaySize(64,90).setCollideWorldBounds(true);if(this.floor){this.physics.add.collider(this.player,this.floor);this.physics.add.collider(this.enemy,this.floor);}
  this.inventory=new InventorySystem(this.gameClass);this.combat=new CombatSystem(this,this.player,this.gameClass,this.inventory);this.hud=new HUD(this,this.inputMode,this.gameClass);this.inventoryPanel=new InventoryPanel(this,this.inventory);this.cameras.main.startFollow(this.player,true,.08,.08);
  this.cursors=this.input.keyboard?.createCursorKeys();this.keys=this.input.keyboard?.addKeys("W,A,S,D,J,K,ONE,TWO,THREE,I") as Record<string,Phaser.Input.Keyboard.Key>;
  this.input.keyboard?.on("keydown-I",()=>this.inventoryPanel.toggle());this.input.keyboard?.on("keydown-J",()=>this.performAttack());this.input.keyboard?.on("keydown-K",()=>this.performDash());this.input.keyboard?.on("keydown-ONE",()=>this.performSkill(0));this.input.keyboard?.on("keydown-TWO",()=>this.performSkill(1));this.input.keyboard?.on("keydown-THREE",()=>this.performSkill(2));
  this.hud.update(cfg.baseHp,cfg.baseHp,this.resource,cfg.baseResource);
 }
 update(){
  if(!this.player||!this.combat)return;const speed=this.inventory.getStats().moveSpeed;const left=this.cursors?.left.isDown||this.keys?.A.isDown;const right=this.cursors?.right.isDown||this.keys?.D.isDown;
  if(left){this.player.setVelocityX(-speed);this.player.setFlipX(true);}else if(right){this.player.setVelocityX(speed);this.player.setFlipX(false);}else if(this.combat.state!=="dash")this.player.setVelocityX((this.player.body as Phaser.Physics.Arcade.Body).velocity.x*.86);
  const jump=this.cursors?.up.isDown||this.keys?.W.isDown;if(jump&&(this.player.body as Phaser.Physics.Arcade.Body).blocked.down)this.player.setVelocityY(-470);
  this.resource=Math.min(this.inventory.getStats().resource,this.resource+.08);this.hud.update(this.inventory.getStats().hp,this.inventory.getStats().hp,this.resource,this.inventory.getStats().resource);
 }
 private performAttack(){const attack=this.combat.attack(this.time.now);if(!attack)return;if(Math.abs(this.enemy.x-this.player.x)<=attack.range){this.enemyHp-=this.combat.applyHitFeedback(this.enemy,attack.damageMultiplier);if(this.enemyHp<=0)this.defeatEnemy();}}
 private performSkill(index:number){const skill=this.combat.skill(index);if(!skill||this.resource<skill.staminaCost)return;this.resource-=skill.staminaCost;if(Math.abs(this.enemy.x-this.player.x)<=skill.range||skill.range===0){this.enemyHp-=this.combat.applyHitFeedback(this.enemy,skill.damageMultiplier);if(this.enemyHp<=0)this.defeatEnemy();}}
 private performDash(){this.combat.dash(this.player.flipX?-1:1);}
 private defeatEnemy(){this.enemyHp=120;this.enemy.setPosition(this.player.x+(this.player.flipX?-360:360),620);this.inventory.addItem(Math.random()>.7?"arcane-ring":"health-potion");this.inventory.state.gold+=35;}
 private createWorld(){
  const g=this.add.graphics();g.fillStyle(0x080d0d).fillRect(0,0,3600,900);g.fillStyle(0x18261b).fillRect(0,500,3600,400);g.fillStyle(0x253a27).fillRect(0,710,3600,190);g.fillStyle(0x10161b).fillRect(0,760,3600,140);
  for(let x=0;x<3600;x+=180){g.fillStyle(0x29442d);g.fillTriangle(x+80,500,x+20,700,x+140,700);}
  this.floor=this.physics.add.staticImage(1800,760,"floor");this.floor.setDisplaySize(3600,280);this.floor.setVisible(false);
  this.add.text(120,620,"Floresta do Começo",{fontFamily:"Arial",fontSize:"30px",color:"#d7e4d5",fontStyle:"bold"});
  
 }
}
