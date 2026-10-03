import Phaser from "phaser";
import type { GameClass, InputMode } from "@nexo-realms/shared";
import { CLASS_CONFIG } from "@nexo-realms/shared";

export class HUD {
  private hp?: Phaser.GameObjects.Graphics;
  private resource?: Phaser.GameObjects.Graphics;
  private touchGroup?: Phaser.GameObjects.Container;
  private joystickBase?: Phaser.GameObjects.Arc;
  private joystickKnob?: Phaser.GameObjects.Arc;
  private touchVector = { x: 0, y: 0 };
  private activePointerId?: number;
  private prompt?: Phaser.GameObjects.Text;
  private attackFn = () => {};
  private dashFn = () => {};
  private skillFn = (_: number) => {};
  private inventoryFn = () => {};

  constructor(private readonly scene: Phaser.Scene, private readonly inputMode: InputMode, gameClass: GameClass) {
    const cfg = CLASS_CONFIG[gameClass];
    this.hp = scene.add.graphics().setScrollFactor(0);
    this.resource = scene.add.graphics().setScrollFactor(0);

    scene.add.text(24, 18, cfg.name.toUpperCase(), { fontFamily: "Arial", fontSize: "18px", color: "#fff", fontStyle: "bold" }).setScrollFactor(0);
    scene.add.text(24, 42, "HP", { fontFamily: "Arial", fontSize: "11px", color: "#d8dbe5" }).setScrollFactor(0);
    scene.add.text(24, 70, cfg.resourceName.toUpperCase(), { fontFamily: "Arial", fontSize: "11px", color: "#d8dbe5" }).setScrollFactor(0);

    this.prompt = scene.add.text(scene.scale.width - 24, 48, "", {
      fontFamily: "Arial", fontSize: "11px", color: "#aab2c3", align: "right",
    }).setOrigin(1, 0).setScrollFactor(0);

    if (inputMode === "touch") {
      this.createTouchControls();
      this.prompt.setText("Toque: ataque • dash • habilidades • bolsa");
    } else if (inputMode === "controller") {
      this.prompt.setText("Controle: X ataque • A dash • LB/RB/RT habilidades");
    } else {
      this.prompt.setText("J ataque • K dash • 1/2/3 habilidades • I inventário • M modos");
    }
  }

  setActions(attack: () => void, dash: () => void, skill: (index: number) => void, inventory: () => void) {
    this.attackFn = attack;
    this.dashFn = dash;
    this.skillFn = skill;
    this.inventoryFn = inventory;
  }

  getMoveVector() {
    return { ...this.touchVector };
  }

  update(hp: number, maxHp: number, resource: number, maxResource: number) {
    const draw = (g: Phaser.GameObjects.Graphics, y: number, value: number, max: number, fill: number) => {
      g.clear();
      g.fillStyle(0x1c202b);
      g.fillRect(24, y, 220, 16);
      g.fillStyle(fill);
      g.fillRect(24, y, 220 * Phaser.Math.Clamp(max > 0 ? value / max : 0, 0, 1), 16);
      g.lineStyle(1, 0x4a5264);
      g.strokeRect(24, y, 220, 16);
    };
    if (this.hp) draw(this.hp, 54, hp, maxHp, 0xd94b5b);
    if (this.resource) draw(this.resource, 82, resource, maxResource, 0x4f8fff);
  }

  private createTouchControls() {
    this.touchGroup = this.scene.add.container(0, 0).setScrollFactor(0);
    const baseX = 105;
    const baseY = this.scene.scale.height - 115;
    this.joystickBase = this.scene.add.circle(baseX, baseY, 58, 0x222838, 0.72).setStrokeStyle(2, 0x66708a).setInteractive();
    this.joystickKnob = this.scene.add.circle(baseX, baseY, 24, 0x53627e, 0.9).setStrokeStyle(2, 0x9ba8c4);
    this.touchGroup.add([this.joystickBase, this.joystickKnob]);

    const updateJoystick = (pointer: Phaser.Input.Pointer) => { if(this.activePointerId!==undefined&&pointer.id!==this.activePointerId)return;
      const dx = pointer.x - baseX;
      const dy = pointer.y - baseY;
      const distance = Math.min(58, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);
      const nx = distance * Math.cos(angle);
      const ny = distance * Math.sin(angle);
      this.touchVector.x = nx / 58;
      this.touchVector.y = ny / 58;
      this.joystickKnob?.setPosition(baseX + nx, baseY + ny);
    };
    this.joystickBase.on("pointerdown", (pointer:Phaser.Input.Pointer)=>{this.activePointerId=pointer.id;updateJoystick(pointer);});
    this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && pointer.x < this.scene.scale.width * 0.42) updateJoystick(pointer);
    });
    this.scene.input.on("pointerup", (pointer:Phaser.Input.Pointer) => { if(this.activePointerId!==undefined&&pointer.id!==this.activePointerId)return; this.activePointerId=undefined;
      this.touchVector.x = 0;
      this.touchVector.y = 0;
      this.joystickKnob?.setPosition(baseX, baseY);
    });

    const buttons: Array<[string, number, number, () => void]> = [
      ["ATK", this.scene.scale.width - 105, this.scene.scale.height - 120, () => this.attackFn()],
      ["DASH", this.scene.scale.width - 205, this.scene.scale.height - 65, () => this.dashFn()],
      ["S1", this.scene.scale.width - 310, this.scene.scale.height - 80, () => this.skillFn(0)],
      ["S2", this.scene.scale.width - 390, this.scene.scale.height - 120, () => this.skillFn(1)],
      ["S3", this.scene.scale.width - 300, this.scene.scale.height - 190, () => this.skillFn(2)],
      ["BAG", this.scene.scale.width - 110, this.scene.scale.height - 220, () => this.inventoryFn()],
    ];
    buttons.forEach(([label, x, y, fn]) => {
      const c = this.scene.add.circle(x, y, 34, 0x262d40, 0.9).setStrokeStyle(2, 0x69779a).setInteractive();
      const t = this.scene.add.text(x, y, label, { fontFamily: "Arial", fontSize: "10px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setInteractive();
      c.on("pointerdown", fn);
      t.on("pointerdown", fn);
      this.touchGroup?.add([c, t]);
    });
  }
}
