import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCards } from '@/lib/cards';
import CardPreview from '@/components/card/CardPreview';
import ShowcaseFilters from '@/components/showcase/ShowcaseFilters';

export const dynamic = 'force-dynamic';

export default async function ShowcasePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await params;
  const search = await searchParams;
  const t = await getTranslations('showcase');
  const tNav = await getTranslations('nav');
  const tBanlist = await getTranslations('banlist');

  // Parse search params for filters
  const page = Number(search.page) || 1;
  const types = typeof search.type === 'string' ? search.type.split(',').filter(Boolean) : [];
  const query = typeof search.q === 'string' ? search.q : undefined;

  const { cards, total } = await getCards({ page, type: types, search: query, pageSize: 9 });

  const typeOptions = [
    { value: 'Monster', label: t('filters.monster') },
    { value: 'Spell', label: t('filters.spell') },
    { value: 'Trap', label: t('filters.trap') },
  ];

  // Nav links for the left sidebar
  const navLinks = [
    { href: '/showcase' as const, label: tNav('showcase'), active: true },
    { href: '/collection' as const, label: tNav('collection'), active: false },
    { href: '/banlist' as const, label: tNav('banlist'), active: false },
  ];

  return (
    <div className="container-max py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-8">

      {/* Left Sidebar: Navigation + Filters */}
      <aside className="hidden lg:block space-y-8">
        {/* Navigation */}
        <nav className="space-y-0">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2.5 text-sm font-body no-underline transition-colors ${
                link.active
                  ? 'bg-brand-gold/10 text-brand-gold border-l-2 border-brand-gold font-semibold'
                  : 'text-brand-text-dim hover:text-brand-text hover:bg-brand-surface/50 border-l-2 border-transparent'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Filters */}
        <ShowcaseFilters
          filtersTitle={t('filters.title')}
          typeLabel={t('filters.type')}
          typeOptions={typeOptions}
        />
      </aside>

      {/* Main Content: Card Grid */}
      <main className="min-w-0">
        <div className="flex items-end justify-between mb-6 border-b border-brand-border pb-4">
          <h1 className="font-display text-2xl font-bold uppercase tracking-[0.1em] text-brand-text">
            {t('title')}
          </h1>
          <span className="font-mono text-xs text-brand-text-dim">
            {t('cardCount', { count: cards.length, total: total.toLocaleString() })}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card: any) => (
              <CardPreview key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-brand-border border-dashed clip-angle text-brand-text-dim">
            {t('empty')}
          </div>
        )}
      </main>

      {/* Right Sidebar: Banlist & Listings */}
      <aside className="hidden lg:block space-y-8">
        {/* Banlist Alert */}
        <div className="p-5 border border-brand-red bg-brand-red/5 clip-angle-sm">
          <h3 className="font-mono text-[0.7rem] uppercase tracking-widest text-brand-red mb-2">
            {tBanlist('alert')}
          </h3>
          <p className="text-[0.85rem] text-brand-text leading-snug mb-3">
            {tBanlist('alertMessage', { count: 3 })}
          </p>
          <a href="#" className="text-[0.8rem] text-brand-red hover:text-red-400 transition-colors no-underline">
            {tBanlist('alertLink')}
          </a>
        </div>
      </aside>

    </div>
  );
}
