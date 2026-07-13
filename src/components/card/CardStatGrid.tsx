import type { Card } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { formatAtkDef } from '@/lib/cardStats';

interface CardStatGridProps {
  card: Card;
  className?: string;
}

/**
 * Grid displaying ATK, DEF, Level and Attribute.
 */
export default function CardStatGrid({ card, className = '' }: CardStatGridProps) {
  const t = useTranslations('card');
  // Only render stats if the card has them (e.g. monsters)
  if (card.atk === null && !card.attribute) return null;

  return (
    <div className={`grid grid-cols-4 gap-px bg-brand-surface clip-angle overflow-hidden ${className}`}>
      {card.atk !== null && (
        <div className="flex flex-col gap-1 bg-brand-inset px-3.5 py-3">
          <span className="text-[0.65rem] font-mono text-brand-text-dim uppercase tracking-wider">ATK</span>
          <span className="font-mono text-brand-gold text-lg">{formatAtkDef(card.atk)}</span>
        </div>
      )}
      {card.def !== null && (
        <div className="flex flex-col gap-1 bg-brand-inset px-3.5 py-3">
          <span className="text-[0.65rem] font-mono text-brand-text-dim uppercase tracking-wider">DEF</span>
          <span className="font-mono text-brand-text text-lg">{formatAtkDef(card.def)}</span>
        </div>
      )}
      {card.level !== null && (
        <div className="flex flex-col gap-1 bg-brand-inset px-3.5 py-3">
          <span className="text-[0.65rem] font-mono text-brand-text-dim uppercase tracking-wider">{t('level')}</span>
          <span className="font-mono text-brand-text text-lg">{card.level}</span>
        </div>
      )}
      {card.attribute && (
        <div className="flex flex-col gap-1 bg-brand-inset px-3.5 py-3">
          <span className="text-[0.65rem] font-mono text-brand-text-dim uppercase tracking-wider">{t('attribute')}</span>
          <span className="font-display font-bold text-brand-gold uppercase tracking-widest">{card.attribute}</span>
        </div>
      )}
    </div>
  );
}
