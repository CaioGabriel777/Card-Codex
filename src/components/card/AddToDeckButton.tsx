'use client';

import { useEffect, useRef, useState } from 'react';
import type { Card, DeckFormat } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useDeckStore } from '@/lib/store/deckStore';
import { maxCopiesFor } from '@/lib/deckRules';

interface AddToDeckButtonProps {
  card: Card;
}

/**
 * Hover-revealed "Add to Deck" control shown on every CardPreview when
 * signed in. Zero decks → inline create-first-deck form. One deck → adds
 * directly. Multiple → dropdown to pick one, with format-illegal picks
 * grayed out (server re-validates regardless — this is a UX pre-check only).
 */
export default function AddToDeckButton({ card }: AddToDeckButtonProps) {
  const { status } = useSession();
  const t = useTranslations('addToDeck');
  const tFormat = useTranslations('deckFormat');
  const containerRef = useRef<HTMLDivElement>(null);

  const { decks, fetchDecks, addCard, createAndSelect } = useDeckStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckFormat, setNewDeckFormat] = useState<DeckFormat>('FREE');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (status !== 'authenticated') return null;

  const errorMessage = (error?: string) => {
    switch (error) {
      case 'forbidden':
        return t('errorForbidden');
      case 'max-copies':
        return t('errorMaxCopies');
      case 'extra-deck-full':
        return t('errorExtraDeckFull');
      default:
        return t('errorGeneric');
    }
  };

  const showFeedbackAndClose = (message: string) => {
    setFeedback(message);
    setTimeout(() => {
      setFeedback(null);
      setIsOpen(false);
      setShowCreateForm(false);
    }, 1200);
  };

  const handleAdd = async (deckId: string) => {
    setBusy(true);
    const result = await addCard(deckId, card.id);
    setBusy(false);
    showFeedbackAndClose(result.ok ? t('added') : errorMessage(result.error));
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim() || busy) return;
    setBusy(true);
    const created = await createAndSelect(newDeckName.trim(), newDeckFormat);
    if (created.ok && created.slug) {
      const deck = useDeckStore.getState().decks?.find((d) => d.slug === created.slug);
      if (deck) await addCard(deck.id, card.id);
    }
    setBusy(false);
    setNewDeckName('');
    showFeedbackAndClose(created.ok ? t('added') : errorMessage(created.error));
  };

  const toggleOpen = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    let current = decks;
    if (current === null) {
      await fetchDecks();
      current = useDeckStore.getState().decks;
    }

    if (current && current.length === 1) {
      await handleAdd(current[0].id);
    }
  };

  // For the single-deck fast path the dropdown panel never opens, so the
  // transient result needs a home of its own.
  const inlineFeedback = decks?.length === 1 && feedback;

  return (
    <div
      ref={containerRef}
      className="absolute top-2 right-2 z-10"
      onClick={(e) => {
        // This whole control sits inside CardPreview's outer <Link> — without
        // this, any click here (dropdown items, the create-deck inputs, even
        // just focusing the name field) would bubble to the anchor and
        // navigate to the card page instead of interacting with the menu.
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        onClick={toggleOpen}
        title={t('button')}
        aria-label={t('button')}
        className="w-7 h-7 flex items-center justify-center bg-brand-bg/80 border border-brand-border text-brand-gold opacity-0 group-hover:opacity-100 hover:border-brand-gold hover:bg-brand-bg transition-all clip-angle-sm"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {inlineFeedback && (
        <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-brand-surface-2 border border-brand-border clip-angle-sm text-[0.7rem] text-brand-text whitespace-nowrap">
          {inlineFeedback}
        </div>
      )}

      {isOpen && decks !== null && decks.length !== 1 && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-brand-surface-2 border border-brand-border clip-angle-sm shadow-2xl z-50 overflow-hidden font-body text-left">
          {decks.length === 0 || showCreateForm ? (
            <form onSubmit={handleCreateAndAdd} className="p-3 space-y-2">
              <p className="text-[0.7rem] uppercase tracking-wider text-brand-text-dim">{t('createPrompt')}</p>
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder={t('namePlaceholder')}
                autoFocus
                className="w-full px-2 py-1.5 bg-brand-inset text-brand-text text-[0.8rem] border border-brand-border focus:outline-none focus:border-brand-gold"
              />
              <select
                value={newDeckFormat}
                onChange={(e) => setNewDeckFormat(e.target.value as DeckFormat)}
                className="w-full px-2 py-1.5 bg-brand-inset text-brand-text text-[0.8rem] border border-brand-border focus:outline-none focus:border-brand-gold cursor-pointer"
              >
                <option value="FREE">{tFormat('free')}</option>
                <option value="TCG">{tFormat('tcg')}</option>
                <option value="OCG">{tFormat('ocg')}</option>
              </select>
              <button
                type="submit"
                disabled={busy || !newDeckName.trim()}
                className="w-full px-2 py-1.5 bg-brand-gold text-brand-bg text-[0.8rem] font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {feedback ?? t('create')}
              </button>
            </form>
          ) : (
            <div>
              <p className="px-3 pt-3 pb-1 text-[0.7rem] uppercase tracking-wider text-brand-text-dim">
                {t('chooseDeck')}
              </p>
              {decks.map((deck) => {
                const disabled = maxCopiesFor(card, deck.format) === 0;
                return (
                  <button
                    key={deck.id}
                    type="button"
                    disabled={disabled || busy}
                    title={disabled ? errorMessage('forbidden') : undefined}
                    onClick={() => handleAdd(deck.id)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-[0.8rem] text-brand-text hover:bg-brand-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="truncate">{deck.name}</span>
                    <span className="shrink-0 text-[0.65rem] font-mono text-brand-text-dim">
                      {feedback ?? tFormat(deck.format.toLowerCase() as 'free' | 'tcg' | 'ocg')}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="w-full px-3 py-2 text-left text-[0.75rem] text-brand-gold hover:bg-brand-surface-3 transition-colors border-t border-brand-border cursor-pointer"
              >
                {t('newDeck')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
