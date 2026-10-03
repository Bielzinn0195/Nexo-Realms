import { Room, Client } from "colyseus";
import { Schema, type } from "@colyseus/schema";

type GameClass = "cavaleiro" | "arqueiro" | "mago";
type Action = "attack" | "skill1" | "skill2" | "skill3";

const BOSSES = [
  { id: "warden-of-roots", name: "Aldren", hp: 2200 },
  { id: "iron-queen", name: "Veyra", hp: 4200 },
  { id: "eclipse-lord", name: "Noctis", hp: 8000 },
];

export class BossRushState extends Schema {
  @type("string") playerId = "";
  @type("string") gameClass: GameClass = "cavaleiro";
  @type("number") bossIndex = 0;
  @type("number") bossHp = 2200;
  @type("number") bossMaxHp = 2200;
  @type("number") score = 0;
  @type("number") elapsed = 0;
  @type("number") startedAt = 0;
  @type("string") status = "waiting";
}

export class BossRushRoom extends Room<BossRushState> {
  maxClients = 1;
  maxMessagesPerSecond = 12;
  private nextActionAt = 0;

  onCreate() {
    this.state = new BossRushState();
    this.setPatchRate(100);
    this.setSimulationInterval(() => {
      if (this.state.status === "running") this.state.elapsed = Date.now() - this.state.startedAt;
    });
    this.onMessage("action", (client, payload: { action?: Action }) => {
      if (client.sessionId !== this.state.playerId || this.state.status !== "running") return;
      const action = payload?.action;
      if (!action || Date.now() < this.nextActionAt) return;
      const multipliers: Record<Action, number> = { attack: 1, skill1: 2, skill2: 2.6, skill3: 3.2 };
      const damage = Math.max(1, Math.round(65 * multipliers[action] * (this.state.gameClass === "mago" ? 1.08 : this.state.gameClass === "arqueiro" ? 1.04 : 1)));
      this.nextActionAt = Date.now() + (action === "attack" ? 260 : 900);
      this.state.bossHp = Math.max(0, this.state.bossHp - damage);
      this.state.score += damage * 10;
      this.broadcast("hit-confirmed", { damage, bossHp: this.state.bossHp, bossIndex: this.state.bossIndex });
      if (this.state.bossHp === 0) this.finishBoss();
    });
  }

  onJoin(client: Client, options: { gameClass?: GameClass }) {
    this.state.playerId = client.sessionId;
    this.state.gameClass = options?.gameClass === "arqueiro" || options?.gameClass === "mago" ? options.gameClass : "cavaleiro";
    this.state.startedAt = Date.now();
    this.state.status = "running";
    this.resetBoss(0);
  }

  onLeave() {
    if (this.state.status === "running") this.state.status = "finished";
  }

  private finishBoss() {
    const timeBonus = Math.max(100, 10000 - Math.floor(this.state.elapsed / 100));
    this.state.score += timeBonus;
    if (this.state.bossIndex >= BOSSES.length - 1) {
      this.state.status = "finished";
      this.broadcast("run-finished", { score: this.state.score, elapsed: this.state.elapsed, difficulty: "normal" });
      return;
    }
    this.resetBoss(this.state.bossIndex + 1);
  }

  private resetBoss(index: number) {
    const boss = BOSSES[index];
    this.state.bossIndex = index;
    this.state.bossHp = boss.hp;
    this.state.bossMaxHp = boss.hp;
  }
}