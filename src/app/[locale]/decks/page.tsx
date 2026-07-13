import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link, getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getAnimeDecks } from '@/lib/animeDecks';
import SectionNav from '@/components/shared/SectionNav';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'decks' });
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ href: '/decks', locale: l })])
  );

  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: getPathname({ href: '/decks', locale }),
      languages,
    },
  };
}

export default async function DecksPage() {
  const t = await getTranslations('decks');
  const tNav = await getTranslations('nav');
  const decks = await getAnimeDecks();

  const navLinks = [
    { href: '/showcase' as const, label: tNav('showcase'), active: false },
    { href: '/collection' as const, label: tNav('collection'), active: false },
    { href: '/banlist' as const, label: tNav('banlist'), active: false },
    { href: '/decks' as const, label: tNav('decks'), active: true },
  ];

  return (
    <div className="container-max py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
      <aside className="hidden lg:block">
        <SectionNav links={navLinks} />
      </aside>

      <main className="min-w-0">
        <div className="mb-10 border-b border-brand-border pb-4">
          <h1 className="font-display text-2xl font-bold uppercase tracking-[0.1em] text-brand-text">
            {t('title')}
          </h1>
          <p className="font-body text-brand-text-dim mt-2 max-w-2xl">{t('subtitle')}</p>
        </div>

        {decks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Link
                key={deck.id}
                href={{ pathname: '/decks/[slug]', params: { slug: deck.slug } }}
                className="block group h-full"
              >
                <div className="bg-brand-surface-3 p-px clip-angle h-full transition-colors duration-300 group-hover:bg-brand-gold">
                  <div className="bg-brand-surface-2 clip-angle h-full p-6 transition-transform duration-300 group-hover:-translate-y-1">
                    <span className="font-mono text-[0.65rem] uppercase tracking-widest text-brand-gold">
                      {deck.season}
                    </span>
                    <h2 className="font-display font-bold text-lg text-brand-text group-hover:text-brand-gold transition-colors mt-1 mb-2 uppercase tracking-wide">
                      {deck.character}
                    </h2>
                    <p className="text-[0.8rem] text-brand-text-dim">
                      {t('cardCount', { count: deck._count.cards })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-brand-border border-dashed clip-angle text-brand-text-dim">
            {t('empty')}
          </div>
        )}
      </main>
    </div>
  );
}
