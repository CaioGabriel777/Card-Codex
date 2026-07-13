'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Card } from '@prisma/client';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { updateCardCopies, removeCardFromDeck } from '@/lib/actions/decks';

interface DeckCardTileProps {
  card: Card;
  copies: number;
  deckId: string;
  isOwner: boolean;
  maxCopies: number;
}

/** A card within a user deck — image/name link to the card page, plus a copies stepper for the owner. */
export default function DeckCardTile({ card, copies, deckId, isOwner, maxCopies }: DeckCardTileProps) {
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const [localCopies, setLocalCopies] = useState(copies);

  const name =
    (locale === 'pt-BR' && card.namePt) || (locale === 'ja' && card.nameJa) || card.nameEn;

  const changeCopies = async (delta: number) => {
    const next = localCopies + delta;
    if (next < 0 || next > maxCopies || pending) return;
    setPending(true);
    setLocalCopies(next);
    if (next === 0) {
      await removeCardFromDeck(deckId, card.id);
    } else {
      await updateCardCopies(deckId, card.id, next);
    }
    setPending(false);
  };

  if (localCopies === 0) return null;

  return (
    <div className="bg-brand-surface-3 p-px clip-angle h-full">
      <div className="bg-brand-surface-2 clip-angle h-full flex flex-col p-3 relative overflow-hidden">
        <Link href={{ pathname: '/card/[slug]', params: { slug: card.slug } }} className="block group">
          <div className="w-full aspect-[0.686] relative mb-3 rounded-sm overflow-hidden bg-brand-bg">
            <Image
              src={card.imageSmallUrl || card.imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              className="object-cover"
            />
          </div>
          <h3 className="font-display font-bold text-[0.85rem] leading-tight text-brand-text group-hover:text-brand-gold transition-colors line-clamp-2 mb-2">
            {name}
          </h3>
        </Link>

        <div className="mt-auto pt-2 border-t border-brand-border-subtle">
          {isOwner ? (
            <div className="flex items-center gap-2 font-mono text-[0.75rem] text-brand-text-dim">
              <button
                type="button"
                onClick={() => changeCopies(-1)}
                disabled={pending}
                className="w-5 h-5 flex items-center justify-center border border-brand-border hover:border-brand-gold hover:text-brand-gold disabled:opacity-40 cursor-pointer"
              >
                −
              </button>
              <span className="text-brand-text">×{localCopies}</span>
              <button
                type="button"
                onClick={() => changeCopies(1)}
                disabled={pending || localCopies >= maxCopies}
                className="w-5 h-5 flex items-center justify-center border border-brand-border hover:border-brand-gold hover:text-brand-gold disabled:opacity-40 cursor-pointer"
              >
                +
              </button>
            </div>
          ) : (
            <span className="font-mono text-[0.75rem] text-brand-text-dim">×{localCopies}</span>
          )}
        </div>
      </div>
    </div>
  );
}
