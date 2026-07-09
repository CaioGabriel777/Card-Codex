import { getTranslations } from 'next-intl/server';

export default async function PlaceholderPage() {
  const t = await getTranslations('placeholder');

  return (
    <div className="container-max py-20 flex flex-col items-center justify-center text-center min-h-[50vh]">
      <div className="surface p-12 clip-angle max-w-lg w-full border-dashed">
        <h1 className="font-display text-3xl font-bold text-brand-gold uppercase tracking-[0.1em] mb-4">
          {t('title')}
        </h1>
        <p className="font-body text-brand-text-dim text-lg">
          {t('description')}
        </p>
      </div>
    </div>
  );
}
