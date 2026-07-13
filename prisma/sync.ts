/**
 * Full catalog sync — pulls the entire YGOPRODeck card database (EN, PT, JA)
 * and upserts it into Postgres. Run manually (`npm run db:sync`), not on a
 * request path: it's a handful of large bulk requests (~60MB total), not
 * something a visitor should ever trigger.
 *
 * Rulings and deck-usage data aren't available from this API and are left
 * untouched by this script — upserts here never write those relations, so
 * any hand-curated rulings (e.g. from prisma/seed.ts) survive re-syncs.
 */
import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/lib/slugify';
import { resolveRarity, type YGOCard } from '../src/lib/ygoprodeck';

const prisma = new PrismaClient();
const BASE_URL = 'https://db.ygoprodeck.com/api/v7';
const BATCH_SIZE = 200;

interface YGOCardWithMisc extends YGOCard {
  misc_info?: Array<{ tcg_date?: string; ocg_date?: string }>;
}

interface LocalizedCard {
  id: number;
  name: string;
  desc: string;
}

async function fetchBulk<T>(query: string): Promise<T[]> {
  const res = await fetch(`${BASE_URL}/cardinfo.php${query}`);
  if (!res.ok) {
    throw new Error(`YGOPRODeck request failed (${query}): ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { data?: T[] };
  return json.data ?? [];
}

function toMap(cards: LocalizedCard[]): Map<number, LocalizedCard> {
  return new Map(cards.map((c) => [c.id, c]));
}

/**
 * Assigns a unique slug to every card up front, sequentially, to avoid races
 * when upserting in parallel batches. `takenSlugs` seeds the collision set
 * with slugs already in the database (e.g. from prisma/seed.ts) — cards
 * that share a name with an existing row (YGOPRODeck has a handful of
 * same-named alternate-art entries under different ids) fall back to a
 * suffixed slug instead of colliding on create.
 */
function assignSlugs(cards: YGOCardWithMisc[], takenSlugs: Iterable<string>): Map<number, string> {
  const slugs = new Map<number, string>();
  const used = new Set<string>(takenSlugs);

  for (const card of cards) {
    let slug = slugify(card.name);
    if (used.has(slug)) slug = `${slug}-${card.id}`;
    used.add(slug);
    slugs.set(card.id, slug);
  }

  return slugs;
}

async function main() {
  const startedAt = Date.now();
  console.log('Fetching full card catalog from YGOPRODeck (EN + PT + JA)...');

  const [enCards, ptCards, jaCards, existingCards] = await Promise.all([
    fetchBulk<YGOCardWithMisc>('?misc=yes'),
    fetchBulk<LocalizedCard>('?language=pt'),
    fetchBulk<LocalizedCard>('?language=ja'),
    prisma.card.findMany({ select: { slug: true } }),
  ]);

  console.log(`  EN ${enCards.length} · PT ${ptCards.length} · JA ${jaCards.length} cards fetched`);

  const ptById = toMap(ptCards);
  const jaById = toMap(jaCards);
  const slugById = assignSlugs(
    enCards,
    existingCards.map((c) => c.slug)
  );

  const usable = enCards.filter((c) => c.card_images?.length);
  const skipped = enCards.length - usable.length;

  let processed = 0;

  const failures: Array<{ id: number; name: string; error: string }> = [];

  for (let i = 0; i < usable.length; i += BATCH_SIZE) {
    const batch = usable.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (card) => {
        const pt = ptById.get(card.id);
        const ja = jaById.get(card.id);
        const misc = card.misc_info?.[0];
        const releaseDate = misc?.tcg_date ?? misc?.ocg_date;
        const image = card.card_images[0];

        const data = {
          nameEn: card.name,
          namePt: pt?.name ?? null,
          nameJa: ja?.name ?? null,
          descEn: card.desc,
          descPt: pt?.desc ?? null,
          descJa: ja?.desc ?? null,
          type: card.type,
          frameType: card.frameType,
          race: card.race,
          attribute: card.attribute ?? null,
          atk: card.atk ?? null,
          def: card.def ?? null,
          level: card.level ?? null,
          archetype: card.archetype ?? null,
          rarity: resolveRarity(card),
          imageUrl: image.image_url,
          imageSmallUrl: image.image_url_small,
          cardSetCode: card.card_sets?.[0]?.set_code ?? null,
          releaseDate: releaseDate ? new Date(releaseDate) : null,
          banTcg: card.banlist_info?.ban_tcg ?? null,
          banOcg: card.banlist_info?.ban_ocg ?? null,
          lastSyncedAt: new Date(),
        };

        try {
          await prisma.card.upsert({
            where: { ygoprodeckId: card.id },
            update: data,
            create: { ygoprodeckId: card.id, slug: slugById.get(card.id)!, ...data },
          });
        } catch (e) {
          failures.push({ id: card.id, name: card.name, error: e instanceof Error ? e.message : String(e) });
        }
      })
    );

    processed += batch.length;
    const pct = ((processed / usable.length) * 100).toFixed(1);
    console.log(`  ...${processed}/${usable.length} (${pct}%)`);
  }

  if (failures.length) {
    console.log(`\n${failures.length} card(s) failed to sync:`);
    for (const f of failures.slice(0, 20)) {
      console.log(`  - [${f.id}] ${f.name}: ${f.error.split('\n')[0]}`);
    }
    if (failures.length > 20) console.log(`  ...and ${failures.length - 20} more`);
  }

  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  const succeeded = processed - failures.length;
  console.log(
    `Synced ${succeeded}/${processed} cards in ${seconds}s` +
      `${skipped ? ` (skipped ${skipped} without images)` : ''}` +
      `${failures.length ? ` (${failures.length} failed, see above)` : ''}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
