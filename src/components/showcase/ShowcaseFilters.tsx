'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';

interface FilterOption {
  value: string;
  label: string;
}

interface ShowcaseFiltersProps {
  filtersTitle: string;
  typeLabel: string;
  typeOptions: FilterOption[];
  rarityLabel: string;
  rarityOptions: FilterOption[];
}

/**
 * Client-side Type/Rarity checkbox filters for the showcase grid.
 * Selections are stored as comma-separated `type`/`rarity` query params
 * so the server component can re-fetch filtered results.
 */
export default function ShowcaseFilters({
  filtersTitle,
  typeLabel,
  typeOptions,
  rarityLabel,
  rarityOptions,
}: ShowcaseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedTypes = searchParams.get('type')?.split(',').filter(Boolean) ?? [];
  const selectedRarities = searchParams.get('rarity')?.split(',').filter(Boolean) ?? [];

  const toggle = (key: 'type' | 'rarity', value: string, current: string[]) => {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    const params = new URLSearchParams(searchParams.toString());
    if (next.length) params.set(key, next.join(',')); else params.delete(key);
    params.delete('page');
    router.push({ pathname, query: Object.fromEntries(params) } as any);
  };

  return (
    <div>
      <h2 className="font-display text-brand-gold uppercase tracking-[0.15em] text-sm font-bold border-b border-brand-border pb-2 mb-4">
        {filtersTitle}
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-[0.7rem] uppercase tracking-widest text-brand-text-dim mb-3">{typeLabel}</h3>
          <div className="space-y-2.5 font-mono text-[0.85rem] text-brand-text">
            {typeOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer hover:text-brand-gold transition-colors">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(opt.value)}
                  onChange={() => toggle('type', opt.value, selectedTypes)}
                  className="w-3.5 h-3.5 accent-brand-gold bg-brand-surface border-brand-border rounded-none"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[0.7rem] uppercase tracking-widest text-brand-text-dim mb-3">{rarityLabel}</h3>
          <div className="space-y-2.5 font-mono text-[0.85rem] text-brand-text">
            {rarityOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer hover:text-brand-gold transition-colors">
                <input
                  type="checkbox"
                  checked={selectedRarities.includes(opt.value)}
                  onChange={() => toggle('rarity', opt.value, selectedRarities)}
                  className="w-3.5 h-3.5 accent-brand-gold"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
