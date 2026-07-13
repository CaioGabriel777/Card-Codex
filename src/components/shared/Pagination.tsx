import type { ComponentProps } from 'react';
import { Link } from '@/i18n/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => ComponentProps<typeof Link>['href'];
  previousLabel: string;
  nextLabel: string;
}

type PageEntry = number | 'ellipsis';

/** First, last, current ±1, with ellipses for the gaps — avoids listing every page on large result sets. */
function getPageNumbers(current: number, total: number): PageEntry[] {
  const pages: PageEntry[] = [1];

  if (current - 1 > 2) pages.push('ellipsis');

  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }

  if (current + 1 < total - 1) pages.push('ellipsis');
  if (total > 1) pages.push(total);

  return pages;
}

export default function Pagination({ currentPage, totalPages, buildHref, previousLabel, nextLabel }: PaginationProps) {
  if (totalPages <= 1) return null;

  const arrowClasses = (disabled: boolean) =>
    `px-3 py-1.5 border clip-angle-sm transition-colors ${
      disabled
        ? 'border-brand-border text-brand-text-dim/40 pointer-events-none'
        : 'border-brand-border text-brand-text-dim hover:text-brand-gold hover:border-brand-gold'
    }`;

  return (
    <nav className="flex items-center justify-center flex-wrap gap-2 mt-10 font-mono text-[0.8rem]" aria-label="Pagination">
      <Link href={buildHref(Math.max(1, currentPage - 1))} className={arrowClasses(currentPage === 1)}>
        {previousLabel}
      </Link>

      {getPageNumbers(currentPage, totalPages).map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-1 text-brand-text-dim">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`w-8 h-8 flex items-center justify-center border clip-angle-sm transition-colors ${
              p === currentPage
                ? 'bg-brand-gold text-brand-bg border-brand-gold'
                : 'border-brand-border text-brand-text-dim hover:text-brand-gold hover:border-brand-gold'
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        className={arrowClasses(currentPage === totalPages)}
      >
        {nextLabel}
      </Link>
    </nav>
  );
}
