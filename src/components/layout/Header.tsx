'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import CardSearchInput from '@/components/search/CardSearchInput';

/**
 * Site header with logo, search bar and locale switcher.
 * Tailwind v4 version matching the prototype's dark obsidian header with gold accents.
 */
export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const switchLocale = (newLocale: string) => {
    router.replace({ pathname, params } as any, { locale: newLocale });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-brand-bg border-b border-brand-border">
      <div className="container-max h-full flex items-center gap-8">
        <Link href="/" className="flex items-baseline gap-1.5 no-underline whitespace-nowrap">
          <span className="font-display text-[1.3rem] font-bold text-brand-text tracking-[0.15em]">CARD</span>
          <span className="font-display text-[1.3rem] font-bold text-brand-gold tracking-[0.15em]">CODEX</span>
          <span className="font-mono text-[0.65rem] text-brand-text-dim tracking-[0.15em] uppercase ml-2 hidden sm:inline">
            {t('site.tagline')}
          </span>
        </Link>

        <div className="flex-1 max-w-[480px]">
          <CardSearchInput id="header-search" placeholder={t('search.placeholder')} variant="header" />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="flex gap-0.5">
            {['en', 'ja', 'pt-BR'].map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`px-2.5 py-1 border text-[0.75rem] font-mono cursor-pointer transition-colors duration-200 ${
                  locale === loc
                    ? 'bg-brand-gold text-brand-bg border-brand-gold'
                    : 'bg-transparent border-brand-border text-brand-text-dim hover:text-brand-text hover:border-brand-gold/50'
                }`}
                aria-label={`Switch to ${loc}`}
              >
                {loc === 'pt-BR' ? 'PT' : loc === 'en' ? 'EN' : 'JA'}
              </button>
            ))}
          </div>
          <button className="px-4 py-1.5 bg-transparent border border-brand-border text-brand-text text-[0.85rem] cursor-pointer transition-colors duration-200 clip-angle-sm hover:border-brand-gold hover:text-brand-gold">
            {t('nav.login')}
          </button>
        </div>
      </div>
    </header>
  );
}
