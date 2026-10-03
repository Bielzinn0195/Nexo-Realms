import type { GameClass, InventoryState, SaveSlot } from "@nexo-realms/shared";

export interface QuestSave {
  id: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface RuntimeSave extends SaveSlot {
  version: number;
  experience: number;
  skillPoints: number;
  gold: number;
  inventory: InventoryState;
  defeatedBosses: string[];
  discoveredAreas: string[];
  quests: QuestSave[];
  skillLevels: Record<string, number>;
}

const key = (slot: number) => "nexo-realms-save-" + slot;
const CURRENT_VERSION = 2;

const DEFAULT_QUESTS: QuestSave[] = [
  { id: "first-awakening", progress: 0, completed: false, claimed: false },
  { id: "pathfinder", progress: 1, completed: false, claimed: false },
  { id: "forge-apprentice", progress: 0, completed: false, claimed: false },
];

export class SaveSystem {
  save(slot: 1 | 2 | 3, data: Omit<RuntimeSave, "slot" | "updatedAt" | "version">) {
    const value: RuntimeSave = { ...data, slot, version: CURRENT_VERSION, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(key(slot), JSON.stringify(value)); } catch { throw new Error("Não foi possível salvar: armazenamento local indisponível ou cheio."); }
    return value;
  }

  load(slot: 1 | 2 | 3): RuntimeSave | undefined {
    const raw = localStorage.getItem(key(slot));
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw) as Partial<RuntimeSave>;
      if (!parsed.gameClass || !parsed.inventory) return undefined;
      const normalizedInventory = { ...parsed.inventory, items: Array.isArray(parsed.inventory.items) ? parsed.inventory.items.map((item:any)=>({ ...item, quantity:Math.max(1,Math.floor(Number(item.quantity??1))), upgradeLevel:Math.max(0,Math.floor(Number(item.upgradeLevel??0))), experience:Math.max(0,Number(item.experience??0)) })) : [] };
      const safeClass = parsed.gameClass === "arqueiro" || parsed.gameClass === "mago" || parsed.gameClass === "cavaleiro" ? parsed.gameClass : "cavaleiro";
      return {
        version: parsed.version ?? 1,
        slot,
        characterName: parsed.characterName ?? "Aventureiro",
        gameClass: safeClass,
        level: Math.max(1, parsed.level ?? 1),
        experience: Math.max(0, parsed.experience ?? 0),
        skillPoints: Math.max(0, parsed.skillPoints ?? 0),
        gold: Math.max(0, parsed.gold ?? parsed.inventory.gold ?? 0),
        inventory: { ...normalizedInventory, capacity: Math.max(1, Math.min(200, Number(parsed.inventory.capacity ?? 36))), gold: Math.max(0, Number(parsed.inventory.gold ?? 0)), gems: Math.max(0, Number(parsed.inventory.gems ?? 0)) },
        areaId: parsed.areaId ?? "forest-of-beginnings",
        checkpointId: parsed.checkpointId ?? "forest-gate",
        defeatedBosses: parsed.defeatedBosses ?? [],
        discoveredAreas: parsed.discoveredAreas ?? ["forest-of-beginnings"],
        quests: parsed.quests ?? DEFAULT_QUESTS,
        skillLevels: parsed.skillLevels ?? {},
        updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
      };
    } catch {
      return undefined;
    }
  }

  list(): Array<SaveSlot | undefined> {
    return [1, 2, 3].map((slot) => {
      const save = this.load(slot as 1 | 2 | 3);
      return save
        ? { slot: save.slot, characterName: save.characterName, gameClass: save.gameClass, level: save.level, areaId: save.areaId, checkpointId: save.checkpointId, updatedAt: save.updatedAt }
        : undefined;
    });
  }

  delete(slot: 1 | 2 | 3) {
    localStorage.removeItem(key(slot));
  }

  static createNew(slot: 1 | 2 | 3, name: string, gameClass: GameClass, inventory: InventoryState): RuntimeSave {
    return {
      slot,
      version: CURRENT_VERSION,
      characterName: name,
      gameClass,
      level: 1,
      experience: 0,
      skillPoints: 0,
      gold: inventory.gold,
      inventory,
      areaId: "forest-of-beginnings",
      checkpointId: "forest-gate",
      updatedAt: new Date().toISOString(),
      defeatedBosses: [],
      discoveredAreas: ["forest-of-beginnings"],
      quests: DEFAULT_QUESTS.map((quest) => ({ ...quest })),
      skillLevels: {},
    };
  }
}
