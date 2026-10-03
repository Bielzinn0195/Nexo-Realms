import Phaser from "phaser";
import type { GameClass, InputMode } from "@nexo-realms/shared";
import { CLASS_CONFIG } from "@nexo-realms/shared";
import { REGIONS, regionAt } from "../data/world";
import { BOSSES } from "../data/bosses";
import { InventorySystem } from "../systems/InventorySystem";
import { CombatSystem } from "../systems/CombatSystem";
import { InventoryPanel } from "../ui/InventoryPanel";
import { HUD } from "../ui/HUD";
import { EnemyActor, ENEMY_DEFINITIONS } from "../systems/EnemySystem";
import { ProgressionSystem } from "../systems/ProgressionSystem";
import { QuestSystem } from "../systems/QuestSystem";
import { SaveSystem } from "../systems/SaveSystem";
import { SkillTreeSystem } from "../systems/SkillTreeSystem";
import { SkillTreePanel } from "../ui/SkillTreePanel";
import { QuestPanel } from "../ui/QuestPanel";

export class WorldScene extends Phaser.Scene {
  private gameClass: GameClass = "cavaleiro";
  private inputMode: InputMode = "keyboard";
  private player!: Phaser.Physics.Arcade.Sprite;
  private floor?: Phaser.Physics.Arcade.Image;
  private combat!: CombatSystem;
  private inventory!: InventorySystem;
  private skillTree!: SkillTreeSystem;
  private skillTreePanel!: SkillTreePanel;
  private hud!: HUD;
  private inventoryPanel!: InventoryPanel;
  private questPanel!: QuestPanel;
  private progression = new ProgressionSystem();
  private quests = new QuestSystem();
  private saves = new SaveSystem();
  private enemies: EnemyActor[] = [];
  private currentRegion = REGIONS[0];
  private regionLabel?: Phaser.GameObjects.Text;
  private boss?: Phaser.GameObjects.Rectangle;
  private bossNameLabel?: Phaser.GameObjects.Text;
  private bossBar?: Phaser.GameObjects.Graphics;
  private bossHp = 0;
  private bossMax = 0;
  private bossPhase = 0;
  private bossIndex = -1;
  private lastDamageAt = 0;
  private saveTimer = 0;
  private saveSlot: 1 | 2 | 3 = 1;
  private playerHp = 0;
  private playerResource = 0;
  private loadedSave?: ReturnType<SaveSystem["load"]>;
  private controllerPrevious: boolean[] = [];
  private controllerAxisX = 0;
  private defeatedBosses: string[] = [];

  constructor() {
    super("WorldScene");
  }

  init(data: { gameClass?: GameClass; slot?: 1 | 2 | 3; load?: ReturnType<SaveSystem["load"]> }) {
    this.gameClass = data.gameClass ?? data.load?.gameClass ?? "cavaleiro";
    this.saveSlot = data.slot ?? data.load?.slot ?? 1;
    this.loadedSave = data.load;
    this.inputMode = navigator.getGamepads?.().some((pad) => Boolean(pad?.connected))
      ? "controller"
      : navigator.maxTouchPoints > 0 && window.matchMedia("(pointer: coarse)").matches
        ? "touch"
        : "keyboard";
  }

