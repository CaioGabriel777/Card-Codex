import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link, getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { auth, signIn } from '@/lib/auth';
import { getMyDecks } from '@/lib/actions/decks';
import SectionNav from '@/components/shared/SectionNav';
import NewDeckForm from '@/components/collection/NewDeckForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'collection' });
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ href: '/collection', locale: l })])
  );

  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: getPathname({ href: '/collection', locale }),
      languages,
    },
  };
}

export default async function CollectionPage() {
  const t = await getTranslations('collection');
  const tFormat = await getTranslations('deckFormat');
  const tNav = await getTranslations('nav');
  const tDecks = await getTranslations('decks');
  const session = await auth();

  const navLinks = [
    { href: '/showcase' as const, label: tNav('showcase'), active: false },
    { href: '/collection' as const, label: tNav('collection'), active: true },
    { href: '/banlist' as const, label: tNav('banlist'), active: false },
    { href: '/decks' as const, label: tNav('decks'), active: false },
  ];

  if (!session?.user) {
    return (
      <div className="container-max py-20 flex flex-col items-center justify-center text-center min-h-[50vh]">
        <div className="surface p-12 clip-angle max-w-lg w-full border-dashed">
          <h1 className="font-display text-3xl font-bold text-brand-gold uppercase tracking-[0.1em] mb-4">
            {t('title')}
          </h1>
          <p className="font-body text-brand-text-dim text-lg mb-8">{t('subtitle')}</p>
          <form
            action={async () => {
              'use server';
              await signIn('google');
            }}
          >
            <button type="submit" className="btn-gold text-[1rem] px-8 py-3">
              {t('signInCta')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const decks = await getMyDecks();

  return (
    <div className="container-max py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
      <aside className="hidden lg:block">
        <SectionNav links={navLinks} />
      </aside>

      <main className="min-w-0">
        <div className="flex items-end justify-between mb-10 border-b border-brand-border pb-4 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-[0.1em] text-brand-text">
              {t('title')}
            </h1>
            <p className="font-body text-brand-text-dim mt-2 max-w-2xl">{t('subtitle')}</p>
          </div>
          <NewDeckForm />
        </div>

        {decks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Link
                key={deck.id}
                href={{ pathname: '/collection/[slug]', params: { slug: deck.slug } }}
                className="block group h-full"
              >
                <div className="bg-brand-surface-3 p-px clip-angle h-full transition-colors duration-300 group-hover:bg-brand-gold">
                  <div className="bg-brand-surface-2 clip-angle h-full p-6 transition-transform duration-300 group-hover:-translate-y-1">
                    <span className="font-mono text-[0.65rem] uppercase tracking-widest text-brand-gold">
                      {tFormat(deck.format.toLowerCase() as 'free' | 'tcg' | 'ocg')}
                    </span>
                    <h2 className="font-display font-bold text-lg text-brand-text group-hover:text-brand-gold transition-colors mt-1 mb-2 uppercase tracking-wide truncate">
                      {deck.name}
                    </h2>
                    <p className="text-[0.8rem] text-brand-text-dim">
                      {tDecks('cardCount', { count: deck.mainCount + deck.extraCount })}
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
