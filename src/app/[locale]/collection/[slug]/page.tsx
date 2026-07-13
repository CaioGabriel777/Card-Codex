import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link, getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { getUserDeckBySlug } from '@/lib/userDecks';
import { maxCopiesFor } from '@/lib/deckRules';
import DeckCardTile from '@/components/collection/DeckCardTile';
import DeckHeaderControls from '@/components/collection/DeckHeaderControls';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const deck = await getUserDeckBySlug(slug);
  if (!deck) return {};

  const href = { pathname: '/collection/[slug]' as const, params: { slug } };
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ href, locale: l })])
  );

  return {
    title: deck.name,
    alternates: {
      canonical: getPathname({ href, locale }),
      languages,
    },
  };
}

export default async function UserDeckPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations('collection');
  const tFormat = await getTranslations('deckFormat');
  const tDecksNs = await getTranslations('decks');
  const session = await auth();
  const deck = await getUserDeckBySlug(slug);

  if (!deck) {
    notFound();
  }

  const isOwner = session?.user?.id === deck.userId;
  const mainCards = deck.cards.filter((c) => c.category === 'Main');
  const extraCards = deck.cards.filter((c) => c.category === 'Extra');

  return (
    <div className="container-max py-8">
      <div className="mb-6 font-mono text-[0.75rem] text-brand-text-dim">
        <Link href="/collection" className="hover:text-brand-gold transition-colors">
          {t('backToCollection')}
        </Link>
      </div>

      <div className="mb-10 border-b border-brand-border pb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="font-mono text-[0.7rem] uppercase tracking-widest text-brand-gold">
            {tFormat(deck.format.toLowerCase() as 'free' | 'tcg' | 'ocg')}
          </span>
          <h1 className="font-display font-bold text-3xl md:text-4xl uppercase text-brand-text mt-1 mb-2 tracking-wide leading-tight">
            {deck.name}
          </h1>
          {!isOwner && (
            <p className="font-mono text-xs text-brand-text-dim uppercase tracking-widest">
              {t('ownerLabel', { name: deck.user.name ?? '' })}
            </p>
          )}
        </div>

        {isOwner && <DeckHeaderControls deckId={deck.id} currentName={deck.name} />}
      </div>

      <section className="mb-12">
        <h2 className="font-display text-brand-gold uppercase tracking-[0.15em] text-sm font-bold border-b border-brand-border pb-2 mb-6">
          {tDecksNs('mainDeck')}{' '}
          <span className="text-brand-text-dim font-mono normal-case tracking-normal">
            ({mainCards.reduce((sum, c) => sum + c.copies, 0)})
          </span>
        </h2>
        {mainCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {mainCards.map((entry) => (
              <DeckCardTile
                key={entry.id}
                card={entry.card}
                copies={entry.copies}
                deckId={deck.id}
                isOwner={isOwner}
                maxCopies={maxCopiesFor(entry.card, deck.format)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-brand-text-dim italic">{t('emptyDeck')}</p>
        )}
      </section>

      {(extraCards.length > 0 || isOwner) && (
        <section>
          <h2 className="font-display text-brand-gold uppercase tracking-[0.15em] text-sm font-bold border-b border-brand-border pb-2 mb-6">
            {tDecksNs('extraDeck')}{' '}
            <span className="text-brand-text-dim font-mono normal-case tracking-normal">
              ({extraCards.reduce((sum, c) => sum + c.copies, 0)})
            </span>
          </h2>
          {extraCards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {extraCards.map((entry) => (
                <DeckCardTile
                  key={entry.id}
                  card={entry.card}
                  copies={entry.copies}
                  deckId={deck.id}
                  isOwner={isOwner}
                  maxCopies={maxCopiesFor(entry.card, deck.format)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-text-dim italic">{t('emptyDeck')}</p>
          )}
        </section>
      )}
    </div>
  );
}
