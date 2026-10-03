export interface BossPhase {threshold:number;name:string;speedMultiplier:number;damageMultiplier:number;description:string;}
export interface BossDefinition {id:string;name:string;title:string;hp:number;damage:number;arenaWidth:number;phases:BossPhase[];reward:string;}
export const BOSSES:BossDefinition[]=[
{id:"warden-of-roots",name:"Aldren, o Guardião das Raízes",title:"Senhor da Floresta",hp:2200,damage:28,arenaWidth:900,reward:"root-heart",phases:[
{threshold:1,name:"Raízes Despertas",speedMultiplier:1,damageMultiplier:1,description:"Golpes pesados e raízes surgem do chão."},
{threshold:.6,name:"Fúria Verde",speedMultiplier:1.2,damageMultiplier:1.25,description:"Invoca espinhos e acelera."},
{threshold:.25,name:"Último Broto",speedMultiplier:1.5,damageMultiplier:1.6,description:"A arena começa a ruir."}]},
{id:"iron-queen",name:"Veyra, Rainha do Ferro",title:"Soberana das Minas",hp:4200,damage:42,arenaWidth:1000,reward:"queen-core",phases:[
{threshold:1,name:"Forja Viva",speedMultiplier:1,damageMultiplier:1,description:"Martelo e projéteis de metal."},
{threshold:.5,name:"Sobrecarga",speedMultiplier:1.35,damageMultiplier:1.4,description:"A arena ganha zonas de calor."},
{threshold:.2,name:"Colapso",speedMultiplier:1.6,damageMultiplier:1.8,description:"Ataques em sequência e chão instável."}]},
{id:"eclipse-lord",name:"Noctis, Senhor do Eclipse",title:"Rei da Fortaleza",hp:8000,damage:68,arenaWidth:1200,reward:"eclipse-crown",phases:[
{threshold:1,name:"Eclipse",speedMultiplier:1,damageMultiplier:1,description:"Combina espada e magia."},
{threshold:.66,name:"Noite Absoluta",speedMultiplier:1.25,damageMultiplier:1.3,description:"Projéteis escuros atravessam a arena."},
{threshold:.33,name:"Coração do Eclipse",speedMultiplier:1.5,damageMultiplier:1.6,description:"A arena se divide em zonas perigosas."},
{threshold:.12,name:"Fim da Luz",speedMultiplier:1.8,damageMultiplier:2,description:"Sequência final de ataques."}]}];