import type { Card, DeckFormat } from '@prisma/client';

export const EXTRA_DECK_LIMIT = 15;

const EXTRA_DECK_FRAME_TYPES = new Set([
  'fusion',
  'synchro',
  'xyz',
  'link',
  'fusion_pendulum',
  'synchro_pendulum',
  'xyz_pendulum',
]);

/** Fusion/Synchro/XYZ/Link (including their Pendulum variants) belong in the Extra Deck. */
export function isExtraDeckCard(card: Pick<Card, 'frameType'>): boolean {
  return EXTRA_DECK_FRAME_TYPES.has(card.frameType ?? '');
}

/**
 * Max legal copies of a card in a deck of the given format.
 * FREE decks only enforce the standard 3-copy rule; TCG/OCG decks additionally
 * cap based on the card's own banTcg/banOcg status.
 */
export function maxCopiesFor(card: Pick<Card, 'banTcg' | 'banOcg'>, format: DeckFormat): number {
  if (format === 'FREE') return 3;

  const status = format === 'TCG' ? card.banTcg : card.banOcg;
  if (status === 'Forbidden') return 0;
  if (status === 'Limited') return 1;
  if (status === 'Semi-Limited') return 2;
  return 3;
}
