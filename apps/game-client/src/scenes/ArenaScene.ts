import Phaser from "phaser";
import { Client } from "colyseus.js";
import type { GameClass } from "@nexo-realms/shared";
import { applyArenaResult, getTier } from "../systems/RankSystem";

interface RemotePlayer {
  class: GameClass;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  action: string;
  facing: number;
}

export class ArenaScene extends Phaser.Scene {
  private rating = Number(localStorage.getItem("nexo-arena-rating") ?? 1000);
  private status?: Phaser.GameObjects.Text;
  private room?: any;
  private gameClass: GameClass = "cavaleiro";
  private connected = false;
  private queueing = false;
  private localX = 0;
  private players = new Map<string, Phaser.GameObjects.Rectangle>();
  private labels = new Map<string, Phaser.GameObjects.Text>();
  private inputPrevious: boolean[] = [];
  private touchButtons: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("ArenaScene");
  }

  create(data: { gameClass: GameClass }) {
    this.gameClass = data.gameClass;
    this.cameras.main.setBackgroundColor("#080c15");

    this.add.text(this.scale.width / 2, 42, "ARENA • ONLINE 1v1", {
      fontFamily: "Arial", fontSize: "34px", color: "#fff", fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(this.scale.width / 2, 82, "Servidor autoritativo • casual • ranqueada • sala privada", {
      fontFamily: "Arial", fontSize: "14px", color: "#9ba6bc",
    }).setOrigin(0.5);

    this.add.rectangle(this.scale.width / 2, 370, 1120, 360, 0x101725).setStrokeStyle(2, 0x313d56);
    this.add.line(this.scale.width / 2, 370, this.scale.width / 2 - 520, 370, this.scale.width / 2 + 520, 370, 0x38465e).setLineWidth(2);

    this.status = this.add.text(this.scale.width / 2, 155, "Pronto para buscar uma partida.", {
      fontFamily: "Arial", fontSize: "20px", color: "#fff", align: "center",
    }).setOrigin(0.5);

    const queue = this.add.rectangle(this.scale.width / 2, 215, 250, 56, 0x27385f)
      .setStrokeStyle(2, 0x739cff).setInteractive({ useHandCursor: true });
    this.add.text(queue.x, queue.y, "BUSCAR PARTIDA", {
      fontFamily: "Arial", fontSize: "15px", color: "#fff", fontStyle: "bold",
    }).setOrigin(0.5);
    queue.on("pointerdown", () => void this.queue());

    this.add.text(24, 22, "RATING " + this.rating + " • " + getTier(this.rating).name, {
      fontFamily: "Arial", fontSize: "16px", color: "#d8c6ff",
    });
    this.add.text(this.scale.width - 24, 22, "ESC • voltar", {
      fontFamily: "Arial", fontSize: "11px", color: "#aab2c3",
    }).setOrigin(1, 0);

    if (navigator.maxTouchPoints > 0) this.createTouchButtons();

    this.input.keyboard?.on("keydown-J", () => this.sendAction("attack"));
    this.input.keyboard?.on("keydown-K", () => this.sendAction("dash"));
    this.input.keyboard?.on("keydown-ONE", () => this.sendAction("skill1"));
    this.input.keyboard?.on("keydown-TWO", () => this.sendAction("skill2"));
    this.input.keyboard?.on("keydown-THREE", () => this.sendAction("skill3"));
    this.input.keyboard?.on("keydown-ESC", () => this.leave());
  }

  update() {
    if (!this.room || !this.connected) return;

    const left = this.input.keyboard?.addKey("A").isDown || this.input.keyboard?.addKey("LEFT").isDown;
    const right = this.input.keyboard?.addKey("D").isDown || this.input.keyboard?.addKey("RIGHT").isDown;
    this.room.send("input", { left: Boolean(left), right: Boolean(right) });

    const pad = navigator.getGamepads?.().find((item) => Boolean(item?.connected));
    if (pad) {
      const axis = Math.abs(pad.axes[0] ?? 0) > 0.15 ? pad.axes[0] : 0;
      this.room.send("input", { left: axis < -0.15, right: axis > 0.15 });
      const edge = (index: number) => Boolean(pad.buttons[index]?.pressed) && !this.inputPrevious[index];
      if (edge(2)) this.sendAction("attack");
      if (edge(0)) this.sendAction("dash");
      if (edge(4)) this.sendAction("skill1");
      if (edge(5)) this.sendAction("skill2");
      if (edge(7)) this.sendAction("skill3");
      this.inputPrevious = pad.buttons.map((button) => Boolean(button.pressed));
    }

    this.renderRoomState();
  }

  private async queue() {
    if (this.queueing || this.connected) return;
    this.queueing = true;
    this.status?.setText("Conectando ao servidor...");
    try {
      const endpoint = (import.meta.env.VITE_MULTIPLAYER_URL as string | undefined) ?? "http://localhost:2567";
      const client = new Client(endpoint);
      this.room = await client.joinOrCreate("arena", { gameClass: this.gameClass, rating: this.rating });
      this.connected = true;
      this.queueing = false;
      this.status?.setText("Sala encontrada • aguardando oponente...");
      this.room.onMessage("match-start", () => this.status?.setText("PARTIDA INICIADA"));
      this.room.onMessage("hit-confirmed", (message: { targetId: string; damage: number }) => {
        const label = this.labels.get(message.targetId);
        if (label) label.setText("-" + message.damage);
      });
      this.room.onMessage("match-end", (message: { winnerId: string; reason: string }) => {
        const won = message.winnerId === this.room.sessionId;
        this.rating = applyArenaResult(this.rating, won, 1000);
        localStorage.setItem("nexo-arena-rating", String(this.rating));
        this.status?.setText((won ? "VITÓRIA" : "DERROTA") + " • " + message.reason + "\nRating: " + this.rating + " • " + getTier(this.rating).name);
        this.connected = false;
      });
      this.room.onLeave(() => {
        this.connected = false;
        this.queueing = false;
        this.status?.setText("Conexão encerrada.");
      });
    } catch (error) {
      console.warn(error);
      this.queueing = false;
      this.status?.setText("Servidor indisponível. Inicie o multiplayer-server para jogar online.");
    }
  }

  private renderRoomState() {
    if (!this.room?.state?.players) return;
    const active = new Set<string>();

    this.room.state.players.forEach((player: RemotePlayer, sessionId: string) => {
      active.add(sessionId);
      let view = this.players.get(sessionId);
      if (!view) {
        const color = player.class === "cavaleiro" ? 0x8f98a6 : player.class === "arqueiro" ? 0x719b57 : 0x557dcc;
        view = this.add.rectangle(0, 500, 58, 86, color).setStrokeStyle(2, 0xffffff);
        this.players.set(sessionId, view);
        const label = this.add.text(0, 440, player.class.toUpperCase() + " • HP", {
          fontFamily: "Arial", fontSize: "11px", color: "#fff", align: "center",
        }).setOrigin(0.5);
        this.labels.set(sessionId, label);
      }
      const screenX = this.scale.width / 2 + player.x;
      view.setPosition(screenX, 520);
      view.setFlipX(player.facing < 0);
      const label = this.labels.get(sessionId);
      label?.setPosition(screenX, 450).setText(player.class.toUpperCase() + " • " + Math.max(0, Math.round(player.hp)) + "/" + player.maxHp);
      if (sessionId === this.room.sessionId) this.localX = player.x;
    });

    this.players.forEach((view, id) => {
      if (!active.has(id)) {
        view.destroy();
        this.players.delete(id);
        this.labels.get(id)?.destroy();
        this.labels.delete(id);
      }
    });
  }

  private sendAction(action: "attack" | "dash" | "skill1" | "skill2" | "skill3") {
    if (this.room && this.connected) this.room.send("action", { action });
  }

  private createTouchButtons() {
    const buttons: Array<[string, number, number, () => void]> = [
      ["ATK", this.scale.width - 90, this.scale.height - 85, () => this.sendAction("attack")],
      ["DASH", this.scale.width - 180, this.scale.height - 55, () => this.sendAction("dash")],
      ["S1", this.scale.width - 265, this.scale.height - 65, () => this.sendAction("skill1")],
      ["S2", this.scale.width - 330, this.scale.height - 125, () => this.sendAction("skill2")],
      ["S3", this.scale.width - 250, this.scale.height - 155, () => this.sendAction("skill3")],
    ];
    buttons.forEach(([label, x, y, fn]) => {
      const button = this.add.circle(x, y, 28, 0x28334a, 0.92).setStrokeStyle(2, 0x7180a0).setInteractive();
      const text = this.add.text(x, y, label, { fontFamily: "Arial", fontSize: "9px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setInteractive();
      button.on("pointerdown", fn);
      text.on("pointerdown", fn);
      this.touchButtons.push(button, text);
    });
  }

  private leave() {
    if (this.room) {
      void this.room.leave();
      this.room = undefined;
    }
    this.connected = false;
    this.queueing = false;
    this.scene.start("WorldScene", { gameClass: this.gameClass });
  }
}
