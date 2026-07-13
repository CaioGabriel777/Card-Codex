'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import CardSearchInput from '@/components/search/CardSearchInput';

/**
 * Site header with logo, search bar, locale switcher, and account menu.
 * Tailwind v4 version matching the prototype's dark obsidian header with gold accents.
 */
export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { data: session, status } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const switchLocale = (newLocale: string) => {
    router.replace(
      { pathname, params } as Parameters<typeof router.replace>[0],
      { locale: newLocale }
    );
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
          {status === 'authenticated' && session.user ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 px-2 py-1 bg-transparent border border-transparent text-brand-text text-[0.85rem] cursor-pointer transition-colors duration-200 hover:border-brand-border"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={26}
                    height={26}
                    className="rounded-full border border-brand-border"
                  />
                ) : (
                  <span className="w-[26px] h-[26px] flex items-center justify-center rounded-full bg-brand-surface-3 text-brand-gold text-xs font-bold">
                    {session.user.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
                <span className="hidden md:inline max-w-[100px] truncate">{session.user.name}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-brand-surface-2 border border-brand-border clip-angle-sm shadow-2xl z-50 overflow-hidden">
                  <Link
                    href="/collection"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-[0.85rem] text-brand-text no-underline hover:bg-brand-surface-3 transition-colors"
                  >
                    {t('nav.collection')}
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2.5 text-[0.85rem] text-brand-text-dim hover:bg-brand-surface-3 hover:text-brand-text transition-colors cursor-pointer"
                  >
                    {t('auth.signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="px-4 py-1.5 bg-transparent border border-brand-border text-brand-text text-[0.85rem] cursor-pointer transition-colors duration-200 clip-angle-sm hover:border-brand-gold hover:text-brand-gold"
            >
              {t('auth.signIn')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
