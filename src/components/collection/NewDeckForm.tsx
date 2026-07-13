'use client';

import { useState } from 'react';
import type { DeckFormat } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { createDeck } from '@/lib/actions/decks';
import { useRouter } from '@/i18n/navigation';

export default function NewDeckForm() {
  const t = useTranslations('collection');
  const tFormat = useTranslations('deckFormat');
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<DeckFormat>('FREE');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    const result = await createDeck(name.trim(), format);
    setBusy(false);
    if (result.ok) {
      router.push({ pathname: '/collection/[slug]', params: { slug: result.data.slug } });
    } else {
      setError(result.error);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-gold text-[0.85rem] px-6 py-2.5"
      >
        + {t('newDeck')}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('deckNamePlaceholder')}
        autoFocus
        className="px-3 py-2 bg-brand-inset text-brand-text text-[0.85rem] font-body clip-angle-input border border-brand-border focus:outline-none focus:border-brand-gold"
      />
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as DeckFormat)}
        className="px-3 py-2 bg-brand-inset text-brand-text text-[0.85rem] font-body border border-brand-border focus:outline-none focus:border-brand-gold cursor-pointer"
      >
        <option value="FREE">{tFormat('free')}</option>
        <option value="TCG">{tFormat('tcg')}</option>
        <option value="OCG">{tFormat('ocg')}</option>
      </select>
      <button
        type="submit"
        disabled={busy || !name.trim()}
        className="btn-gold text-[0.85rem] px-6 py-2.5 disabled:opacity-50"
      >
        {t('createButton')}
      </button>
      {error && <span className="text-[0.75rem] text-brand-red">{error}</span>}
    </form>
  );
}