  create() {
    const cfg = CLASS_CONFIG[this.gameClass];
    this.playerHp = cfg.baseHp;
    this.playerResource = cfg.baseResource;

    this.physics.world.setBounds(0, 0, 4300, 900);
    this.cameras.main.setBounds(0, 0, 4300, 900);
    this.buildWorld();

    this.player = this.physics.add.sprite(360, 620, "hero-" + this.gameClass + "-idle")
      .setDisplaySize(80, 112)
      .setCollideWorldBounds(true)
      .setDepth(5);
    if (this.floor) this.physics.add.collider(this.player, this.floor);

    this.inventory = new InventorySystem(this.gameClass);
    if (this.loadedSave) {
      Object.assign(this.inventory.state, this.loadedSave.inventory);
      this.progression.state.level = this.loadedSave.level;
      this.progression.state.xp = this.loadedSave.experience;
      this.progression.state.skillPoints = this.loadedSave.skillPoints;
      this.currentRegion = REGIONS.find((region) => region.id === this.loadedSave?.areaId) ?? REGIONS[0];
      this.defeatedBosses = [...this.loadedSave.defeatedBosses];

      this.quests.quests.forEach((quest) => {
        const saved = this.loadedSave?.quests.find((item) => item.id === quest.id);
        if (saved) Object.assign(quest, saved);
      });
    }

    this.combat = new CombatSystem(this, this.player, this.gameClass, this.inventory);
    this.hud = new HUD(this, this.inputMode, this.gameClass);
    this.inventoryPanel = new InventoryPanel(this, this.inventory);
    this.skillTree = new SkillTreeSystem(this.gameClass);
    this.skillTree.restore(this.loadedSave?.skillLevels, this.progression.state.skillPoints);
    this.skillTreePanel = new SkillTreePanel(this, this.skillTree);
    this.questPanel = new QuestPanel(this, this.quests, (id) => this.claimQuest(id));

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,J,K,ONE,TWO,THREE,I,M,F5") as Record<string, Phaser.Input.Keyboard.Key>;

    this.input.keyboard!.on("keydown-I", () => this.inventoryPanel.toggle());
    this.input.keyboard!.on("keydown-J", () => this.attack());
    this.input.keyboard!.on("keydown-K", () => this.dash());
    this.input.keyboard!.on("keydown-ONE", () => this.skill(0));
    this.input.keyboard!.on("keydown-TWO", () => this.skill(1));
    this.input.keyboard!.on("keydown-THREE", () => this.skill(2));
    this.input.keyboard!.on("keydown-M", () => this.scene.launch("ModeMenuScene", { gameClass: this.gameClass }));
    this.input.keyboard!.on("keydown-F5", () => this.saveGame());
    this.input.keyboard!.on("keydown-T", () => this.skillTreePanel.toggle());
    this.input.keyboard!.on("keydown-Q", () => this.questPanel.toggle());

    this.hud.setActions(() => this.attack(), () => this.dash(), (index) => this.skill(index), () => this.inventoryPanel.toggle());

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    const stats = this.getPlayerStats();
    this.playerHp = stats.hp;
    this.playerResource = stats.resource;
    this.hud.update(this.playerHp, stats.hp, this.playerResource, stats.resource);

    this.spawnWave(0);
    this.showRegion(this.currentRegion);
    this.showGuide();
    this.spawnBossForRegion(this.currentRegion.id);
  }

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  update(time: number) {
    if (!this.player || this.combat.state === "dead") return;

    const stats = this.getPlayerStats();
    const touch = this.inputMode === "touch" ? this.hud.getMoveVector() : { x: 0, y: 0 };
    const controller = this.inputMode === "controller" ? this.pollController() : { x: 0, jump: false, attack: false, dash: false, skills: [false, false, false] };

    if (controller.attack) this.attack();
    if (controller.dash) this.dash();
    controller.skills.forEach((pressed, index) => { if (pressed) this.skill(index); });

    const moveX = this.inputMode === "touch"
      ? touch.x
      : this.inputMode === "controller"
        ? controller.x
        : Number(this.cursors.right.isDown || this.keys.D.isDown) - Number(this.cursors.left.isDown || this.keys.A.isDown);

    if (moveX < -0.12) {
      this.player.setVelocityX(-stats.moveSpeed * Math.min(1, Math.abs(moveX)));
      this.player.setFlipX(true);
    } else if (moveX > 0.12) {
      this.player.setVelocityX(stats.moveSpeed * Math.min(1, Math.abs(moveX)));
      this.player.setFlipX(false);
    } else if (this.combat.state !== "dash") {
      this.player.setVelocityX((this.player.body as Phaser.Physics.Arcade.Body).velocity.x * 0.82);
    }

    const jumpPressed = this.inputMode === "touch"
      ? touch.y < -0.65
      : this.inputMode === "controller"
        ? controller.jump
        : this.cursors.up.isDown || this.keys.W.isDown;
    if (jumpPressed && (this.player.body as Phaser.Physics.Arcade.Body).blocked.down) {
      this.player.setVelocityY(-470);
    }

    const stateAnimation = this.combat.state === "attack"
      ? "attack-1"
      : this.combat.state === "skill"
        ? "skill-1"
        : this.combat.state === "dash"
          ? "dash"
          : this.combat.state === "hurt"
            ? "hurt"
            : Math.abs((this.player.body as Phaser.Physics.Arcade.Body).velocity.x) > 20
              ? "run"
              : "idle";
    this.player.setTexture("hero-" + this.gameClass + "-" + stateAnimation);

    this.playerResource = Math.min(stats.resource, this.playerResource + 0.18);
    this.hud.update(this.playerHp, stats.hp, this.playerResource, stats.resource);

    this.enemies.forEach((enemy) => enemy.update(this.player, time));
    this.handleEnemyDamage(time);
    this.cleanupDead();
    this.updateRegion();
    this.updateBoss();

    if (time - this.saveTimer > 30000) {
      this.saveTimer = time;
      this.saveGame();
    }
  }

