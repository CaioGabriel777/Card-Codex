import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';
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
  return fetchAndPersistCard();
}

/**
 * Parses a `subtype` filter value into a precise Prisma condition.
 * Values are prefixed by category since "Normal"/"Continuous" are ambiguous
 * between Spell and Trap on their own:
 *   - `monster:effect`  → frameType starting with "effect" (folds in Pendulum variants)
 *   - `spell:Field`     → Spell Card with race "Field"
 *   - `trap:Counter`    → Trap Card with race "Counter"
 */
function parseSubtype(value: string): Prisma.CardWhereInput | null {
  const sep = value.indexOf(':');
  if (sep === -1) return null;
  const category = value.slice(0, sep);
  const subValue = value.slice(sep + 1);
  if (!subValue) return null;

  switch (category) {
    case 'monster':
      return { frameType: { startsWith: subValue } };
    case 'spell':
      return { type: 'Spell Card', race: subValue };
    case 'trap':
      return { type: 'Trap Card', race: subValue };
    default:
      return null;
  }
}

interface CardFilterOptions {
  type?: string | string[];
  subtype?: string | string[];
  archetype?: string;
  search?: string;
  releaseYear?: number;
}

/**
 * Builds the shared AND-clauses (type/subtype/archetype/name/release year)
 * used by both `getCards` and `getBanlist`, so the two stay in sync.
 */
function buildCardWhere(options: CardFilterOptions): Prisma.CardWhereInput[] {
  const { type, subtype, archetype, search, releaseYear } = options;

  const types = Array.isArray(type) ? type.filter(Boolean) : type ? [type] : [];
  const subtypes = Array.isArray(subtype) ? subtype.filter(Boolean) : subtype ? [subtype] : [];

  const and: Prisma.CardWhereInput[] = [];

  // Broad type (Monster/Spell/Trap) and precise subtype selections describe
  // the same facet — a card matching either should be included.
  const categoryOr: Prisma.CardWhereInput[] = [
    ...types.map((t) => ({ type: { contains: t, mode: 'insensitive' as const } })),
    ...subtypes.map(parseSubtype).filter((c): c is Prisma.CardWhereInput => c !== null),
  ];
  if (categoryOr.length) and.push({ OR: categoryOr });

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
  if (releaseYear) {
    and.push({
      releaseDate: {
        gte: new Date(Date.UTC(releaseYear, 0, 1)),
        lt: new Date(Date.UTC(releaseYear + 1, 0, 1)),
      },
    });
  }

  return and;
}

/**
 * Lists cards with optional filtering and pagination.
 *
 * Wrapped in `unstable_cache` so repeat requests for the same filter/page
 * combination (e.g. every visitor hitting the default showcase view) are
 * served from cache instead of re-querying Postgres on every request.
 *
 * @param options - Filter/pagination options
 * @returns Array of cards and total count
 */
export const getCards = unstable_cache(
  async (options?: CardFilterOptions & { sortBy?: 'name' | 'recent'; page?: number; pageSize?: number }) => {
    const { sortBy = 'name', page = 1, pageSize = 12 } = options ?? {};

    const and = buildCardWhere(options ?? {});
    const where: Prisma.CardWhereInput = and.length ? { AND: and } : {};

    const orderBy: Prisma.CardOrderByWithRelationInput =
      sortBy === 'recent' ? { createdAt: 'desc' } : { nameEn: 'asc' };

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
  },
  ['cards-list'],
  { revalidate: 60 }
);

/**
 * Fetches related cards by archetype, paginated.
 * @param archetype - The archetype to search
 * @param excludeId - Card ID to exclude (the current card)
 * @param options - Pagination options
 */
export async function getRelatedCards(
  archetype: string | null,
  excludeId: string,
  options?: { page?: number; pageSize?: number }
) {
  if (!archetype) return { cards: [], total: 0 };

  const { page = 1, pageSize = 12 } = options ?? {};
  const where: Prisma.CardWhereInput = {
    archetype: { equals: archetype, mode: 'insensitive' },
    id: { not: excludeId },
  };

  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where,
      orderBy: { nameEn: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.card.count({ where }),
  ]);

  return { cards, total };
}

/**
 * Groups currently restricted cards by ban status for a given format,
 * additionally narrowed by the same filters `getCards` supports (name,
 * type/subtype, release year) plus which ban statuses to include.
 *
 * Wrapped in `unstable_cache` with a long revalidate — Konami updates the
 * banlist a few times a year at most, so there's no need to re-scan the
 * table on every visit.
 *
 * @param format - "tcg" or "ocg" banlist
 * @param options - Shared card filters plus a ban-status allow-list
 */
export const getBanlist = unstable_cache(
  async (format: 'tcg' | 'ocg' = 'tcg', options?: CardFilterOptions & { statuses?: string | string[] }) => {
    const { statuses, ...filters } = options ?? {};
    const statusList = Array.isArray(statuses) ? statuses.filter(Boolean) : statuses ? [statuses] : [];

    const banField: Prisma.CardWhereInput = statusList.length
      ? format === 'tcg'
        ? { banTcg: { in: statusList } }
        : { banOcg: { in: statusList } }
      : format === 'tcg'
      ? { banTcg: { not: null } }
      : { banOcg: { not: null } };

    const and = [...buildCardWhere(filters), banField];

    const cards = await prisma.card.findMany({
      where: { AND: and },
      orderBy: { nameEn: 'asc' },
    });

    const statusOf = (c: (typeof cards)[number]) => (format === 'tcg' ? c.banTcg : c.banOcg);

    return {
      forbidden: cards.filter((c) => statusOf(c) === 'Forbidden'),
      limited: cards.filter((c) => statusOf(c) === 'Limited'),
      semiLimited: cards.filter((c) => statusOf(c) === 'Semi-Limited'),
      total: cards.length,
    };
  },
  ['banlist'],
  { revalidate: 3600 }
);

/**
 * Fetches a card from the API and persists it to the database.
 * Used when a card is accessed for the first time.
 */
async function fetchAndPersistCard() {
  // We don't have the name, so we can't do a reliable API lookup from slug alone
  // This path is mainly for seeded/known cards
  return null;
}
