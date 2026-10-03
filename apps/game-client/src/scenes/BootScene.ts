import Phaser from "phaser";
import { inputMode } from "../main";

export class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }

  create() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height * 0.28, "NEXO REALMS", {
      fontFamily: "Georgia, serif", fontSize: "64px", color: "#f2ead7"
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.43, "A connected dark-fantasy action RPG", {
      fontFamily: "Arial", fontSize: "20px", color: "#a9b0bd"
    }).setOrigin(0.5);

    const modeLabel = inputMode === "touch" ? "TOUCH / MOBILE" :
      inputMode === "controller" ? "CONTROLLER" : "KEYBOARD / MOUSE";

    this.add.text(width / 2, height * 0.56, `INPUT DETECTED: ${modeLabel}`, {
      fontFamily: "Arial", fontSize: "18px", color: "#d7b56d"
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.68, "Prototype foundation — movement/combat systems follow.", {
      fontFamily: "Arial", fontSize: "16px", color: "#737b88"
    }).setOrigin(0.5);
  }
}
