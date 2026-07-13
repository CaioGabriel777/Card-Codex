import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link, getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getAnimeDeckBySlug } from '@/lib/animeDecks';
import CardPreview from '@/components/card/CardPreview';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const deck = await getAnimeDeckBySlug(slug);
  if (!deck) return {};

  const title = (locale === 'pt-BR' && deck.titlePt) || (locale === 'ja' && deck.titleJa) || deck.titleEn;
  const description =
    (locale === 'pt-BR' && deck.descriptionPt) || (locale === 'ja' && deck.descriptionJa) || deck.descriptionEn;
  const href = { pathname: '/decks/[slug]' as const, params: { slug } };
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ href, locale: l })])
  );

  return {
    title,
    description: description.length > 160 ? description.slice(0, 157) + '...' : description,
    alternates: {
      canonical: getPathname({ href, locale }),
      languages,
    },
  };
}

export default async function AnimeDeckPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('decks');
  const deck = await getAnimeDeckBySlug(slug);

  if (!deck) {
    notFound();
  }

  const title = (locale === 'pt-BR' && deck.titlePt) || (locale === 'ja' && deck.titleJa) || deck.titleEn;
  const description =
    (locale === 'pt-BR' && deck.descriptionPt) || (locale === 'ja' && deck.descriptionJa) || deck.descriptionEn;

  const mainCards = deck.cards.filter((c) => c.category === 'Main').map((c) => c.card);
  const extraCards = deck.cards.filter((c) => c.category === 'Extra').map((c) => c.card);

  return (
    <div className="container-max py-8">
      {/* Breadcrumb */}
      <div className="mb-6 font-mono text-[0.75rem] text-brand-text-dim">
        <Link href="/decks" className="hover:text-brand-gold transition-colors">
          {t('backToDecks')}
        </Link>
      </div>

      <div className="mb-10 border-b border-brand-border pb-6">
        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-brand-gold">
          {deck.season}
        </span>
        <h1 className="font-display font-bold text-3xl md:text-4xl uppercase text-brand-text mt-1 mb-3 tracking-wide leading-tight">
          {title}
        </h1>
        <p className="font-mono text-xs text-brand-text-dim uppercase tracking-widest mb-4">
          {deck.series}
        </p>
        <p className="font-body text-brand-text-dim leading-relaxed max-w-3xl">{description}</p>
      </div>

      <section className="mb-12">
        <h2 className="font-display text-brand-gold uppercase tracking-[0.15em] text-sm font-bold border-b border-brand-border pb-2 mb-6">
          {t('mainDeck')}{' '}
          <span className="text-brand-text-dim font-mono normal-case tracking-normal">
            ({mainCards.length})
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {mainCards.map((card) => (
            <CardPreview key={card.id} card={card} />
          ))}
        </div>
      </section>

      {extraCards.length > 0 && (
        <section>
          <h2 className="font-display text-brand-gold uppercase tracking-[0.15em] text-sm font-bold border-b border-brand-border pb-2 mb-6">
            {t('extraDeck')}{' '}
            <span className="text-brand-text-dim font-mono normal-case tracking-normal">
              ({extraCards.length})
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {extraCards.map((card) => (
              <CardPreview key={card.id} card={card} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
