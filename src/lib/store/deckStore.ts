import { create } from 'zustand';
import type { DeckFormat } from '@prisma/client';
import { getMyDecks, addCardToDeck, createDeck } from '@/lib/actions/decks';

export interface MyDeck {
  id: string;
  slug: string;
  name: string;
  format: DeckFormat;
  mainCount: number;
  extraCount: number;
}

interface DeckStoreState {
  decks: MyDeck[] | null;
  loading: boolean;
  fetchDecks: () => Promise<void>;
  addCard: (deckId: string, cardId: string) => Promise<{ ok: boolean; error?: string }>;
  createAndSelect: (name: string, format: DeckFormat) => Promise<{ ok: boolean; slug?: string; error?: string }>;
}

/**
 * Client-side cache of the signed-in user's decks, shared by every
 * `AddToDeckButton` on the site (showcase, banlist, anime decks, related
 * cards, home) without prop-drilling session/deck data through each page.
 */
export const useDeckStore = create<DeckStoreState>((set, get) => ({
  decks: null,
  loading: false,

  fetchDecks: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const decks = await getMyDecks();
      set({ decks, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addCard: async (deckId, cardId) => {
    const result = await addCardToDeck(deckId, cardId);
    if (result.ok) {
      await get().fetchDecks();
      return { ok: true };
    }
    return { ok: false, error: result.error };
  },

  createAndSelect: async (name, format) => {
    const result = await createDeck(name, format);
    if (result.ok) {
      await get().fetchDecks();
      return { ok: true, slug: result.data.slug };
    }
    return { ok: false, error: result.error };
  },
}));
