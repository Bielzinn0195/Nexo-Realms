import Phaser from "phaser";
import { QuestSystem } from "../systems/QuestSystem";

export class QuestPanel {
  private container?: Phaser.GameObjects.Container;

  constructor(private readonly scene: Phaser.Scene, private readonly quests: QuestSystem, private readonly claim: (id: string) => void) {}

  toggle() {
    if (this.container) {
      this.container.destroy(true);
      this.container = undefined;
      return;
    }
    this.open();
  }

  private open() {
    const width = Math.min(820, this.scene.scale.width - 30);
    const height = Math.min(560, this.scene.scale.height - 30);
    const bg = this.scene.add.rectangle(this.scene.scale.width / 2, this.scene.scale.height / 2, width, height, 0x0d1018, 0.98)
      .setStrokeStyle(2, 0x53607a);
    const title = this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2 - height / 2 + 32, "DIÁRIO DE MISSÕES", {
      fontFamily: "Arial", fontSize: "26px", color: "#fff", fontStyle: "bold",
    }).setOrigin(0.5);

    this.container = this.scene.add.container(0, 0, [bg, title]);

    this.quests.quests.forEach((quest, index) => {
      const y = this.scene.scale.height / 2 - height / 2 + 90 + index * Math.min(125,Math.max(96,(height-150)/3));
      const card = this.scene.add.rectangle(this.scene.scale.width / 2, y, width - 50, 105, 0x171d28)
        .setStrokeStyle(1, quest.completed ? 0x6d7cff : 0x394255);
      const text = this.scene.add.text(this.scene.scale.width / 2 - width / 2 + 38, y - 35,
        quest.title + " • " + quest.progress + "/" + quest.target + "\n" + quest.description,
        { fontFamily: "Arial", fontSize: "14px", color: "#fff", lineSpacing: 7, wordWrap: { width: width - 230 } });
      this.container!.add([card, text]);

      if (quest.completed && !quest.claimed) {
        const button = this.scene.add.rectangle(this.scene.scale.width / 2 + width / 2 - 95, y, 130, 40, 0x2d4774)
          .setStrokeStyle(1, 0x8ca3ff).setInteractive({ useHandCursor: true });
        const label = this.scene.add.text(button.x, button.y, "RESGATAR", {
          fontFamily: "Arial", fontSize: "11px", color: "#fff", fontStyle: "bold",
        }).setOrigin(0.5);
        button.on("pointerdown", () => {
          this.claim(quest.id);
          this.refresh();
        });
        this.container!.add([button, label]);
      } else {
        this.container!.add(this.scene.add.text(this.scene.scale.width / 2 + width / 2 - 95, y, quest.claimed ? "RESGATADA" : "EM PROGRESSO", {
          fontFamily: "Arial", fontSize: "10px", color: quest.claimed ? "#7fd19a" : "#8994a9",
        }).setOrigin(0.5));
      }
    });

    this.container!.add(this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2 + height / 2 - 22, "Q para fechar • complete objetivos durante a exploração", {
      fontFamily: "Arial", fontSize: "11px", color: "#727e94",
    }).setOrigin(0.5));
  }

  private refresh() {
    this.container?.destroy(true);
    this.container = undefined;
    this.open();
  }
}