  private getPlayerStats() {
    const base = this.inventory.getStats(this.progression.state.level);
    const bonus = this.skillTree.getBonuses();
    return {
      ...base,
      defense: Math.round(base.defense * bonus.defenseMultiplier),
      critChance: base.critChance + bonus.critChance,
      moveSpeed: base.moveSpeed + bonus.moveSpeed,
      magicPower: base.magicPower + bonus.magicPower,
      resource: base.resource + bonus.maxResource,
    };
  }

  private attack() {
    const action = this.combat.attack(this.time.now);
    if (!action || this.playerResource < action.staminaCost) return;
    this.playerResource -= action.staminaCost;
    const bonus = this.skillTree.getBonuses();
    this.hitTargets(action.range, action.damageMultiplier * bonus.damageMultiplier);
  }

  private skill(index: number) {
    const action = this.combat.skill(index);
    if (!action || this.playerResource < action.staminaCost) return;
    this.playerResource -= action.staminaCost;
    const bonus = this.skillTree.getBonuses();
    const multiplier = action.damageMultiplier * (index === 2 ? bonus.ultimateMultiplier : 1);
    this.hitTargets(action.range || 520, multiplier);
    if (index === 2) this.player.setAlpha(0.55);
    this.time.delayedCall(300, () => this.player.setAlpha(1));
  }

  private dash() {
    this.combat.dash(this.player.flipX ? -1 : 1);
  }

  private hitTargets(range: number, multiplier: number) {
    const stats = this.getPlayerStats();
    const base = this.gameClass === "mago" ? stats.magicPower + CLASS_CONFIG.mago.attack : stats.attack;
    const crit = Math.random() < stats.critChance / 100;
    const damage = Math.max(1, Math.round(base * multiplier * (crit ? stats.critDamage / 100 : 1)));

    this.enemies.forEach((enemy) => {
      if (!enemy.isDead() && Math.abs(enemy.sprite.x - this.player.x) <= range) enemy.hit(damage);
    });

    if (this.boss && Math.abs(this.boss.x - this.player.x) <= range) {
      this.bossHp = Math.max(0, this.bossHp - damage);
      this.flashHit(this.boss);
      if (this.bossHp <= 0) this.defeatBoss();
    }

    const fx = this.add.image(
      this.player.x + (this.player.flipX ? -50 : 50),
      this.player.y - 20,
      this.gameClass === "arqueiro" ? "arrow-fx" : this.gameClass === "mago" ? "magic-fx" : "slash-fx",
    ).setDepth(7).setFlipX(this.player.flipX);
    this.tweens.add({
      targets: fx,
      alpha: 0,
      x: fx.x + (this.player.flipX ? -60 : 60),
      duration: 180,
      onComplete: () => fx.destroy(),
    });
  }

