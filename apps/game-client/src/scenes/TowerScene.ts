import Phaser from "phaser";
import type { GameClass } from "@nexo-realms/shared";
import { ENEMY_DEFINITIONS, EnemyActor } from "../systems/EnemySystem";
import { CLASS_CONFIG } from "@nexo-realms/shared";

export class TowerScene extends Phaser.Scene {
  private floor = 1;
  private enemy?: EnemyActor;
  private player!: Phaser.Physics.Arcade.Sprite;
  private hp = 100;
  private maxHp = 100;
  private floorLabel?: Phaser.GameObjects.Text;
  private hpLabel?: Phaser.GameObjects.Text;
  private className: GameClass = "cavaleiro";
  private attackAt = 0;

  constructor() {
    super("TowerScene");
  }

  create(data: { gameClass: GameClass }) {
    this.className = data.gameClass;
    const cfg = CLASS_CONFIG[data.gameClass];
    this.maxHp = cfg.baseHp;
    this.hp = this.maxHp;

    this.cameras.main.setBackgroundColor("#0a0b11");
    this.add.text(this.scale.width / 2, 42, "TORRE DO ECLIPSE", {
      fontFamily: "Arial", fontSize: "34px", color: "#fff", fontStyle: "bold",
    }).setOrigin(0.5);
    this.floorLabel = this.add.text(this.scale.width / 2, 82, "Andar 1", {
      fontFamily: "Arial", fontSize: "16px", color: "#d9c7ff",
    }).setOrigin(0.5);
    this.hpLabel = this.add.text(24, 24, "", {
      fontFamily: "Arial", fontSize: "14px", color: "#fff",
    });

    this.add.rectangle(this.scale.width / 2, 390, 1120, 440, 0x111520).setStrokeStyle(2, 0x313a4e);
    this.player = this.physics.add.sprite(300, 520, "hero-" + data.gameClass + "-idle").setDisplaySize(70, 98).setCollideWorldBounds(true);
    this.enemy = new EnemyActor(this, ENEMY_DEFINITIONS.brute, 900, 520);

    this.input.keyboard?.on("keydown-J", () => this.attack());
    this.input.keyboard?.on("keydown-K", () => {
      this.player.setVelocityX(this.player.flipX ? -380 : 380);
    });
    this.input.keyboard?.on("keydown-SPACE", () => this.nextFloor());
    this.input.keyboard?.on("keydown-ESC", () => this.scene.start("WorldScene", { gameClass: data.gameClass }));

    this.add.text(this.scale.width / 2, 670, "A/D ou ←/→ mover • J atacar • K dash • ESPAÇO próximo andar", {
      fontFamily: "Arial", fontSize: "13px", color: "#aeb5c7",
    }).setOrigin(0.5);
  }

  update(time: number) {
    if (!this.player || !this.enemy) return;

    const left = this.input.keyboard?.addKey("A").isDown || this.input.keyboard?.addKey("LEFT").isDown;
    const right = this.input.keyboard?.addKey("D").isDown || this.input.keyboard?.addKey("RIGHT").isDown;
    if (left) {
      this.player.setVelocityX(-190);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(190);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(this.player.body.velocity.x * 0.8);
    }

    this.enemy.update(this.player, time);
    if (Math.abs(this.enemy.sprite.x - this.player.x) < this.enemy.definition.range && time - this.attackAt > 1000) {
      this.hp = Math.max(0, this.hp - this.enemy.definition.damage);
      this.attackAt = time;
      if (this.hp <= 0) {
        this.hp = this.maxHp;
        this.floor = Math.max(1, this.floor - 1);
        this.spawnEnemy();
        this.floorLabel?.setText("Andar " + this.floor + " • queda registrada");
      }
    }
    this.hpLabel?.setText(CLASS_CONFIG[this.className].name + " • HP " + this.hp + "/" + this.maxHp);
  }

  private attack() {
    if (!this.enemy || this.enemy.isDead()) return;
    const distance = Math.abs(this.enemy.sprite.x - this.player.x);
    if (distance <= 130) {
      this.enemy.hit(55 + this.floor * 4);
    }
  }

  private nextFloor() {
    if (this.enemy && !this.enemy.isDead()) return;
    this.floor++;
    this.floorLabel?.setText("Andar " + this.floor + (this.floor % 5 === 0 ? " • MODIFICADOR ELITE" : ""));
    this.spawnEnemy();
  }

  private spawnEnemy() {
    this.enemy?.destroy();
    const kind = this.floor % 5 === 0 ? "elite" : this.floor % 3 === 0 ? "brute" : this.floor % 2 === 0 ? "archer" : "crawler";
    const definition = ENEMY_DEFINITIONS[kind];
    this.enemy = new EnemyActor(this, {
      ...definition,
      hp: Math.round(definition.hp * (1 + this.floor * 0.12)),
      damage: Math.round(definition.damage * (1 + this.floor * 0.08)),
    }, 900, 520);
  }
}
