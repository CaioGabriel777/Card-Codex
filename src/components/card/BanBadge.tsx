interface BanBadgeProps {
  status: string;
  label: string;
  formatLabel: string;
}

const ACCENT: Record<string, string> = {
  Forbidden: 'border-brand-red text-brand-red bg-brand-red/10',
  Limited: 'border-brand-gold text-brand-gold bg-brand-gold/10',
  'Semi-Limited': 'border-brand-blue text-brand-blue bg-brand-blue/10',
};

/** Small badge for a card's TCG/OCG restriction status (Forbidden/Limited/Semi-Limited). */
export default function BanBadge({ status, label, formatLabel }: BanBadgeProps) {
  const accent = ACCENT[status] ?? 'border-brand-border text-brand-text-dim';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[0.7rem] font-mono uppercase tracking-wider ${accent}`}>
      <span className="opacity-70">{formatLabel}</span>
      {label}
    </span>
  );
}