  private handleEnemyDamage(time: number) {
    this.enemies.forEach((enemy) => {
      if (enemy.isDead()) return;
      const distance = Math.abs(enemy.sprite.x - this.player.x);
      if (distance <= enemy.definition.range && time - this.lastDamageAt > 900) {
        this.playerHp = Math.max(0, this.playerHp - this.combat.takeDamage(enemy.definition.damage));
        this.lastDamageAt = time;
      }
    });

    if (this.playerHp <= 0) {
      this.playerHp = 1;
      this.showBanner("RECUO AUTOMÁTICO — CHECKPOINT");
      this.player.setPosition(Math.max(360, this.currentRegion.start + 80), 620);
      this.player.setVelocity(0, 0);
    }
  }

  private updateRegion() {
    const next = regionAt(this.player.x);
    if (next.id !== this.currentRegion.id) {
      this.currentRegion = next;
      this.showRegion(next);
      this.quests.progress("pathfinder");
      this.spawnBossForRegion(next.id);
    }
  }

  private spawnBossForRegion(regionId: string) {
    const index = regionId === "central-city" ? 0 : regionId === "forgotten-mines" ? 1 : regionId === "final-fortress" ? 2 : -1;
    if (index < 0 || this.boss || this.defeatedBosses.includes(BOSSES[index].id)) return;
    this.spawnBoss(index);
  }

  private spawnWave(offset: number) {
    const positions = [650, 980, 1280, 1700, 2050, 2450, 2750, 3150, 3400, 3800].map((x) => x + offset);
    positions.forEach((x, index) => {
      const kind = index % 7 === 0 ? "brute" : index % 3 === 0 ? "archer" : "crawler";
      const enemy = new EnemyActor(this, ENEMY_DEFINITIONS[kind], x, 620);
      this.enemies.push(enemy);
      this.physics.add.collider(enemy.sprite, this.floor!);
    });
  }

  private cleanupDead() {
    this.enemies = this.enemies.filter((enemy) => {
      if (!enemy.isDead()) return true;
      enemy.destroy();
      this.inventory.gainEquipmentExperience(25 + enemy.definition.xp);
      this.inventory.addItem(Math.random() > 0.65 ? "health-potion" : Math.random() > 0.7 ? "arcane-ring" : this.gameClass === "arqueiro" ? "hunter-bow" : this.gameClass === "mago" ? "apprentice-staff" : "iron-longblade");
      this.inventory.state.gold += enemy.definition.gold;
      const levels = this.progression.addXp(enemy.definition.xp);
      if (levels > 0) {
        this.skillTree.points = this.progression.state.skillPoints;
        this.showBanner("NÍVEL " + this.progression.state.level + " • +1 PONTO DE HABILIDADE");
      }
      this.quests.progress("first-awakening");
      return false;
    });
  }

  private claimQuest(id: string) {
    const reward = this.quests.claim(id);
    if (!reward) return;
    this.inventory.state.gold += reward.gold;
    const levels = this.progression.addXp(reward.xp);
    if (levels > 0) this.skillTree.points = this.progression.state.skillPoints;
    this.showBanner("MISSÃO CONCLUÍDA • +" + reward.gold + " OURO");
    this.saveGame();
  }

