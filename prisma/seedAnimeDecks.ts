/**
 * Seeds hand-curated anime character decks. Unlike prisma/sync.ts, there's no
 * API for this — decklists are compiled from wiki/community sources
 * cross-referencing the anime episodes, then matched against cards already
 * in the database. Run `npm run db:sync` first so every referenced card exists.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DeckCardEntry {
  name: string;
  category?: 'Main' | 'Extra';
}

interface DeckDefinition {
  slug: string;
  character: string;
  series: string;
  season: string;
  titleEn: string;
  titlePt: string;
  descriptionEn: string;
  descriptionPt: string;
  cards: DeckCardEntry[];
}

const DECKS: DeckDefinition[] = [
  {
    slug: 'yugi-muto-season-1',
    character: 'Yugi Muto',
    series: 'Yu-Gi-Oh! Duel Monsters',
    season: 'Season 1: Duelist Kingdom',
    titleEn: 'Yugi Muto — Season 1 (Duelist Kingdom)',
    titlePt: 'Yugi Muto — Temporada 1 (Reino dos Duelistas)',
    descriptionEn:
      'The deck Yugi inherited from his grandfather Solomon Muto, built around low-Level EARTH and DARK Normal Monsters ' +
      'boosted by equip and ritual support. It originally included the five "Forbidden One" (Exodia) pieces — used to ' +
      'defeat Seto Kaiba in their first duel — but Weevil Underwood threw them overboard on the way to Duelist Kingdom, ' +
      'and only two were ever recovered, so Yugi rebuilt around Dark Magician instead. Polymerization, Gaia the Fierce ' +
      'Knight, and Curse of Dragon fuse into Gaia the Dragon Champion for the Duelist Kingdom finals against Kaiba.',
    descriptionPt:
      'O deck que Yugi herdou do avô, Solomon Muto, construído em torno de Monstros Normais de baixo Nível dos ' +
      'atributos TERRA e TREVAS, reforçados por magias de equipamento e suporte ritual. Originalmente incluía as cinco ' +
      'peças de "Exodia, o Proibido" — usadas para derrotar Seto Kaiba no primeiro duelo — mas Weevil Underwood as jogou ' +
      'no mar a caminho do Reino dos Duelistas, e apenas duas foram recuperadas, então Yugi reconstruiu o deck em torno ' +
      'do Mago Negro. Polimerização, Gaia, o Cavaleiro Feroz, e Maldição do Dragão se fundem em Gaia, o Campeão Dragão ' +
      'para a final contra Kaiba.',
    cards: [
      { name: 'Dark Magician' },
      { name: 'Gaia The Fierce Knight' },
      { name: 'Summoned Skull' },
      { name: 'Curse of Dragon' },
      { name: 'Rude Kaiser' },
      { name: 'Battle Steer' },
      { name: 'Koumori Dragon' },
      { name: 'Blackland Fire Dragon' },
      { name: 'Winged Dragon, Guardian of the Fortress #1' },
      { name: 'Celtic Guardian' },
      { name: 'Feral Imp' },
      { name: 'Horn Imp' },
      { name: 'Beaver Warrior' },
      { name: 'Griffore' },
      { name: 'Mystical Elf' },
      { name: 'Giant Soldier of Stone' },
      { name: 'Mammoth Graveyard' },
      { name: 'Silver Fang' },
      { name: 'Torike' },
      { name: 'Catapult Turtle' },
      { name: 'Sangan' },
      { name: 'Kuriboh' },
      { name: 'Magician of Black Chaos' },
      { name: 'Mystic Box' },
      { name: 'Polymerization' },
      { name: 'Swords of Revealing Light' },
      { name: 'Monster Reborn' },
      { name: 'Brain Control' },
      { name: 'Monster Recovery' },
      { name: 'Spell Shattering Arrow' },
      { name: 'Burning Land' },
      { name: 'Mystical Moon' },
      { name: 'Horn of the Unicorn' },
      { name: 'Book of Secret Arts' },
      { name: 'Black Magic Ritual' },
      { name: 'Mirror Force' },
      { name: 'Shift' },
      { name: 'Magical Hats' },
      { name: 'Spellbinding Circle' },
      { name: 'Horn of Heaven' },
      { name: 'Black Skull Dragon', category: 'Extra' },
      { name: 'Gaia the Dragon Champion', category: 'Extra' },
    ],
  },
];

async function main() {
  for (const deck of DECKS) {
    const dbDeck = await prisma.animeDeck.upsert({
      where: { slug: deck.slug },
      update: {
        character: deck.character,
        series: deck.series,
        season: deck.season,
        titleEn: deck.titleEn,
        titlePt: deck.titlePt,
        descriptionEn: deck.descriptionEn,
        descriptionPt: deck.descriptionPt,
      },
      create: {
        slug: deck.slug,
        character: deck.character,
        series: deck.series,
        season: deck.season,
        titleEn: deck.titleEn,
        titlePt: deck.titlePt,
        descriptionEn: deck.descriptionEn,
        descriptionPt: deck.descriptionPt,
      },
    });

    console.log(`Deck: ${deck.titleEn}`);

    let missing = 0;
    for (const entry of deck.cards) {
      const card = await prisma.card.findFirst({
        where: { nameEn: { equals: entry.name, mode: 'insensitive' } },
        select: { id: true },
      });

      if (!card) {
        console.log(`  ✗ MISSING: ${entry.name} (skipped — run npm run db:sync first)`);
        missing++;
        continue;
      }

      await prisma.animeDeckCard.upsert({
        where: { deckId_cardId: { deckId: dbDeck.id, cardId: card.id } },
        update: { category: entry.category ?? 'Main' },
        create: {
          deckId: dbDeck.id,
          cardId: card.id,
          category: entry.category ?? 'Main',
        },
      });
    }

    console.log(`  ✓ ${deck.cards.length - missing}/${deck.cards.length} cards linked`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
