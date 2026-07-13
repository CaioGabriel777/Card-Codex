import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link, getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getCards, getBanlist } from '@/lib/cards';
import { buildTypeGroups } from '@/lib/typeGroups';
import CardPreview from '@/components/card/CardPreview';
import CatalogFilters from '@/components/shared/CatalogFilters';
import Pagination from '@/components/shared/Pagination';
import SectionNav from '@/components/shared/SectionNav';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'showcase' });
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ href: '/showcase', locale: l })])
  );

  return {
    title: t('title'),
    // Canonical ignores filter/pagination query params — those are variants
    // of the same listing, not distinct pages worth indexing separately.
    alternates: {
      canonical: getPathname({ href: '/showcase', locale }),
      languages,
    },
  };
}

export default async function ShowcasePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations('showcase');
  const tFilters = await getTranslations('filters');
  const tPagination = await getTranslations('pagination');
  const tNav = await getTranslations('nav');
  const tBanlist = await getTranslations('banlist');

  // Parse search params for filters
  const page = Number(search.page) || 1;
  const types = typeof search.type === 'string' ? search.type.split(',').filter(Boolean) : [];
  const subtypes = typeof search.subtype === 'string' ? search.subtype.split(',').filter(Boolean) : [];
  const query = typeof search.q === 'string' ? search.q : undefined;
  const releaseYear = Number(search.year) || undefined;
  const pageSize = 20;

  const { cards, total } = await getCards({
    page,
    type: types,
    subtype: subtypes,
    search: query,
    releaseYear,
    pageSize,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const banlist = await getBanlist('tcg');
  const restrictedCount = banlist.forbidden.length + banlist.limited.length;

  // Current filters (minus `page`) so pagination links preserve them.
  const filterQuery: Record<string, string> = {};
  if (types.length) filterQuery.type = types.join(',');
  if (subtypes.length) filterQuery.subtype = subtypes.join(',');
  if (query) filterQuery.q = query;
  if (releaseYear) filterQuery.year = String(releaseYear);

  const typeGroups = buildTypeGroups(tFilters);

  // Cards have been released since 1999; include next year to cover
  // pre-announced upcoming sets with a future releaseDate.
  const FIRST_RELEASE_YEAR = 1999;
  const lastYear = new Date().getFullYear() + 1;
  const yearOptions = Array.from(
    { length: lastYear - FIRST_RELEASE_YEAR + 1 },
    (_, i) => lastYear - i
  );

  // Nav links for the left sidebar
  const navLinks = [
    { href: '/showcase' as const, label: tNav('showcase'), active: true },
    { href: '/collection' as const, label: tNav('collection'), active: false },
    { href: '/banlist' as const, label: tNav('banlist'), active: false },
    { href: '/decks' as const, label: tNav('decks'), active: false },
  ];

  return (
    <div className="container-max py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-8">

      {/* Left Sidebar: Navigation + Filters */}
      <aside className="hidden lg:block space-y-8">
        <SectionNav links={navLinks} />

        {/* Filters */}
        <CatalogFilters
          filtersTitle={tFilters('title')}
          typeLabel={tFilters('type')}
          typeGroups={typeGroups}
          searchLabel={tFilters('search')}
          searchPlaceholder={tFilters('searchPlaceholder')}
          yearLabel={tFilters('year')}
          yearAnyLabel={tFilters('yearAny')}
          yearOptions={yearOptions}
        />
      </aside>

      {/* Main Content: Card Grid */}
      <main className="min-w-0">
        <div className="flex items-end justify-between mb-6 border-b border-brand-border pb-4">
          <h1 className="font-display text-2xl font-bold uppercase tracking-[0.1em] text-brand-text">
            {t('title')}
          </h1>
          <span className="font-mono text-xs text-brand-text-dim">
            {t('cardCount', { count: cards.length, total: total.toLocaleString(locale) })}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button className="px-4 py-1.5 text-[0.8rem] font-mono border border-brand-gold text-brand-gold clip-angle-sm whitespace-nowrap">
            {t('tabs.popular')}
          </button>
          <button className="px-4 py-1.5 text-[0.8rem] font-mono border border-brand-border text-brand-text-dim hover:text-brand-text hover:border-brand-text-dim transition-colors clip-angle-sm whitespace-nowrap">
            {t('tabs.recent')}
          </button>
          <button className="px-4 py-1.5 text-[0.8rem] font-mono border border-brand-border text-brand-text-dim hover:text-brand-text hover:border-brand-text-dim transition-colors clip-angle-sm whitespace-nowrap">
            {t('tabs.meta')}
          </button>
        </div>

        {/* Grid */}
        {cards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {cards.map((card) => (
              <CardPreview key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-brand-border border-dashed clip-angle text-brand-text-dim">
            {t('empty')}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          buildHref={(p) => ({ pathname: '/showcase', query: { ...filterQuery, page: String(p) } })}
          previousLabel={tPagination('previous')}
          nextLabel={tPagination('next')}
        />
      </main>

      {/* Right Sidebar: Banlist & Listings */}
      <aside className="hidden lg:block space-y-8">
        {/* Banlist Alert */}
        <div className="p-5 border border-brand-red bg-brand-red/5 clip-angle-sm">
          <h3 className="font-mono text-[0.7rem] uppercase tracking-widest text-brand-red mb-2">
            {tBanlist('alert')}
          </h3>
          <p className="text-[0.85rem] text-brand-text leading-snug mb-3">
            {tBanlist('alertMessage', { count: restrictedCount })}
          </p>
          <Link href="/banlist" className="text-[0.8rem] text-brand-red hover:text-red-400 transition-colors no-underline">
            {tBanlist('alertLink')}
          </Link>
        </div>
      </aside>

    </div>
  );
}