  private spawnBoss(index: number) {
    if (this.boss || index < 0 || index >= BOSSES.length) return;
    const definition = BOSSES[index];
    this.bossIndex = index;
    this.bossMax = definition.hp;
    this.bossHp = definition.hp;
    this.bossPhase = 0;
    this.boss = this.add.rectangle(Math.min(this.player.x + 520, 4100), 620, 150, 210, 0x4d2b5d)
      .setStrokeStyle(4, 0xc58cff)
      .setDepth(4);
    this.bossNameLabel = this.add.text(this.boss.x, this.boss.y - 145, definition.name, { fontFamily: "Arial", fontSize: "18px", color: "#fff", fontStyle: "bold" }).setOrigin(.5).setDepth(8);
    this.bossBar = this.add.graphics().setScrollFactor(0).setDepth(9);
    this.add.text(this.boss.x, this.boss.y - 150, definition.name, { fontFamily: "Arial", fontSize: "22px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(8);
    this.showBanner("BOSS: " + definition.title);
  }

  private updateBoss() {
    if (!this.boss || this.bossIndex < 0) return;
    const definition = BOSSES[this.bossIndex];
    const ratio = this.bossHp / this.bossMax;
    const phase = definition.phases.reduce((active, current, index) => ratio <= current.threshold ? index : active, 0);
    if (phase !== this.bossPhase) {
      this.bossPhase = phase;
      this.showBanner(definition.phases[phase].name);
      this.boss.setScale(1 + phase * 0.08);
    }

    const phaseData = definition.phases[this.bossPhase];
    const bossSpeed = 45 * phaseData.speedMultiplier;
    const direction = Math.sign(this.player.x - this.boss.x);
    this.boss.x = Phaser.Math.Clamp(this.boss.x + direction * bossSpeed * (this.game.loop.delta / 1000), Math.max(100, this.player.x - definition.arenaWidth / 2), Math.min(4200, this.player.x + definition.arenaWidth / 2));
    this.bossNameLabel?.setPosition(this.boss.x, this.boss.y - 145);
    if (Math.abs(this.player.x - this.boss.x) < 170 && this.time.now - this.lastDamageAt > 1100) {
      const damage = Math.round(definition.damage * phaseData.damageMultiplier);
      this.playerHp = Math.max(1, this.playerHp - Math.max(1, Math.round(damage * (100 / (100 + this.getPlayerStats().defense)))));
      this.lastDamageAt = this.time.now;
      this.showBanner("O BOSS ATACOU");
    }

    this.bossBar?.clear();
    this.bossBar?.fillStyle(0x171a22).fillRect(this.scale.width / 2 - 250, 18, 500, 12);
    this.bossBar?.fillStyle(0xc25cff).fillRect(this.scale.width / 2 - 250, 18, 500 * Phaser.Math.Clamp(ratio, 0, 1), 12);
    this.bossBar?.lineStyle(1, 0x8d96ad).strokeRect(this.scale.width / 2 - 250, 18, 500, 12);
  }

  private defeatBoss() {
    if (!this.boss || this.bossIndex < 0) return;
    const definition = BOSSES[this.bossIndex];
    this.inventory.state.gold += 500;
    this.inventory.addItem(definition.reward === "root-heart" ? "ember-heart" : "arcane-ring");
    this.progression.addXp(500);
    if (!this.defeatedBosses.includes(definition.id)) this.defeatedBosses.push(definition.id);
    this.showBanner("BOSS DERROTADO • " + definition.name);
    this.boss.destroy();
    this.boss = undefined;
    this.bossNameLabel?.destroy();
    this.bossNameLabel = undefined;
    this.bossBar?.destroy();
    this.bossBar = undefined;
    this.bossHp = 0;
    this.saveGame();
  }

  private flashHit(target: Phaser.GameObjects.Rectangle) {
    target.setFillStyle(0xffffff);
    this.time.delayedCall(80, () => target.setFillStyle(0x4d2b5d));
  }

  private buildWorld() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x080b10).fillRect(0, 0, 4300, 900);
    REGIONS.forEach((region) => {
      graphics.fillStyle(region.color).fillRect(region.start, 420, region.end - region.start, 480);
      for (let x = region.start; x < region.end; x += 170) {
        graphics.fillStyle(0x25392b, 0.75).fillTriangle(x + 80, 420, x + 20, 690, x + 140, 690);
      }
    });
    graphics.fillStyle(0x141a20).fillRect(0, 730, 4300, 170);
    this.floor = this.physics.add.staticImage(2150, 730, "floor").setDisplaySize(4300, 340).setVisible(false);
    this.floor?.body.setSize(4300, 340, true);
    this.add.text(430, 570, "Siga a estrada. O reino começa aqui.", { fontFamily: "Arial", fontSize: "20px", color: "#d3dccf" });
    [900, 1500, 2200, 2900, 3500].forEach((x) => this.add.rectangle(x, 575, 8, 310, 0x8c6b40, 0.6));
  }

