import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

type GameClass = "cavaleiro" | "arqueiro" | "mago";
type InputMessage = { left?: boolean; right?: boolean; jump?: boolean };
type ActionMessage = { action?: "attack" | "skill1" | "skill2" | "skill3" | "dash" };

const CLASS_STATS: Record<GameClass, { hp: number; speed: number; attack: number; range: number; resource: number }> = {
  cavaleiro: { hp: 180, speed: 190, attack: 24, range: 105, resource: 80 },
  arqueiro: { hp: 130, speed: 225, attack: 28, range: 280, resource: 110 },
  mago: { hp: 105, speed: 175, attack: 20, range: 320, resource: 160 },
};

export class ArenaPlayer extends Schema {
  @type("string") class: GameClass = "cavaleiro";
  @type("number") x = 0;
  @type("number") y = 0;
  @type("number") hp = 100;
  @type("number") maxHp = 100;
  @type("number") resource = 100;
  @type("number") maxResource = 100;
  @type("number") facing = 1;
  @type("number") rating = 1000;
  @type("string") action = "idle";
  @type("boolean") connected = true;
}

export class ArenaState extends Schema {
  @type({ map: ArenaPlayer }) players = new MapSchema<ArenaPlayer>();
  @type("string") status = "waiting";
  @type("number") startedAt = 0;
  @type("string") winnerId = "";
}

interface ServerPlayer {
  input: InputMessage;
  nextAttackAt: number;
  nextDashAt: number;
  nextSkillAt: number[];
}

export class ArenaRoom extends Room<ArenaState> {
  maxClients = 2;
  maxMessagesPerSecond = 30;
  private runtime = new Map<string, ServerPlayer>();

  onCreate() {
    this.state = new ArenaState();
    this.setPatchRate(50);
    this.setSimulationInterval((delta) => this.update(delta));

    this.onMessage("input", (client, message: InputMessage) => {
      const runtime = this.runtime.get(client.sessionId);
      if (!runtime) return;
      runtime.input = { left: Boolean(message?.left), right: Boolean(message?.right), jump: Boolean(message?.jump) };
    });

    this.onMessage("action", (client, message: ActionMessage) => {
      const player = this.state.players.get(client.sessionId);
      const runtime = this.runtime.get(client.sessionId);
      if (!player || !runtime || this.state.status !== "running") return;
      const action = message?.action;
      if (!action) return;
      const now = Date.now();

      if (action === "dash") {
        if (now < runtime.nextDashAt) return;
        runtime.nextDashAt = now + 850;
        player.action = "dash";
        player.x = Math.max(-560, Math.min(560, player.x + player.facing * 150));
        this.clock.setTimeout(() => {
          const current = this.state.players.get(client.sessionId);
          if (current) current.action = "idle";
        }, 180);
        return;
      }

      const skillIndex = action.startsWith("skill") ? Number(action.slice(-1)) - 1 : -1;
      if (skillIndex >= 0) {
        const cooldowns = [5200, 9000, 14000];
        const costs = [25, 35, 45];
        const damageMultipliers = [2, 2.6, 3.2];
        if (!Number.isInteger(skillIndex) || skillIndex > 2) return;
        if (now < runtime.nextSkillAt[skillIndex] || player.resource < costs[skillIndex]) return;
        runtime.nextSkillAt[skillIndex] = now + cooldowns[skillIndex];
        player.resource -= costs[skillIndex];
        player.action = "skill";
        this.resolveAttack(client, damageMultipliers[skillIndex], player.x);
        return;
      }

      if (action === "attack") {
        if (now < runtime.nextAttackAt) return;
        runtime.nextAttackAt = now + 260;
        player.action = "attack";
        this.resolveAttack(client, 1, player.x);
      }
    });
  }

