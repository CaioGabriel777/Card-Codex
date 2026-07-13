'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';

interface FilterOption {
  value: string;
  label: string;
}

interface TypeGroup extends FilterOption {
  subtypes: FilterOption[];
}

interface CatalogFiltersProps {
  filtersTitle: string;
  typeLabel: string;
  typeGroups: TypeGroup[];
  searchLabel: string;
  searchPlaceholder: string;
  yearLabel: string;
  yearAnyLabel: string;
  yearOptions: number[];
  /** Optional ban-status checkboxes (Forbidden/Limited/Semi-Limited) — only rendered when provided, e.g. on the banlist page. */
  statusLabel?: string;
  statusOptions?: FilterOption[];
}

/**
 * Client-side catalog filters shared by the showcase and banlist pages:
 * card-name text, Monster/Spell/Trap checkboxes with nested subtype
 * checkboxes (e.g. Effect Monster, Field Spell), release year, and
 * (optionally) ban-status. Selections live in the `type`/`subtype`/`q`/
 * `year`/`status` query params so the server component can re-fetch
 * filtered results; changing any of them resets `page`.
 */
export default function CatalogFilters({
  filtersTitle,
  typeLabel,
  typeGroups,
  searchLabel,
  searchPlaceholder,
  yearLabel,
  yearAnyLabel,
  yearOptions,
  statusLabel,
  statusOptions,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedTypes = searchParams.get('type')?.split(',').filter(Boolean) ?? [];
  const selectedSubtypes = searchParams.get('subtype')?.split(',').filter(Boolean) ?? [];
  const selectedStatuses = searchParams.get('status')?.split(',').filter(Boolean) ?? [];
  const selectedYear = searchParams.get('year') ?? '';
  const [nameQuery, setNameQuery] = useState(searchParams.get('q') ?? '');

  const navigate = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete('page');
    router.push(
      { pathname, query: Object.fromEntries(params) } as Parameters<typeof router.push>[0]
    );
  };

  const toggleIn = (paramName: string, selected: string[], value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    navigate((params) => {
      if (next.length) params.set(paramName, next.join(',')); else params.delete(paramName);
    });
  };

  const setYear = (value: string) => {
    navigate((params) => {
      if (value) params.set('year', value); else params.delete('year');
    });
  };

  // Debounced so every keystroke doesn't trigger a server re-fetch.
  useEffect(() => {
    const trimmed = nameQuery.trim();
    if (trimmed === (searchParams.get('q') ?? '')) return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set('q', trimmed); else params.delete('q');
      params.delete('page');
      router.push(
        { pathname, query: Object.fromEntries(params) } as Parameters<typeof router.push>[0]
      );
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameQuery]);

  return (
    <div>
      <h2 className="font-display text-brand-gold uppercase tracking-[0.15em] text-sm font-bold border-b border-brand-border pb-2 mb-4">
        {filtersTitle}
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-[0.7rem] uppercase tracking-widest text-brand-text-dim mb-3">{searchLabel}</h3>
          <input
            type="text"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full px-3 py-2 bg-brand-inset text-brand-text text-[0.85rem] font-body clip-angle-input placeholder-brand-text-dim border border-brand-border focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>

        {statusOptions && statusOptions.length > 0 && (
          <div>
            <h3 className="text-[0.7rem] uppercase tracking-widest text-brand-text-dim mb-3">{statusLabel}</h3>
            <div className="space-y-2.5 font-mono text-[0.85rem] text-brand-text">
              {statusOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer hover:text-brand-gold transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(opt.value)}
                    onChange={() => toggleIn('status', selectedStatuses, opt.value)}
                    className="w-3.5 h-3.5 accent-brand-gold bg-brand-surface border-brand-border rounded-none"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-[0.7rem] uppercase tracking-widest text-brand-text-dim mb-3">{typeLabel}</h3>
          <div className="space-y-3 font-mono text-[0.85rem] text-brand-text">
            {typeGroups.map((group) => (
              <div key={group.value}>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-brand-gold transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(group.value)}
                    onChange={() => toggleIn('type', selectedTypes, group.value)}
                    className="w-3.5 h-3.5 accent-brand-gold bg-brand-surface border-brand-border rounded-none"
                  />
                  {group.label}
                </label>
                <div className="mt-1.5 ml-5 space-y-1.5 text-[0.78rem] text-brand-text-dim border-l border-brand-border pl-3">
                  {group.subtypes.map((sub) => (
                    <label key={sub.value} className="flex items-center gap-2 cursor-pointer hover:text-brand-gold transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedSubtypes.includes(sub.value)}
                        onChange={() => toggleIn('subtype', selectedSubtypes, sub.value)}
                        className="w-3 h-3 accent-brand-gold bg-brand-surface border-brand-border rounded-none"
                      />
                      {sub.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[0.7rem] uppercase tracking-widest text-brand-text-dim mb-3">{yearLabel}</h3>
          <select
            value={selectedYear}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-3 py-2 bg-brand-inset text-brand-text text-[0.85rem] font-body clip-angle-input border border-brand-border focus:outline-none focus:border-brand-gold transition-colors cursor-pointer"
          >
            <option value="">{yearAnyLabel}</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
