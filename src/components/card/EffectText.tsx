import { useTranslations, useLocale } from 'next-intl';

interface EffectTextProps {
  descEn: string;
  descPt: string | null;
  descJa: string | null;
  className?: string;
}

/**
 * Renders the card's effect text block.
 * Shows the localized description if available, falling back to English.
 */
export default function EffectText({ descEn, descPt, descJa, className = '' }: EffectTextProps) {
  const t = useTranslations('card');
  const locale = useLocale();

  const description =
    locale === 'pt-BR' && descPt
      ? descPt
      : locale === 'ja' && descJa
      ? descJa
      : descEn;

  return (
    <div className={`bg-brand-inset border-l-2 border-brand-gold p-5 clip-notch-br ${className}`}>
      <div className="text-[0.65rem] font-mono text-brand-text-dim uppercase tracking-[0.1em] mb-3">
        {t('effectLabel')}
      </div>
      <p className="text-[0.95rem] leading-relaxed whitespace-pre-wrap">
        {description}
      </p>
    </div>
  );
}
