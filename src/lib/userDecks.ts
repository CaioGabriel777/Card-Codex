import { prisma } from './db';

/** Fetches a user-built deck by slug, with its cards and owner info. Public — the route gates edit UI, not read access. */
export async function getUserDeckBySlug(slug: string) {
  return prisma.userDeck.findUnique({
    where: { slug },
    include: {
      user: { select: { id: true, name: true, image: true } },
      cards: {
        include: { card: true },
        orderBy: { card: { nameEn: 'asc' } },
      },
    },
  });
}