  onJoin(client: Client, options: { gameClass?: GameClass; rating?: number }) {
    const gameClass: GameClass = options?.gameClass === "arqueiro" || options?.gameClass === "mago" ? options.gameClass : "cavaleiro";
    const stats = CLASS_STATS[gameClass];
    const player = new ArenaPlayer();
    player.class = gameClass;
    player.maxHp = stats.hp;
    player.hp = stats.hp;
    player.maxResource = stats.resource;
    player.resource = stats.resource;
    player.rating = Math.max(0, Math.min(5000, Number(options?.rating) || 1000));
    player.x = this.clients.length === 1 ? -360 : 360;
    player.facing = player.x < 0 ? 1 : -1;

    this.state.players.set(client.sessionId, player);
    this.runtime.set(client.sessionId, { input: {}, nextAttackAt: 0, nextDashAt: 0, nextSkillAt: [0, 0, 0] });

    if (this.clients.length === 2) {
      this.state.status = "running";
      this.state.startedAt = Date.now();
      this.broadcast("match-start", { at: this.state.startedAt });
    }
  }

  onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player) player.connected = false;
    this.runtime.delete(client.sessionId);
    if (this.state.status === "running") {
      const opponent = Array.from(this.state.players.values()).find((p) => p.connected);
      if (opponent) {
        this.state.winnerId = this.findSessionId(opponent) ?? "";
        this.state.status = "finished";
        this.broadcast("match-end", { winnerId: this.state.winnerId, reason: "opponent-left" });
      }
    }
  }

  private update(delta: number) {
    if (this.state.status !== "running") return;
    const dt = Math.min(50, Math.max(0, delta)) / 1000;
    this.state.players.forEach((player, sessionId) => {
      const runtime = this.runtime.get(sessionId);
      if (!runtime || !player.connected) return;
      const stats = CLASS_STATS[player.class];
      const direction = Number(Boolean(runtime.input.right)) - Number(Boolean(runtime.input.left));
      if (direction !== 0) {
        player.x = Math.max(-560, Math.min(560, player.x + direction * stats.speed * dt));
        player.facing = direction as -1 | 1;
        player.action = player.action === "attack" || player.action === "skill" ? player.action : "run";
      } else if (player.action === "run") {
        player.action = "idle";
      }
      player.resource = Math.min(player.maxResource, player.resource + 10 * dt);
    });

    const players = Array.from(this.state.players.entries()).filter(([, p]) => p.connected);
    if (players.length === 2 && players.some(([, p]) => p.hp <= 0)) {
      const loser = players.find(([, p]) => p.hp <= 0);
      const winner = players.find(([, p]) => p.hp > 0);
      if (loser && winner) {
        this.state.winnerId = winner[0];
        this.state.status = "finished";
        this.broadcast("match-end", { winnerId: winner[0], loserId: loser[0], reason: "knockout" });
      }
    }
  }

  private resolveAttack(client: Client, multiplier: number, originX: number) {
    const attacker = this.state.players.get(client.sessionId);
    if (!attacker) return;
    const targetEntry = Array.from(this.state.players.entries()).find(([id, p]) => id !== client.sessionId && p.connected);
    if (!targetEntry) return;
    const target = targetEntry[1];
    const stats = CLASS_STATS[attacker.class];
    const range = stats.range + (attacker.class === "cavaleiro" ? 0 : 50);
    if (Math.abs(target.x - originX) > range) return;
    const base = stats.attack * multiplier;
    const defense = target.class === "cavaleiro" ? 20 : target.class === "arqueiro" ? 11 : 8;
    const damage = Math.max(1, Math.round(base * (100 / (100 + defense))));
    target.hp = Math.max(0, target.hp - damage);
    this.broadcast("hit-confirmed", { attackerId: client.sessionId, targetId: targetEntry[0], damage, remainingHp: target.hp });
  }

  private findSessionId(target: ArenaPlayer) {
    for (const [id, player] of this.state.players.entries()) if (player === target) return id;
    return undefined;
  }
}