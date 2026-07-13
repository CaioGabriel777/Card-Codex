import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link, getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getBanlist } from '@/lib/cards';
import { buildTypeGroups } from '@/lib/typeGroups';
import CardPreview from '@/components/card/CardPreview';
import CatalogFilters from '@/components/shared/CatalogFilters';
import SectionNav from '@/components/shared/SectionNav';

// Matches the getBanlist() unstable_cache revalidate — Konami updates the
// banlist a handful of times a year, not something that needs per-request freshness.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'banlist' });
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ href: '/banlist', locale: l })])
  );

  return {
    title: t('title'),
    alternates: {
      canonical: getPathname({ href: '/banlist', locale }),
      languages,
    },
  };
}

export default async function BanlistPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const search = await searchParams;
  const t = await getTranslations('banlist');
  const tFilters = await getTranslations('filters');
  const tNav = await getTranslations('nav');

  const format = search.format === 'ocg' ? 'ocg' : 'tcg';
  const types = typeof search.type === 'string' ? search.type.split(',').filter(Boolean) : [];
  const subtypes = typeof search.subtype === 'string' ? search.subtype.split(',').filter(Boolean) : [];
  const statuses = typeof search.status === 'string' ? search.status.split(',').filter(Boolean) : [];
  const query = typeof search.q === 'string' ? search.q : undefined;
  const releaseYear = Number(search.year) || undefined;

  const { forbidden, limited, semiLimited, total } = await getBanlist(format, {
    type: types,
    subtype: subtypes,
    search: query,
    releaseYear,
    statuses,
  });

  // Other filters (everything but `format`), reused by the format toggle
  // links below so switching TCG/OCG doesn't reset the active filters.
  const otherFilters: Record<string, string> = {};
  if (types.length) otherFilters.type = types.join(',');
  if (subtypes.length) otherFilters.subtype = subtypes.join(',');
  if (statuses.length) otherFilters.status = statuses.join(',');
  if (query) otherFilters.q = query;
  if (releaseYear) otherFilters.year = String(releaseYear);

  const typeGroups = buildTypeGroups(tFilters);

  // Cards have been released since 1999; include next year to cover
  // pre-announced upcoming sets with a future releaseDate.
  const FIRST_RELEASE_YEAR = 1999;
  const lastYear = new Date().getFullYear() + 1;
  const yearOptions = Array.from(
    { length: lastYear - FIRST_RELEASE_YEAR + 1 },
    (_, i) => lastYear - i
  );

  const statusOptions = [
    { value: 'Forbidden', label: t('forbidden') },
    { value: 'Limited', label: t('limited') },
    { value: 'Semi-Limited', label: t('semiLimited') },
  ];

  const navLinks = [
    { href: '/showcase' as const, label: tNav('showcase'), active: false },
    { href: '/collection' as const, label: tNav('collection'), active: false },
    { href: '/banlist' as const, label: tNav('banlist'), active: true },
    { href: '/decks' as const, label: tNav('decks'), active: false },
  ];

  const sections = [
    { status: 'Forbidden', label: t('forbidden'), cards: forbidden, accent: 'border-brand-red text-brand-red' },
    { status: 'Limited', label: t('limited'), cards: limited, accent: 'border-brand-gold text-brand-gold' },
    { status: 'Semi-Limited', label: t('semiLimited'), cards: semiLimited, accent: 'border-brand-blue text-brand-blue' },
  ].filter((s) => statuses.length === 0 || statuses.includes(s.status));

  return (
    <div className="container-max py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
      {/* Left Sidebar: Navigation + Filters */}
      <aside className="hidden lg:block space-y-8">
        <SectionNav links={navLinks} />

        <CatalogFilters
          filtersTitle={tFilters('title')}
          typeLabel={tFilters('type')}
          typeGroups={typeGroups}
          searchLabel={tFilters('search')}
          searchPlaceholder={tFilters('searchPlaceholder')}
          yearLabel={tFilters('year')}
          yearAnyLabel={tFilters('yearAny')}
          yearOptions={yearOptions}
          statusLabel={tFilters('status')}
          statusOptions={statusOptions}
        />
      </aside>

      {/* Main Content */}
      <main className="min-w-0">
        <div className="flex items-end justify-between mb-10 border-b border-brand-border pb-4 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-[0.1em] text-brand-text">
              {t('title')}
            </h1>
            <p className="font-mono text-xs text-brand-text-dim mt-1">
              {t('totalCount', { count: total })}
            </p>
          </div>

          <div className="flex gap-2 font-mono text-[0.8rem]">
            <Link
              href={{ pathname: '/banlist', query: otherFilters }}
              className={`px-4 py-1.5 border clip-angle-sm transition-colors ${
                format === 'tcg'
                  ? 'border-brand-gold text-brand-gold'
                  : 'border-brand-border text-brand-text-dim hover:text-brand-text hover:border-brand-text-dim'
              }`}
            >
              {t('formatTcg')}
            </Link>
            <Link
              href={{ pathname: '/banlist', query: { ...otherFilters, format: 'ocg' } }}
              className={`px-4 py-1.5 border clip-angle-sm transition-colors ${
                format === 'ocg'
                  ? 'border-brand-gold text-brand-gold'
                  : 'border-brand-border text-brand-text-dim hover:text-brand-text hover:border-brand-text-dim'
              }`}
            >
              {t('formatOcg')}
            </Link>
          </div>
        </div>

        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.status}>
              <h2 className={`font-display uppercase tracking-[0.15em] text-sm font-bold border-b pb-2 mb-6 ${section.accent}`}>
                {section.label}{' '}
                <span className="text-brand-text-dim font-mono normal-case tracking-normal">
                  ({section.cards.length})
                </span>
              </h2>
              {section.cards.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {section.cards.map((card) => (
                    <CardPreview key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-brand-text-dim italic">{t('emptySection')}</p>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
