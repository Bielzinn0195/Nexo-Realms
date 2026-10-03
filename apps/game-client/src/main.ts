import Phaser from "phaser";
import type { InputMode } from "@nexo-realms/shared";
import { BootScene } from "./scenes/BootScene";
import "./styles.css";

const detectInputMode = (): InputMode => {
  if (navigator.maxTouchPoints > 0 && window.matchMedia("(pointer: coarse)").matches) return "touch";
  if (navigator.getGamepads?.().some(Boolean)) return "controller";
  return "keyboard";
};

export const inputMode = detectInputMode();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "app",
  width: 1280,
  height: 720,
  backgroundColor: "#0b0d12",
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: "arcade", arcade: { gravity: { y: 900 }, debug: false } },
  scene: [BootScene]
});
