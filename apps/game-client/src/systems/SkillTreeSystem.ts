import type { GameClass } from "@nexo-realms/shared";

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
  requires?: string;
}

export interface SkillBonuses {
  damageMultiplier: number;
  defenseMultiplier: number;
  critChance: number;
  moveSpeed: number;
  magicPower: number;
  maxResource: number;
  ultimateMultiplier: number;
}

export const SKILLS: Record<GameClass, SkillNode[]> = {
  cavaleiro: [
    { id: "knight-combo", name: "Combo de Aço", description: "+8% dano de ataques.", cost: 1, level: 0, maxLevel: 5 },
    { id: "knight-guard", name: "Guarda Perfeita", description: "+6% defesa.", cost: 1, level: 0, maxLevel: 5, requires: "knight-combo" },
    { id: "knight-ult", name: "Sentença", description: "Ataque final recebe +25% dano.", cost: 2, level: 0, maxLevel: 3, requires: "knight-guard" },
  ],
  arqueiro: [
    { id: "archer-crit", name: "Olho Preciso", description: "+2% crítico.", cost: 1, level: 0, maxLevel: 5 },
    { id: "archer-speed", name: "Passo Leve", description: "+6 velocidade.", cost: 1, level: 0, maxLevel: 5, requires: "archer-crit" },
    { id: "archer-ult", name: "Caçada", description: "Habilidades recebem +20% dano.", cost: 2, level: 0, maxLevel: 3, requires: "archer-speed" },
  ],
  mago: [
    { id: "mage-power", name: "Fluxo Arcano", description: "+5 poder mágico.", cost: 1, level: 0, maxLevel: 5 },
    { id: "mage-mana", name: "Fonte de Mana", description: "+10 recurso máximo.", cost: 1, level: 0, maxLevel: 5, requires: "mage-power" },
    { id: "mage-ult", name: "Cataclismo", description: "Meteoro recebe +25% dano.", cost: 2, level: 0, maxLevel: 3, requires: "mage-mana" },
  ],
};

export class SkillTreeSystem {
  nodes: SkillNode[];
  points = 0;

  constructor(public readonly gameClass: GameClass) {
    this.nodes = SKILLS[gameClass].map((node) => ({ ...node }));
  }

  unlock(id: string) {
    const node = this.nodes.find((item) => item.id === id);
    if (!node || node.level >= node.maxLevel || node.cost <= 0 || this.points < node.cost) return false;
    if (node.requires && !(this.nodes.find((item) => item.id === node.requires)?.level)) return false;
    this.points -= node.cost;
    node.level++;
    return true;
  }

  restore(levels: Record<string, number> | undefined, points: number) {
    this.nodes.forEach((node) => {
      node.level = Math.max(0, Math.min(node.maxLevel, Math.floor(levels?.[node.id] ?? 0)));
    });
    this.points = Math.max(0, Math.min(999, Math.floor(points)));
  }

  exportLevels() {
    return Object.fromEntries(this.nodes.filter((node) => node.level > 0).map((node) => [node.id, node.level]));
  }

  getBonuses(): SkillBonuses {
    const level = (id: string) => this.nodes.find((node) => node.id === id)?.level ?? 0;
    return {
      damageMultiplier: 1 + (this.gameClass === "cavaleiro" ? level("knight-combo") * 0.08 : 0),
      defenseMultiplier: 1 + (this.gameClass === "cavaleiro" ? level("knight-guard") * 0.06 : 0),
      critChance: this.gameClass === "arqueiro" ? level("archer-crit") * 2 : 0,
      moveSpeed: this.gameClass === "arqueiro" ? level("archer-speed") * 6 : 0,
      magicPower: this.gameClass === "mago" ? level("mage-power") * 5 : 0,
      maxResource: this.gameClass === "mago" ? level("mage-mana") * 10 : 0,
      ultimateMultiplier: this.gameClass === "cavaleiro"
        ? 1 + level("knight-ult") * 0.25
        : this.gameClass === "arqueiro"
          ? 1 + level("archer-ult") * 0.2
          : 1 + level("mage-ult") * 0.25,
    };
  }
}
