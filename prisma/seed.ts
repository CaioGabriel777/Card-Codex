import { PrismaClient } from '@prisma/client';

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

const prisma = new PrismaClient();

// Real YGOPRODeck card IDs mapped to correct images
const SEED_CARDS = [
  {
    ygoprodeckId: 89631139,
    name: 'Blue-Eyes White Dragon',
    namePt: 'Dragão Branco de Olhos Azuis',
    descEn: 'This legendary dragon is a powerful engine of destruction. Virtually invincible, very few have faced this awesome creature and lived to tell the tale.',
    descPt: 'Este lendário dragão é uma poderosa máquina de destruição. Virtualmente invencível, muito poucos enfrentaram esta incrível criatura e viveram para contar a história.',
    type: 'Normal Monster',
    race: 'Dragon',
    attribute: 'LIGHT',
    atk: 3000,
    def: 2500,
    level: 8,
    archetype: 'Blue-Eyes',
    rarity: 'Ultra Rare',
  },
  {
    ygoprodeckId: 46986414,
    name: 'Dark Magician',
    namePt: 'Mago Negro',
    descEn: 'The ultimate wizard in terms of attack and defense.',
    descPt: 'O mago supremo em termos de ataque e defesa.',
    type: 'Normal Monster',
    race: 'Spellcaster',
    attribute: 'DARK',
    atk: 2500,
    def: 2100,
    level: 7,
    archetype: 'Dark Magician',
    rarity: 'Ultra Rare',
  },
  {
    ygoprodeckId: 55144522,
    name: 'Pot of Greed',
    namePt: 'Pote da Ganância',
    descEn: 'Draw 2 cards.',
    descPt: 'Compre 2 cartas.',
    type: 'Spell Card',
    race: 'Normal',
    attribute: null,
    atk: null,
    def: null,
    level: null,
    archetype: null,
    rarity: 'Rare',
  },
  {
    ygoprodeckId: 33396948,
    name: 'Exodia the Forbidden One',
    namePt: 'Exodia, o Proibido',
    descEn: 'If you have "Right Leg of the Forbidden One", "Left Leg of the Forbidden One", "Right Arm of the Forbidden One" and "Left Arm of the Forbidden One" in addition to this card in your hand, you win the Duel.',
    descPt: 'Se você tiver "Perna Direita do Proibido", "Perna Esquerda do Proibido", "Braço Direito do Proibido" e "Braço Esquerdo do Proibido" além desta carta na sua mão, você vence o Duelo.',
    type: 'Effect Monster',
    race: 'Spellcaster',
    attribute: 'DARK',
    atk: 1000,
    def: 1000,
    level: 3,
    archetype: 'Forbidden One',
    rarity: 'Ultra Rare',
  },
  {
    ygoprodeckId: 38033121,
    name: 'Dark Magician Girl',
    namePt: 'Maga Negra',
    descEn: 'Gains 300 ATK for every "Dark Magician" or "Magician of Black Chaos" in either GY.',
    descPt: 'Ganha 300 de ATK para cada "Mago Negro" ou "Mago do Caos Negro" em qualquer Cemitério.',
    type: 'Effect Monster',
    race: 'Spellcaster',
    attribute: 'DARK',
    atk: 2000,
    def: 1700,
    level: 6,
    archetype: 'Dark Magician',
    rarity: 'Secret Rare',
  },
  {
    ygoprodeckId: 74677422,
    name: 'Red-Eyes Black Dragon',
    namePt: 'Dragão Negro de Olhos Vermelhos',
    descEn: 'A ferocious dragon with a deadly attack.',
    descPt: 'Um dragão feroz com um ataque mortal.',
    type: 'Normal Monster',
    race: 'Dragon',
    attribute: 'DARK',
    atk: 2400,
    def: 2000,
    level: 7,
    archetype: 'Red-Eyes',
    rarity: 'Ultra Rare',
  },
  {
    ygoprodeckId: 10000000,
    name: 'Obelisk the Tormentor',
    namePt: 'Obelisco, o Atormentador',
    descEn: 'Requires 3 Tributes to Normal Summon (cannot be Normal Set). This card\'s Normal Summon cannot be negated. When Normal Summoned, cards and effects cannot be activated. Cannot be targeted by Spells, Traps, or card effects. If this card was Special Summoned, send it to the GY during the End Phase. You can Tribute 2 monsters; destroy all monsters your opponent controls. This card cannot declare an attack the turn this effect is activated.',
    descPt: 'Requer 3 Tributos para ser Invocado por Invocação-Normal (não pode ser Colocado por Invocação-Normal). A Invocação-Normal desta carta não pode ser negada. Quando for Invocado por Invocação-Normal, cartas e efeitos não podem ser ativados.',
    type: 'Effect Monster',
    race: 'Divine-Beast',
    attribute: 'DIVINE',
    atk: 4000,
    def: 4000,
    level: 10,
    archetype: 'Egyptian God',
    rarity: 'Secret Rare',
  },
  {
    ygoprodeckId: 44508094,
    name: 'Stardust Dragon',
    namePt: 'Dragão de Poeira Estelar',
    descEn: '1 Tuner + 1+ non-Tuner monsters\nWhen a card or effect is activated that would destroy a card(s) on the field (Quick Effect): You can Tribute this card; negate the activation, and if you do, destroy it.',
    descPt: '1 Regulador + 1+ monstros não-Reguladores\nQuando uma carta ou efeito é ativado que destruiria carta(s) no campo (Efeito Rápido): você pode Tributar esta carta; negue a ativação e, se fizer isso, destrua-a.',
    type: 'Synchro Monster',
    race: 'Dragon',
    attribute: 'WIND',
    atk: 2500,
    def: 2000,
    level: 8,
    archetype: 'Stardust',
    rarity: 'Ultra Rare',
  },
];

