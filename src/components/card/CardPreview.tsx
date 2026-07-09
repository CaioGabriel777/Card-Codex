import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface CardPreviewProps {
  card: any;
  className?: string;
}

/**
 * A card thumbnail for the showcase grid.
 */
export default function CardPreview({ card, className = '' }: CardPreviewProps) {
  const locale = useLocale();
  const t = useTranslations('card');

  const name =
    locale === 'pt-BR' && card.namePt
      ? card.namePt
      : locale === 'ja' && card.nameJa
      ? card.nameJa
      : card.nameEn;

  return (
    <Link
      href={{ pathname: '/card/[slug]', params: { slug: card.slug } }}
      className={`block group h-full ${className}`}
    >
      <div className="bg-brand-surface-3 p-px clip-angle h-full transition-colors duration-300 group-hover:bg-brand-gold">
        <div className="bg-brand-surface-2 clip-angle h-full flex flex-col p-4 transition-transform duration-300 group-hover:-translate-y-1 relative overflow-hidden">

          {/* Card Image */}
          <div className="w-full aspect-[0.686] relative mb-4 rounded-sm overflow-hidden bg-brand-bg opacity-90 group-hover:opacity-100 transition-opacity">
            <Image
              src={card.imageSmallUrl || card.imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1">
            <h3 className="font-display font-bold text-[1.1rem] leading-tight mb-1 text-brand-text group-hover:text-brand-gold transition-colors">
              {name}
            </h3>
            <p className="text-[0.7rem] uppercase tracking-widest text-brand-text-dim mb-4">
              {card.race} / {card.attribute || card.type}
              {card.level ? ` · ${t('level')} ${card.level}` : ''}
            </p>

            <div className="mt-auto pt-4 border-t border-brand-border-subtle flex items-center gap-3 text-[0.7rem] font-mono text-brand-text-dim">
              {card.atk !== null && <span>ATK {card.atk}</span>}
              {card.def !== null && <span>DEF {card.def}</span>}
              {card.atk === null && card.def === null && <span>--</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
