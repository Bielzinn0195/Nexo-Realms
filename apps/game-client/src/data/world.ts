export interface Region {id:string;name:string;subtitle:string;start:number;end:number;level:number;next?:string;color:number;}
export const REGIONS:Region[]=[
{id:"forest-of-beginnings",name:"Floresta do Começo",subtitle:"Onde o despertar começa.",start:0,end:900,level:1,next:"central-city",color:0x1b3522},
{id:"central-city",name:"Cidade de Aster",subtitle:"Um refúgio cercado pela noite.",start:900,end:1500,level:4,next:"forgotten-mines",color:0x26303d},
{id:"forgotten-mines",name:"Minas Esquecidas",subtitle:"Pedra, ferro e coisas que deveriam dormir.",start:1500,end:2200,level:7,next:"drowned-swamp",color:0x30261e},
{id:"drowned-swamp",name:"Pântano Afogado",subtitle:"A água guarda nomes esquecidos.",start:2200,end:2900,level:10,next:"ancient-ruins",color:0x183633},
{id:"ancient-ruins",name:"Ruínas Antigas",subtitle:"A magia deixou cicatrizes.",start:2900,end:3500,level:14,next:"final-fortress",color:0x2e283d},
{id:"final-fortress",name:"Fortaleza do Eclipse",subtitle:"O fim da estrada.",start:3500,end:4300,level:18,color:0x211b27}
];
export const regionAt=(x:number)=>REGIONS.find(r=>x>=r.start&&x<r.end)??REGIONS[REGIONS.length-1];