async function main() {
  console.log('Seeding database...');

  for (const c of SEED_CARDS) {
    const slug = slugify(c.name);
    const imageId = String(c.ygoprodeckId);

    await prisma.card.upsert({
      where: { slug },
      update: {
        imageUrl: `https://images.ygoprodeck.com/images/cards/${imageId}.jpg`,
        imageSmallUrl: `https://images.ygoprodeck.com/images/cards_small/${imageId}.jpg`,
        descEn: c.descEn,
        descPt: c.descPt,
      },
      create: {
        ygoprodeckId: c.ygoprodeckId,
        slug,
        nameEn: c.name,
        namePt: c.namePt,
        descEn: c.descEn,
        descPt: c.descPt,
        type: c.type,
        race: c.race,
        attribute: c.attribute,
        atk: c.atk,
        def: c.def,
        level: c.level,
        archetype: c.archetype,
        rarity: c.rarity,
        imageUrl: `https://images.ygoprodeck.com/images/cards/${imageId}.jpg`,
        imageSmallUrl: `https://images.ygoprodeck.com/images/cards_small/${imageId}.jpg`,
      },
    });

    console.log(`  ✓ ${c.name}`);
  }

  // Add rulings for first card to showcase rulings section
  const bewd = await prisma.card.findUnique({ where: { slug: 'blue-eyes-white-dragon' } });
  if (bewd) {
    const rulingTexts = [
      {
        textEn: 'This is a Normal Monster and has no effect.',
        textPt: 'Este é um Monstro Normal e não possui efeito.',
      },
      {
        textEn: '"Blue-Eyes White Dragon" can be Special Summoned from the GY by "Monster Reborn".',
        textPt: '"Dragão Branco de Olhos Azuis" pode ser Invocado por Invocação-Especial do Cemitério por "Renascimento do Monstro".',
      },
      {
        textEn: 'This card is treated as a "Blue-Eyes" card.',
        textPt: 'Esta carta é tratada como uma carta "Olhos Azuis".',
      },
    ];

    for (let i = 0; i < rulingTexts.length; i++) {
      await prisma.ruling.upsert({
        where: { cardId_index: { cardId: bewd.id, index: i + 1 } },
        update: {},
        create: {
          cardId: bewd.id,
          index: i + 1,
          textEn: rulingTexts[i].textEn,
          textPt: rulingTexts[i].textPt,
        },
      });
    }
    console.log('  ✓ Rulings added');
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
