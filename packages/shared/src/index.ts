export type GameClass = "guardiao" | "errante" | "arcanista";
export type InputMode = "touch" | "keyboard" | "controller";

export interface SaveSlot {
  slot: 1 | 2 | 3;
  characterName: string;
  gameClass: GameClass;
  level: number;
  areaId: string;
  checkpointId: string;
  updatedAt: string;
}

export interface PlayerCombatState {
  hp: number;
  maxHp: number;
  resource: number;
  maxResource: number;
  x: number;
  y: number;
  facing: -1 | 1;
}

export const WORLD_AREAS = [
  "forest-of-beginnings",
  "central-city",
  "forgotten-mines",
  "drowned-swamp",
  "ancient-ruins",
  "final-fortress"
] as const;
