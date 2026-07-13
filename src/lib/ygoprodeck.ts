/**
 * YGOPRODeck API integration layer.
 * This is the SYNC origin — never called directly by visitor requests.
 * The public API docs: https://ygoprodeck.com/api-guide/
 */

const BASE_URL = 'https://db.ygoprodeck.com/api/v7';

/** Shape of a single card returned by the YGOPRODeck API */
export interface YGOCard {
  id: number;
  name: string;
  type: string;
  frameType: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  archetype?: string;
  card_sets?: Array<{
    set_name: string;
    set_code: string;
    set_rarity: string;
    set_rarity_code: string;
    set_price: string;
  }>;
  banlist_info?: {
    ban_tcg?: string;
    ban_ocg?: string;
    ban_goat?: string;
  };
  card_images: Array<{
    id: number;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }>;
}

interface YGOResponse {
  data: YGOCard[];
}

/**
 * Fetches a single card from the YGOPRODeck API by name.
 * @param name - Exact English card name
 * @returns The card data or null if not found
 */
export async function fetchCardByName(name: string): Promise<YGOCard | null> {
  try {
    const url = `${BASE_URL}/cardinfo.php?name=${encodeURIComponent(name)}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const json: YGOResponse = await res.json();
    return json.data?.[0] ?? null;
  } catch {
    console.error(`[ygoprodeck] Failed to fetch card: ${name}`);
    return null;
  }
}

/**
 * Fetches a single card from the YGOPRODeck API by its numeric ID.
 * @param id - The YGOPRODeck card ID
 * @returns The card data or null if not found
 */
export async function fetchCardById(id: number): Promise<YGOCard | null> {
  try {
    const url = `${BASE_URL}/cardinfo.php?id=${id}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const json: YGOResponse = await res.json();
    return json.data?.[0] ?? null;
  } catch {
    console.error(`[ygoprodeck] Failed to fetch card ID: ${id}`);
    return null;
  }
}

/**
 * Fetches multiple cards matching a fuzzy name search.
 * @param query - Partial card name
 * @param num - Max results (default 10)
 * @returns Array of matching cards
 */
export async function searchCards(query: string, num = 10): Promise<YGOCard[]> {
  try {
    const url = `${BASE_URL}/cardinfo.php?fname=${encodeURIComponent(query)}&num=${num}&offset=0`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json: YGOResponse = await res.json();
    return json.data ?? [];
  } catch {
    console.error(`[ygoprodeck] Search failed: ${query}`);
    return [];
  }
}

/**
 * Resolves the highest rarity from a card's set list.
 * @param card - The API card object
 * @returns Best rarity string (e.g. "Ultra Rare")
 */
export function resolveRarity(card: YGOCard): string {
  const rarityOrder = [
    'Starlight Rare',
    'Ghost Rare',
    'Ultimate Rare',
    'Secret Rare',
    'Ultra Rare',
    'Super Rare',
    'Rare',
    'Common',
  ];

  if (!card.card_sets?.length) return 'Common';

  for (const rarity of rarityOrder) {
    if (card.card_sets.some((s) => s.set_rarity === rarity)) {
      return rarity;
    }
  }

  return card.card_sets[0].set_rarity || 'Common';
}
