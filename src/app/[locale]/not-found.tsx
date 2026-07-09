import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

/**
 * 404 page, styled as a "banished" empty card slot to match the catalog theme.
 */
export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="relative overflow-hidden min-h-[calc(90vh-var(--header-height))] flex items-center">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-gold opacity-5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-max relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 py-20">
        {/* Empty card slot */}
        <div className="relative w-[180px] sm:w-[220px] aspect-[0.686] shrink-0">
          <div className="w-full h-full border-[1.5px] border-dashed border-brand-border flex items-center justify-center bg-brand-surface-2/40">
            <span className="font-display text-6xl text-brand-text-dim/30">?</span>
          </div>
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-[1.5px] border-l-[1.5px] border-brand-gold/60" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-[1.5px] border-r-[1.5px] border-brand-gold/60" />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-lg">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-brand-gold mb-4">
            {t('eyebrow')}
          </span>
          <h1 className="font-display font-bold text-7xl md:text-8xl text-brand-text leading-none tracking-wide mb-6">
            {t('code')}
          </h1>
          <h2 className="font-display font-bold text-xl md:text-2xl text-brand-text uppercase tracking-wide mb-4">
            {t('title')}
          </h2>
          <p className="font-body text-brand-text-dim mb-10">
            {t('description')}
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <Link href="/" className="btn-gold">
              {t('cta')}
            </Link>
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-transparent text-brand-text border-[1.5px] border-brand-border font-display text-[0.85rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200 clip-angle-btn hover:border-brand-gold hover:text-brand-gold"
            >
              {t('ctaSearch')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
