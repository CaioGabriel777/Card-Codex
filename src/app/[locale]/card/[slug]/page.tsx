import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCardBySlug, getRelatedCards } from '@/lib/cards';
import CardTilt from '@/components/card/CardTilt';
import CardStatGrid from '@/components/card/CardStatGrid';
import EffectText from '@/components/card/EffectText';
import CardPreview from '@/components/card/CardPreview';

export async function generateMetadata({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { slug } = await params;
  const card = await getCardBySlug(slug);
  if (!card) return {};
  
  return {
    title: card.nameEn,
    description: card.descEn.substring(0, 160) + '...',
  };
}

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('card');
  const card = await getCardBySlug(slug);

  if (!card) {
    notFound();
  }

  // Derived properties based on locale
  const name =
    locale === 'pt-BR' && card.namePt
      ? card.namePt
      : locale === 'ja' && card.nameJa
      ? card.nameJa
      : card.nameEn;

  const relatedCards = await getRelatedCards(card.archetype, card.id, 4);

  return (
    <div className="container-max py-8">
      {/* Breadcrumb */}
      <div className="mb-6 font-mono text-[0.75rem] text-brand-text-dim">
        <Link href="/showcase" className="hover:text-brand-gold transition-colors">
          {t('backToShowcase')}
        </Link>
        <span className="mx-2">/</span>
        <span className="uppercase">{card.type}</span>
        <span className="mx-2">/</span>
        <span className="text-brand-text">{name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10">
        {/* Left Column: Image */}
        <div>
          <div className="bg-brand-surface-3 p-px clip-angle-lg mb-3">
            <div className="bg-brand-surface-2 clip-angle-lg p-4">
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-brand-text leading-tight mb-4">
                {name}
              </h2>

              <CardTilt imageUrl={card.imageUrl} alt={name} className="w-full" />

              <div className="mt-4 pt-3 border-t border-brand-border flex justify-between font-mono text-[0.75rem] text-brand-text-dim">
                {card.atk !== null && <span className="text-brand-gold">ATK {card.atk}</span>}
                {card.def !== null && <span>DEF {card.def}</span>}
              </div>
            </div>
          </div>
          <p className="text-center font-mono text-[0.6rem] text-brand-text-dim/60 uppercase tracking-widest">
            {t('hoverHint')}
          </p>
        </div>

        {/* Right Column: Details */}
        <div className="space-y-6 min-w-0">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl uppercase text-brand-text mb-2 tracking-wide leading-tight">
              {name}
            </h1>
            <p className="font-mono text-xs text-brand-text-dim uppercase tracking-widest">
              {card.race} / {card.attribute || card.type} {card.level ? `· ${t('level')} ${card.level}` : ''}
            </p>
            {card.releaseDate && (
              <p className="font-mono text-[0.65rem] text-brand-text-dim mt-2">
                {t('releaseDate', { date: card.releaseDate.toLocaleDateString(locale) })}
              </p>
            )}
          </div>

          <CardStatGrid card={card} />

          <EffectText descEn={card.descEn} descPt={card.descPt} descJa={card.descJa} />

          {/* Rulings */}
          <div className="pt-8">
            <h3 className="font-display text-brand-gold uppercase tracking-[0.15em] text-sm font-bold border-b border-brand-border pb-2 mb-4">
              {t('rulings')}
            </h3>
            <div className="space-y-4">
              {card.rulings.length > 0 ? (
                card.rulings.map((r: any) => (
                  <div key={r.id} className="flex gap-3 text-[0.85rem]">
                    <span className="font-mono text-brand-gold text-[0.7rem] shrink-0 mt-0.5">
                      {String(r.index).padStart(2, '0')}
                    </span>
                    <p className="text-brand-text-dim leading-relaxed">
                      {locale === 'pt-BR' && r.textPt ? r.textPt : r.textEn}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brand-text-dim italic">{t('noRulings')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Cards */}
      {relatedCards.length > 0 && (
        <div className="mt-12 space-y-4">
          <h3 className="font-display text-brand-gold uppercase tracking-[0.15em] text-sm font-bold border-b border-brand-border pb-2">
            {t('relatedCards')} ·{' '}
            <span className="text-brand-text-dim tracking-normal normal-case">
              {t('archetype', { name: card.archetype ?? '' })}
            </span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedCards.map((rel: any) => (
              <CardPreview key={rel.id} card={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Decks using this card */}
      {card.deckUsages.length > 0 && (
        <div className="mt-12 space-y-4">
          <h3 className="font-display text-brand-gold uppercase tracking-[0.15em] text-sm font-bold border-b border-brand-border pb-2">
            {t('decksUsing')}
          </h3>
          <div className="space-y-2">
            {card.deckUsages.map((deck: any, i: number) => (
              <div key={deck.id} className="flex items-center gap-4 px-4 py-3 bg-brand-inset clip-angle-btn">
                <span className="font-mono text-[0.7rem] text-brand-text-dim w-6 shrink-0">#{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-brand-text min-w-0 truncate">{deck.deckName}</span>
                <span className="font-mono text-[0.7rem] text-brand-text-dim shrink-0">
                  {t('copiesCount', { count: deck.copies })}
                </span>
                <div className="w-40 h-1.5 bg-brand-surface overflow-hidden shrink-0">
                  <div className="h-full bg-brand-gold" style={{ width: `${deck.inclusionPercent}%` }} />
                </div>
                <span className="font-mono text-xs font-bold text-brand-blue w-12 text-right shrink-0">
                  {deck.inclusionPercent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
