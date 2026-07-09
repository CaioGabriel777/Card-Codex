'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

interface SearchResult {
  slug: string;
  nameEn: string;
  namePt: string | null;
  nameJa: string | null;
  imageSmallUrl: string | null;
  type: string;
}

interface CardSearchInputProps {
  id?: string;
  placeholder: string;
  variant?: 'header' | 'hero';
}

/**
 * Debounced card-name typeahead. Shows matching cards with a thumbnail
 * in a dropdown below the input; picking one goes straight to its page.
 * Pressing Enter (or the magnifier on the hero variant) runs a full
 * search on the showcase instead.
 */
export default function CardSearchInput({ id, placeholder, variant = 'header' }: CardSearchInputProps) {
  const locale = useLocale();
  const tSearch = useTranslations('search');
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setIsOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const nameFor = (r: SearchResult) =>
    (locale === 'pt-BR' && r.namePt) || (locale === 'ja' && r.nameJa) || r.nameEn;

  const goToCard = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push({ pathname: '/card/[slug]', params: { slug } });
  };

  const submitSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    router.push({ pathname: '/showcase', query: { q: trimmed } });
  };

  const inputClasses =
    variant === 'hero'
      ? 'w-full px-6 py-4 bg-brand-surface border-2 border-brand-border text-brand-text font-body text-lg clip-angle focus:outline-none focus:border-brand-gold transition-colors placeholder:text-brand-text-dim/50'
      : 'w-full px-4 py-2 bg-brand-inset text-brand-text text-[0.85rem] font-body clip-angle-input placeholder-brand-text-dim focus:outline-none';

  const input = (
    <input
      id={id}
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
      onFocus={() => results.length > 0 && setIsOpen(true)}
      placeholder={placeholder}
      className={inputClasses}
      autoComplete="off"
    />
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {variant === 'hero' ? (
        <div className="relative">
          {input}
          <button
            type="button"
            onClick={submitSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-brand-gold hover:text-brand-blue transition-colors"
            aria-label={placeholder}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      ) : (
        <div className="bg-brand-surface-3 p-px clip-angle-input">{input}</div>
      )}

      {isOpen && (results.length > 0 || !loading) && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-brand-surface-2 border border-brand-border clip-angle-sm shadow-2xl z-50 overflow-hidden">
          {results.length > 0 ? (
            results.map((r) => (
              <button
                key={r.slug}
                type="button"
                onClick={() => goToCard(r.slug)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-brand-surface-3 transition-colors cursor-pointer"
              >
                <div className="relative w-8 h-11 shrink-0 bg-brand-bg overflow-hidden rounded-sm">
                  {r.imageSmallUrl && (
                    <Image src={r.imageSmallUrl} alt={nameFor(r)} fill sizes="32px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[0.85rem] text-brand-text truncate">{nameFor(r)}</p>
                  <p className="text-[0.65rem] uppercase tracking-wider text-brand-text-dim truncate">{r.type}</p>
                </div>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-[0.8rem] text-brand-text-dim">{tSearch('noResults')}</p>
          )}
        </div>
      )}
    </div>
  );
}
