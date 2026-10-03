import {spawn} from "node:child_process";

const npm=process.platform==="win32"?"npm.cmd":"npm";
const children=[];
const start=(label,args)=>{const child=spawn(npm,args,{stdio:"inherit",env:{...process.env}});children.push({label,child});child.on("exit",(code,signal)=>{if(code&&code!==0)console.error(label+" exited with code "+code);else if(signal)console.log(label+" stopped ("+signal+")");});return child;};

console.log("\nNEXO REALMS local test");
console.log("Client: http://localhost:5173");
console.log("Multiplayer: http://localhost:2567");
console.log("Press Ctrl+C to stop both services.\n");

start("multiplayer",["run","dev:server"]);
start("client",["run","dev","-w","@nexo-realms/game-client"]);

const shutdown=(signal)=>{for(const {child} of children){if(!child.killed)child.kill(signal==="SIGINT"?"SIGINT":"SIGTERM");}setTimeout(()=>process.exit(0),250);};
process.on("SIGINT",()=>shutdown("SIGINT"));
process.on("SIGTERM",()=>shutdown("SIGTERM"));
