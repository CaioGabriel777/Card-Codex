import { prisma } from './db';

/** Lists all curated anime decks, newest-added first. */
export async function getAnimeDecks() {
  const decks = await prisma.animeDeck.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { cards: true } } },
  });

  return decks;
}

/** Fetches one anime deck with its full card list. */
export async function getAnimeDeckBySlug(slug: string) {
  return prisma.animeDeck.findUnique({
    where: { slug },
    include: {
      cards: {
        include: { card: true },
        orderBy: { card: { nameEn: 'asc' } },
      },
    },
  });
}
