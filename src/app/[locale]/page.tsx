import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCards } from '@/lib/cards';
import CardPreview from '@/components/card/CardPreview';
import CardSearchInput from '@/components/search/CardSearchInput';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const t = await getTranslations('home');
  const tNav = await getTranslations('nav');

  const { cards: featuredCards, total } = await getCards({ sortBy: 'recent', pageSize: 4 });

  const exploreLinks = [
    { href: '/showcase' as const, label: tNav('showcase'), desc: t('linkShowcaseDesc') },
    { href: '/collection' as const, label: tNav('collection'), desc: t('linkCollectionDesc') },
    { href: '/banlist' as const, label: tNav('banlist'), desc: t('linkBanlistDesc') },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <div className="min-h-[calc(80vh-var(--header-height))] flex flex-col relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-gold opacity-5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container-max flex-1 flex flex-col items-center justify-center text-center py-20 relative z-10">
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-brand-text mb-6 max-w-4xl tracking-wide uppercase leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="font-body text-lg md:text-xl text-brand-text-dim max-w-2xl mb-6">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-brand-text-dim mb-12">
            <span className="text-brand-gold">{t('statsCount', { count: total.toLocaleString() })}</span>
            <span className="opacity-40">·</span>
            <span>{t('statsLocales')}</span>
            <span className="opacity-40">·</span>
            <span>{t('statsLive')}</span>
          </div>

          <div className="w-full max-w-xl mb-10">
            <CardSearchInput placeholder={t('searchPlaceholder')} variant="hero" />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/showcase" className="btn-gold text-[1rem] px-8 py-3">
              {t('ctaShowcase')}
            </Link>
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 px-8 py-3 bg-transparent text-brand-text border-[1.5px] border-brand-border font-display text-[0.85rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200 clip-angle-btn hover:border-brand-gold hover:text-brand-gold"
            >
              {t('ctaDetail')}
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Cards */}
      {featuredCards.length > 0 && (
        <section className="container-max py-16 border-t border-brand-border">
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <h2 className="font-display text-2xl font-bold uppercase tracking-[0.1em] text-brand-text">
              {t('featuredTitle')}
            </h2>
            <Link
              href="/showcase"
              className="font-mono text-[0.8rem] text-brand-gold hover:text-brand-blue transition-colors no-underline"
            >
              {t('featuredViewAll')}
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCards.map((card: any) => (
              <CardPreview key={card.id} card={card} />
            ))}
          </div>
        </section>
      )}

      {/* Explore tiles */}
      <section className="container-max py-16 border-t border-brand-border">
        <h2 className="font-display text-2xl font-bold uppercase tracking-[0.1em] text-brand-text mb-8">
          {t('linksTitle')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {exploreLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block group h-full">
              <div className="bg-brand-surface-3 p-px clip-angle h-full transition-colors duration-300 group-hover:bg-brand-gold">
                <div className="bg-brand-surface-2 clip-angle h-full p-6 transition-transform duration-300 group-hover:-translate-y-1">
                  <h3 className="font-display font-bold text-lg text-brand-text group-hover:text-brand-gold transition-colors mb-2 uppercase tracking-wide">
                    {link.label}
                  </h3>
                  <p className="text-[0.85rem] text-brand-text-dim leading-snug">
                    {link.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
