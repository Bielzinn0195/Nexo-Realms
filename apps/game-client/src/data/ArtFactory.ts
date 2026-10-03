import Phaser from "phaser";
import type {GameClass} from "@nexo-realms/shared";

const palettes:Record<GameClass,{body:number;accent:number;metal:number}>={
 cavaleiro:{body:0x4a4f59,accent:0xb43b2d,metal:0xd2d4d7},
 arqueiro:{body:0x425b34,accent:0x718c43,metal:0x8d6a43},
 mago:{body:0x293c6b,accent:0x356fc2,metal:0xd4b24c}
};

export function createGameArt(scene:Phaser.Scene){
 const make=(key:string,w:number,h:number,draw:(g:Phaser.GameObjects.Graphics)=>void)=>{if(scene.textures.exists(key))return;const g=scene.add.graphics();draw(g);g.generateTexture(key,w,h);g.destroy();};
 (Object.keys(palettes) as GameClass[]).forEach(c=>{
  const p=palettes[c];
  for(const pose of ["idle","run","attack-1","attack-2","attack-3","skill-1","skill-2","skill-3","dash","hurt","death"]){
   make("hero-"+c+"-"+pose,80,112,g=>{
    const lean=pose.startsWith("attack")||pose.startsWith("skill")?(pose==="attack-2"?8:-8):0;
    if(c==="cavaleiro"){g.fillStyle(p.accent).fillTriangle(18+lean,35,62+lean,28,68+lean,90);g.fillStyle(p.metal).fillRoundedRect(23+lean,24,35,54,8);g.fillStyle(0x151922).fillCircle(41+lean,20,17);g.fillStyle(0xf0b47d).fillCircle(41+lean,22,8);g.fillStyle(p.metal).fillRect(8+lean,55,12,30);g.fillStyle(0x30343c).fillRect(27+lean,75,10,28);g.fillStyle(0x30343c).fillRect(48+lean,75,10,28);g.fillStyle(0xb8bcc4).fillTriangle(61+lean,46,78+lean,55,61+lean,60);}
    else if(c==="arqueiro"){g.fillStyle(p.body).fillTriangle(18+lean,33,63+lean,31,68+lean,91);g.fillStyle(p.accent).fillRoundedRect(24+lean,24,34,53,12);g.fillStyle(0x10150f).fillCircle(41+lean,20,16);g.fillStyle(0xf0b47d).fillCircle(43+lean,23,7);g.lineStyle(4,0x8d6a43);g.beginPath();g.arc(13+lean,58,25,-1.1,1.1);g.strokePath();g.lineStyle(2,0xe1c08a);g.lineBetween(13+lean,34,13+lean,82);g.fillStyle(0x3c2a1f).fillRect(31+lean,78,8,28);g.fillStyle(0x3c2a1f).fillRect(50+lean,78,8,28);}
    else {g.fillStyle(p.body).fillTriangle(16+lean,37,66+lean,34,70+lean,92);g.fillStyle(p.accent).fillRoundedRect(22+lean,24,38,55,13);g.fillStyle(0xeeeeef).fillCircle(41+lean,20,16);g.fillStyle(0xf0b47d).fillCircle(42+lean,23,7);g.fillStyle(p.accent).fillRect(29+lean,76,10,29);g.fillStyle(p.accent).fillRect(48+lean,76,10,29);g.fillStyle(0x4dc9ff).fillCircle(69+lean,43,7);g.lineStyle(4,p.metal);g.lineBetween(66+lean,44,66+lean,82);}
    if(pose==="hurt")g.fillStyle(0xffffff,.45).fillRect(5,5,70,102);
    if(pose==="death")g.angle=25;
   });
  }
 });
 make("enemy-placeholder",64,86,g=>{g.fillStyle(0x713947).fillCircle(32,25,19);g.fillStyle(0x3b2028).fillTriangle(12,80,32,34,52,80);g.fillStyle(0xe3b2b7).fillCircle(26,25,3);g.fillStyle(0xe3b2b7).fillCircle(39,25,3);});
 make("floor",64,1,g=>g.fillStyle(0x11161c).fillRect(0,0,64,1));
 make("slash-fx",110,50,g=>{g.lineStyle(7,0xf5e2b5);g.beginPath();g.arc(40,25,35,-.8,.7);g.strokePath();});
 make("arrow-fx",64,10,g=>{g.fillStyle(0xd7b27c).fillRect(0,4,55,2);g.fillStyle(0xf1e1bf).fillTriangle(55,5,64,0,64,10);});
 make("magic-fx",44,44,g=>{g.fillStyle(0x5bd6ff,.3).fillCircle(22,22,21);g.fillStyle(0x9ceaff).fillCircle(22,22,11);});
}
