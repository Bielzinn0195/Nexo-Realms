import type { EquipmentSlot,ItemDefinition } from "@nexo-realms/shared";

export interface EquipmentComparison {
 slot:EquipmentSlot;
 current?:ItemDefinition;
 candidate:ItemDefinition;
 powerDelta:number;
 attackDelta:number;
 defenseDelta:number;
 magicDelta:number;
 recommendation:"upgrade"|"downgrade"|"sidegrade";
}

export function compareEquipment(slot:EquipmentSlot,candidate:ItemDefinition,current?:ItemDefinition):EquipmentComparison{
 const candidatePower=candidate.basePower;
 const currentPower=current?.basePower??0;
 const attackDelta=(candidate.stats.attack??0)-(current?.stats.attack??0);
 const defenseDelta=(candidate.stats.defense??0)-(current?.stats.defense??0);
 const magicDelta=(candidate.stats.magicPower??0)-(current?.stats.magicPower??0);
 const powerDelta=candidatePower-currentPower;
 const recommendation=powerDelta>3?"upgrade":powerDelta< -3?"downgrade":"sidegrade";
 return {slot,current,candidate,powerDelta,attackDelta,defenseDelta,magicDelta,recommendation};
}
