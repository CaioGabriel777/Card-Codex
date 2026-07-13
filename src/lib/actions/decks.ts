'use server';

import { revalidatePath } from 'next/cache';
import type { DeckFormat } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/slugify';
import { isExtraDeckCard, maxCopiesFor, EXTRA_DECK_LIMIT } from '@/lib/deckRules';

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Current user's decks with Main/Extra card counts. Empty array if signed out. */
export async function getMyDecks() {
  const userId = await requireUserId();
  if (!userId) return [];

  const decks = await prisma.userDeck.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { cards: { select: { category: true, copies: true } } },
  });

  return decks.map((deck) => ({
    id: deck.id,
    slug: deck.slug,
    name: deck.name,
    format: deck.format,
    mainCount: deck.cards.filter((c) => c.category === 'Main').reduce((sum, c) => sum + c.copies, 0),
    extraCount: deck.cards.filter((c) => c.category === 'Extra').reduce((sum, c) => sum + c.copies, 0),
  }));
}

export async function createDeck(name: string, format: DeckFormat): Promise<ActionResult<{ slug: string }>> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'not-authenticated' };

  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: 'name-required' };

  const base = slugify(trimmed) || 'deck';
  let slug = base;
  for (let attempt = 0; await prisma.userDeck.findUnique({ where: { slug } }); attempt++) {
    if (attempt >= 5) return { ok: false, error: 'slug-collision' };
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const deck = await prisma.userDeck.create({ data: { userId, name: trimmed, format, slug } });

  revalidatePath('/[locale]/collection', 'page');
  return { ok: true, data: { slug: deck.slug } };
}

export async function renameDeck(deckId: string, name: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'not-authenticated' };

  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: 'name-required' };

  const deck = await prisma.userDeck.findUnique({ where: { id: deckId } });
  if (!deck || deck.userId !== userId) return { ok: false, error: 'not-found' };

  await prisma.userDeck.update({ where: { id: deckId }, data: { name: trimmed } });
  revalidatePath('/[locale]/collection/[slug]', 'page');
  return { ok: true, data: undefined };
}

export async function deleteDeck(deckId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'not-authenticated' };

  const deck = await prisma.userDeck.findUnique({ where: { id: deckId } });
  if (!deck || deck.userId !== userId) return { ok: false, error: 'not-found' };

  await prisma.userDeck.delete({ where: { id: deckId } });
  revalidatePath('/[locale]/collection', 'page');
  return { ok: true, data: undefined };
}

/**
 * Adds one copy of a card to a deck, auto-assigning Main/Extra and capping
 * copies per the deck's format (FREE/TCG/OCG) — see lib/deckRules.ts. This
 * is the authoritative legality check; any client-side pre-check is UX only.
 */
export async function addCardToDeck(deckId: string, cardId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'not-authenticated' };

  const deck = await prisma.userDeck.findUnique({ where: { id: deckId } });
  if (!deck || deck.userId !== userId) return { ok: false, error: 'not-found' };

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) return { ok: false, error: 'card-not-found' };

  const max = maxCopiesFor(card, deck.format);
  if (max === 0) return { ok: false, error: 'forbidden' };

  const category = isExtraDeckCard(card) ? 'Extra' : 'Main';
  const existing = await prisma.userDeckCard.findUnique({
    where: { deckId_cardId: { deckId, cardId } },
  });

  if (existing) {
    if (existing.copies >= max) return { ok: false, error: 'max-copies' };
    await prisma.userDeckCard.update({ where: { id: existing.id }, data: { copies: existing.copies + 1 } });
  } else {
    if (category === 'Extra') {
      const extraTotal = await prisma.userDeckCard.aggregate({
        where: { deckId, category: 'Extra' },
        _sum: { copies: true },
      });
      if ((extraTotal._sum.copies ?? 0) >= EXTRA_DECK_LIMIT) {
        return { ok: false, error: 'extra-deck-full' };
      }
    }
    await prisma.userDeckCard.create({ data: { deckId, cardId, category, copies: 1 } });
  }

  await prisma.userDeck.update({ where: { id: deckId }, data: { updatedAt: new Date() } });
  revalidatePath('/[locale]/collection/[slug]', 'page');
  return { ok: true, data: undefined };
}

export async function updateCardCopies(deckId: string, cardId: string, copies: number): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'not-authenticated' };

  const deck = await prisma.userDeck.findUnique({ where: { id: deckId } });
  if (!deck || deck.userId !== userId) return { ok: false, error: 'not-found' };

  if (copies <= 0) {
    await prisma.userDeckCard.deleteMany({ where: { deckId, cardId } });
    revalidatePath('/[locale]/collection/[slug]', 'page');
    return { ok: true, data: undefined };
  }

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) return { ok: false, error: 'card-not-found' };

  const max = maxCopiesFor(card, deck.format);
  if (copies > max) return { ok: false, error: 'max-copies' };

  await prisma.userDeckCard.update({ where: { deckId_cardId: { deckId, cardId } }, data: { copies } });
  revalidatePath('/[locale]/collection/[slug]', 'page');
  return { ok: true, data: undefined };
}

export async function removeCardFromDeck(deckId: string, cardId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'not-authenticated' };

  const deck = await prisma.userDeck.findUnique({ where: { id: deckId } });
  if (!deck || deck.userId !== userId) return { ok: false, error: 'not-found' };

  await prisma.userDeckCard.deleteMany({ where: { deckId, cardId } });
  revalidatePath('/[locale]/collection/[slug]', 'page');
  return { ok: true, data: undefined };
}
