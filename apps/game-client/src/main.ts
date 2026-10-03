import Phaser from "phaser";
import "./styles.css";
import { BootScene } from "./scenes/BootScene";
import { CharacterSelectScene } from "./scenes/CharacterSelectScene";
import { WorldScene } from "./scenes/WorldScene";

export function detectInputMode(): "touch"|"keyboard"|"controller" {
  const hasTouch=navigator.maxTouchPoints>0 && window.matchMedia("(pointer: coarse)").matches;
  const hasController=navigator.getGamepads?.().some(Boolean) ?? false;
  if(hasTouch)return "touch";
  if(hasController)return "controller";
  return "keyboard";
}

function createPlaceholderTextures(scene:Phaser.Scene){
  const make=(key:string,color:number,w:number,h:number)=>{
    const g=scene.add.graphics();g.fillStyle(color,1);g.fillRoundedRect(0,0,w,h,12);g.generateTexture(key,w,h);g.destroy();
  };
  make("placeholder-player",0x8d6b4f,64,96);
  make("placeholder-enemy",0x8f303d,64,90);
}

const config:Phaser.Types.Core.GameConfig={
 type:Phaser.AUTO,width:1280,height:720,backgroundColor:"#080a0f",
 parent:"game",physics:{default:"arcade",arcade:{gravity:{y:900},debug:false}},
 scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
 scene:[BootScene,CharacterSelectScene,WorldScene]
};

const game=new Phaser.Game(config);
game.events.once("ready",()=>createPlaceholderTextures(game.scene.getScene("BootScene")));
export { game };