  private showRegion(region: typeof REGIONS[number]) {
    this.regionLabel?.destroy();
    this.regionLabel = this.add.text(this.scale.width / 2, 90, region.name + "\n" + region.subtitle, {
      fontFamily: "Arial", fontSize: "24px", color: "#fff", align: "center", fontStyle: "bold",
    }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);
    this.tweens.add({ targets: this.regionLabel, alpha: 1, duration: 350, yoyo: true, hold: 1700 });
  }

  private showBanner(text: string) {
    const banner = this.add.text(this.scale.width / 2, 145, text, {
      fontFamily: "Arial", fontSize: "28px", color: "#fff", fontStyle: "bold", stroke: "#000", strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0);
    this.tweens.add({ targets: banner, y: 110, alpha: 0, duration: 1800, onComplete: () => banner.destroy() });
  }

  private showGuide() {
    const message = this.inputMode === "touch"
      ? "Arraste o joystick • ATK/DASH/S1/S2/S3 • BAG inventário • Q missões."
      : this.inputMode === "controller"
        ? "Controle detectado • X ataque • A dash • LB/RB/RT habilidades • Q missões."
        : "J atacar • K dash • 1/2/3 habilidades • I inventário • Q missões • M modos • F5 salvar";
    const guide = this.add.text(16, this.scale.height - 60, message, { fontFamily: "Arial", fontSize: "12px", color: "#8f98aa" }).setScrollFactor(0);
    this.time.delayedCall(7000, () => guide.destroy());
  }

  private pollController() {
    const pad = navigator.getGamepads?.().find((gamepad) => Boolean(gamepad?.connected));
    if (!pad) return { x: 0, jump: false, attack: false, dash: false, skills: [false, false, false] };

    this.controllerAxisX = Math.abs(pad.axes[0] ?? 0) > 0.15 ? (pad.axes[0] ?? 0) : 0;
    const pressed = (index: number) => Boolean(pad.buttons[index]?.pressed);
    const edge = (index: number) => pressed(index) && !this.controllerPrevious[index];
    this.controllerPrevious = pad.buttons.map((button) => Boolean(button.pressed));

    return {
      x: this.controllerAxisX,
      jump: edge(0),
      attack: edge(2),
      dash: edge(1),
      skills: [edge(4), edge(5), edge(7)],
    };
  }

  private saveGame() {
    if (!this.inventory || !this.player) return;
    const snapshot = this.saves.save(this.saveSlot, {
      characterName: CLASS_CONFIG[this.gameClass].name,
      gameClass: this.gameClass,
      level: this.progression.state.level,
      experience: this.progression.state.xp,
      skillPoints: this.progression.state.skillPoints,
      gold: this.inventory.state.gold,
      inventory: this.inventory.state,
      areaId: this.currentRegion.id,
      checkpointId: "world-auto",
      defeatedBosses: [...this.defeatedBosses],
      discoveredAreas: REGIONS.filter((region) => region.start <= this.player.x).map((region) => region.id),
      quests: this.quests.quests.map((quest) => ({
        id: quest.id,
        progress: quest.progress,
        completed: quest.completed,
        claimed: quest.claimed,
      })),
      skillLevels: this.skillTree.exportLevels(),
    });
    this.loadedSave = snapshot;
  }
}
