export type GameClass = "cavaleiro" | "arqueiro" | "mago";
export type InputMode = "touch" | "keyboard" | "controller";
export type EquipmentSlot = "weapon" | "helmet" | "chest" | "gloves" | "boots" | "ring" | "amulet";
export type ItemType = "weapon" | "armor" | "accessory" | "consumable" | "material";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

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

export interface ItemStats {
  attack?: number;
  defense?: number;
  magicPower?: number;
  critChance?: number;
  critDamage?: number;
  attackSpeed?: number;
  moveSpeed?: number;
  hp?: number;
  resource?: number;
  lifesteal?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  slot?: EquipmentSlot;
  rarity: Rarity;
  requiredLevel: number;
  basePower: number;
  stats: ItemStats;
  description: string;
  maxUpgradeLevel: number;
  sellValue: number;
  iconKey: string;
}

export interface InventoryItem {
  instanceId: string;
  itemId: string;
  quantity: number;
  upgradeLevel: number;
  locked: boolean;
}

export interface EquipmentState {
  weapon?: string;
  helmet?: string;
  chest?: string;
  gloves?: string;
  boots?: string;
  ring?: string;
  amulet?: string;
}

export interface InventoryState {
  capacity: number;
  gold: number;
  gems: number;
  materials: Record<string, number>;
  items: InventoryItem[];
  equipment: EquipmentState;
}

export interface CharacterProgression {
  level: number;
  experience: number;
  skillPoints: number;
  attributes: {
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
  };
}

export const CLASS_CONFIG: Record<GameClass, {
  name: string;
  resourceName: string;
  baseHp: number;
  baseResource: number;
  attack: number;
  defense: number;
  speed: number;
  skills: string[];
}> = {
  cavaleiro: {
    name: "Cavaleiro",
    resourceName: "Vigor",
    baseHp: 180,
    baseResource: 80,
    attack: 24,
    defense: 20,
    speed: 190,
    skills: ["shield-bash", "whirlwind", "guardian-stance"]
  },
  arqueiro: {
    name: "Arqueiro",
    resourceName: "Foco",
    baseHp: 130,
    baseResource: 110,
    attack: 28,
    defense: 11,
    speed: 225,
    skills: ["quick-shot", "rain-of-arrows", "evasive-shot"]
  },
  mago: {
    name: "Mago",
    resourceName: "Mana",
    baseHp: 105,
    baseResource: 160,
    attack: 20,
    defense: 8,
    speed: 175,
    skills: ["arcane-bolt", "frost-nova", "meteor"]
  }
};

export const WORLD_AREAS = [
  "forest-of-beginnings",
  "central-city",
  "forgotten-mines",
  "drowned-swamp",
  "ancient-ruins",
  "final-fortress"
] as const;
