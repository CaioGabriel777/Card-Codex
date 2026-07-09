import { prisma } from './db';

/**
 * Retrieves a card by its URL slug, with its rulings and deck usage.
 *
 * @param slug - The URL slug for the card
 * @returns The card with its relations, or null
 */
export async function getCardBySlug(slug: string) {
  const card = await prisma.card.findUnique({
    where: { slug },
    include: {
      rulings: { orderBy: { index: 'asc' } },
      deckUsages: { orderBy: { inclusionPercent: 'desc' } },
    },
  });

  if (card) return card;

  // Card never seen — attempt live fetch
  return fetchAndPersistCard(slug);
}

/**
 * Lists cards with optional filtering and pagination.
 *
 * @param options - Filter/pagination options
 * @returns Array of cards and total count
 */
export async function getCards(options?: {
  type?: string | string[];
  rarity?: string | string[];
  archetype?: string;
  search?: string;
  sortBy?: 'name' | 'recent';
  page?: number;
  pageSize?: number;
}) {
  const {
    type,
    rarity,
    archetype,
    search,
    sortBy = 'name',
    page = 1,
    pageSize = 12,
  } = options ?? {};

  const types = Array.isArray(type) ? type.filter(Boolean) : type ? [type] : [];
  const rarities = Array.isArray(rarity) ? rarity.filter(Boolean) : rarity ? [rarity] : [];

  // Each filter group is an OR of its own options; groups combine with AND.
  const and: any[] = [];

  if (types.length) {
    and.push({ OR: types.map((t) => ({ type: { contains: t, mode: 'insensitive' } })) });
  }
  if (rarities.length) {
    and.push({ rarity: { in: rarities } });
  }
  if (archetype) and.push({ archetype: { equals: archetype, mode: 'insensitive' } });
  if (search) {
    and.push({
      OR: [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { namePt: { contains: search, mode: 'insensitive' } },
        { nameJa: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  const where: any = and.length ? { AND: and } : {};

  const orderBy: any = sortBy === 'recent' ? { createdAt: 'desc' } : { nameEn: 'asc' };

  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.card.count({ where }),
  ]);

  return { cards, total, page, pageSize };
}

/**
 * Fetches related cards by archetype.
 * @param archetype - The archetype to search
 * @param excludeId - Card ID to exclude (the current card)
 * @param limit - Max results
 */
export async function getRelatedCards(
  archetype: string | null,
  excludeId: string,
  limit = 6
) {
  if (!archetype) return [];

  return prisma.card.findMany({
    where: {
      archetype: { equals: archetype, mode: 'insensitive' },
      id: { not: excludeId },
    },
    take: limit,
    orderBy: { nameEn: 'asc' },
  });
}

/**
 * Fetches a card from the API and persists it to the database.
 * Used when a card is accessed for the first time.
 */
async function fetchAndPersistCard(slug: string) {
  // We don't have the name, so we can't do a reliable API lookup from slug alone
  // This path is mainly for seeded/known cards
  return null;
}
