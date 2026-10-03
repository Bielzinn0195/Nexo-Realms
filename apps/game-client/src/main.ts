import Phaser from "phaser";
import "./styles.css";
import { BootScene } from "./scenes/BootScene";
import { CharacterSelectScene } from "./scenes/CharacterSelectScene";
import { WorldScene } from "./scenes/WorldScene";
import { ModeMenuScene } from "./scenes/ModeMenuScene";
import { TowerScene } from "./scenes/TowerScene";
import { BossRushScene } from "./scenes/BossRushScene";
import { ArenaScene } from "./scenes/ArenaScene";

export function detectInputMode(): "touch"|"keyboard"|"controller" {
  const hasTouch=navigator.maxTouchPoints>0 && window.matchMedia("(pointer: coarse)").matches;
  const hasController=navigator.getGamepads?.().some(Boolean) ?? false;
  if(hasTouch)return "touch";
  if(hasController)return "controller";
  return "keyboard";
}

const config:Phaser.Types.Core.GameConfig={
 type:Phaser.AUTO,width:1280,height:720,backgroundColor:"#080a0f",
 parent:"game",physics:{default:"arcade",arcade:{gravity:{x:0,y:900},debug:false}},
 scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
 scene:[BootScene,CharacterSelectScene,WorldScene,ModeMenuScene,TowerScene,BossRushScene,ArenaScene]
};

const game=new Phaser.Game(config);
export { game };
