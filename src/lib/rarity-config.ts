/**
 * Centralized rarity configuration map.
 * Every rarity badge, filter label, and deck usage bar should pull from here.
 *
 * Color anchors (Common, Rare, Ultra Rare, Secret Rare) come directly from the
 * "Duel Disk HUD" design reference. The remaining rarities don't appear in that
 * mockup — since the design only shows 4 tiers, but the game/API has 8 — so their
 * colors extrapolate the design's own two color families instead of guessing:
 * a cool gray/blue ramp for the common-ish tiers, and a warm gold/rose/champagne
 * family for the premium tiers above Secret Rare (mirroring real foil treatments:
 * Ghost Rare is printed in silver, Starlight Rare in a pale gold shimmer).
 */
export interface RarityEntry {
  /** Hex color for the rarity badge / accent */
  color: string;
  /** Labels by locale */
  label: {
    en: string;
    'pt-BR': string;
    ja: string;
  };
}

export const RARITY_CONFIG: Record<string, RarityEntry> = {
  Common: {
    color: '#8a929c',
    label: { en: 'Common', 'pt-BR': 'Comum', ja: 'ノーマル' },
  },
  Rare: {
    color: '#9fb4c7',
    label: { en: 'Rare', 'pt-BR': 'Rara', ja: 'レア' },
  },
  'Super Rare': {
    color: '#7fb3de',
    label: { en: 'Super Rare', 'pt-BR': 'Super Rara', ja: 'スーパーレア' },
  },
  'Ultra Rare': {
    color: '#C9A24B',
    label: { en: 'Ultra Rare', 'pt-BR': 'Ultra Rara', ja: 'ウルトラレア' },
  },
  'Secret Rare': {
    color: '#3AB0FF',
    label: { en: 'Secret Rare', 'pt-BR': 'Secreta', ja: 'シークレットレア' },
  },
  'Ultimate Rare': {
    color: '#d98bc9',
    label: { en: 'Ultimate Rare', 'pt-BR': 'Definitiva', ja: 'アルティメットレア' },
  },
  'Ghost Rare': {
    color: '#c7cdd6',
    label: { en: 'Ghost Rare', 'pt-BR': 'Fantasma', ja: 'ゴーストレア' },
  },
  'Starlight Rare': {
    color: '#f5e6b8',
    label: { en: 'Starlight Rare', 'pt-BR': 'Estrelar', ja: 'スターライトレア' },
  },
};

/**
 * Resolves a rarity string to its config entry, falling back to Common.
 * @param rarity - The rarity key (e.g. "Ultra Rare")
 * @returns The matching RarityEntry
 */
export function getRarityConfig(rarity: string): RarityEntry {
  return RARITY_CONFIG[rarity] ?? RARITY_CONFIG['Common'];
}
