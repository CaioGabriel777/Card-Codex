'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { renameDeck, deleteDeck } from '@/lib/actions/decks';

interface DeckHeaderControlsProps {
  deckId: string;
  currentName: string;
}

export default function DeckHeaderControls({ deckId, currentName }: DeckHeaderControlsProps) {
  const t = useTranslations('collection');
  const router = useRouter();

  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(currentName);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    await renameDeck(deckId, name.trim());
    setBusy(false);
    setRenaming(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!window.confirm(t('deleteConfirm'))) return;
    await deleteDeck(deckId);
    router.push('/collection');
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-[0.75rem]">
      {renaming ? (
        <form onSubmit={handleRename} className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="px-2 py-1 bg-brand-inset text-brand-text border border-brand-border focus:outline-none focus:border-brand-gold"
          />
          <button
            type="submit"
            disabled={busy}
            className="px-3 py-1 bg-brand-gold text-brand-bg font-bold uppercase cursor-pointer disabled:opacity-50"
          >
            OK
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setRenaming(true)}
          className="px-3 py-1.5 border border-brand-border text-brand-text-dim hover:text-brand-text hover:border-brand-text-dim transition-colors cursor-pointer"
        >
          {t('rename')}
        </button>
      )}
      <button
        type="button"
        onClick={handleShare}
        className="px-3 py-1.5 border border-brand-border text-brand-text-dim hover:text-brand-text hover:border-brand-text-dim transition-colors cursor-pointer"
      >
        {copied ? t('shareCopied') : t('share')}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="px-3 py-1.5 border border-brand-red text-brand-red hover:bg-brand-red/10 transition-colors cursor-pointer"
      >
        {t('delete')}
      </button>
    </div>
  );
}
