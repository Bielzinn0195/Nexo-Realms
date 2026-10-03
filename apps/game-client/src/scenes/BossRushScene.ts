import Phaser from "phaser";
import { Client } from "colyseus.js";
import { BOSSES } from "../data/bosses";
import type { GameClass } from "@nexo-realms/shared";
import {AuthService} from "../systems/AuthService";

export class BossRushScene extends Phaser.Scene {
  private index = 0;
  private hp = 0;
  private startedAt = 0;
  private score = 0;
  private boss?: Phaser.GameObjects.Rectangle;
  private label?: Phaser.GameObjects.Text;
  private status?: Phaser.GameObjects.Text;
  private room?: any;
  private online = false;
  private gameClass: GameClass = "cavaleiro";
  private auth=new AuthService();

  constructor() {
    super("BossRushScene");
  }

  create(data: { gameClass: GameClass }) {
    this.gameClass = data.gameClass;
    this.cameras.main.setBackgroundColor("#0c0810");

    this.add.text(this.scale.width / 2, 42, "BOSS RUSH", {
      fontFamily: "Arial", fontSize: "36px", color: "#fff", fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(this.scale.width / 2, 80, "Tempo + pontuação • ranking por temporada e dificuldade", {
      fontFamily: "Arial", fontSize: "14px", color: "#aeb5c7",
    }).setOrigin(0.5);

    this.status = this.add.text(this.scale.width / 2, 130, "Conectando ao servidor...", {
      fontFamily: "Arial", fontSize: "17px", color: "#d9c7ff", align: "center",
    }).setOrigin(0.5);
    this.label = this.add.text(this.scale.width / 2, 175, "", {
      fontFamily: "Arial", fontSize: "20px", color: "#fff", align: "center",
    }).setOrigin(0.5);

    this.startedAt = this.time.now;
    this.spawnBoss(0);

    this.input.keyboard?.on("keydown-J", () => this.sendAction("attack"));
    this.input.keyboard?.on("keydown-SPACE", () => this.sendAction("attack"));
    this.input.keyboard?.on("keydown-ONE", () => this.sendAction("skill1"));
    this.input.keyboard?.on("keydown-TWO", () => this.sendAction("skill2"));
    this.input.keyboard?.on("keydown-THREE", () => this.sendAction("skill3"));
    this.input.keyboard?.on("keydown-ESC", () => this.leave());
    void this.connect();
  }

  update() {
    const elapsed = this.online && this.room?.state?.elapsed ? this.room.state.elapsed : this.time.now - this.startedAt;
    const currentBoss = BOSSES[this.index];
    if (currentBoss && this.label) {
      this.label.setText(currentBoss.name + "\nHP " + Math.max(0, this.hp) + "/" + currentBoss.hp + "\nTempo " + Math.floor(elapsed / 1000) + "s • Score " + this.score);
    }
  }

  private async connect() {
    try {
      const endpoint = (import.meta.env.VITE_MULTIPLAYER_URL as string | undefined) ?? "http://localhost:2567";
      const client = new Client(endpoint);
      this.room = await client.joinOrCreate("boss-rush", { gameClass: this.gameClass });
      this.online = true;
      this.status?.setText("ONLINE • servidor autoritativo");
      this.room.onStateChange((state: { bossIndex: number; bossHp: number; bossMaxHp: number; score: number; status: string }) => {
        if (state.bossIndex !== this.index) this.spawnBoss(state.bossIndex);
        this.index = state.bossIndex;
        this.hp = state.bossHp;
        this.score = state.score;
        if (state.status === "finished") this.status?.setText("BOSS RUSH CONCLUÍDO • Score " + this.score);
      });
      this.room.onMessage("run-finished", (message: { score: number; elapsed: number }) => {
        this.score = message.score;
        this.status?.setText("RUN FINALIZADA • " + this.score + " pontos • " + Math.floor(message.elapsed / 1000) + "s");
      });
    } catch (error) {
      console.warn(error);
      this.online = false;
      this.status?.setText("Modo local • servidor online não encontrado.");
    }
  }

  private sendAction(action: "attack" | "skill1" | "skill2" | "skill3") {
    if (this.online && this.room) {
      this.room.send("action", { action });
      return;
    }
    this.damageLocal(action);
  }

  private damageLocal(action: "attack" | "skill1" | "skill2" | "skill3") {
    const multiplier = action === "attack" ? 1 : action === "skill1" ? 2 : action === "skill2" ? 2.6 : 3.2;
    const classBonus = this.gameClass === "mago" ? 1.08 : this.gameClass === "arqueiro" ? 1.04 : 1;
    this.hp = Math.max(0, this.hp - Math.round(65 * multiplier * classBonus));
    this.score += Math.round(65 * multiplier * 10);
    if (this.hp === 0) {
      this.boss?.destroy();
      this.index++;
      if (this.index >= BOSSES.length) {
        this.status?.setText("BOSS RUSH LOCAL CONCLUÍDO • Score " + this.score);
        return;
      }
      this.spawnBoss(this.index);
    }
  }

  private spawnBoss(index: number) {
    if (index < 0 || index >= BOSSES.length) return;
    this.boss?.destroy();
    this.index = index;
    this.hp = BOSSES[index].hp;
    this.boss = this.add.rectangle(this.scale.width / 2, 430, 190, 250, 0x4b2d5d).setStrokeStyle(4, 0xd0a4ff);
  }

  private leave() {
    if (this.room) void this.room.leave();
    this.room = undefined;
    this.scene.start("WorldScene", { gameClass: this.gameClass });
  }
}
