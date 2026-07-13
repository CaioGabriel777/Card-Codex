import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { routing } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { SITE_URL } from '@/lib/site';

// Regenerated hourly instead of on every crawler hit — the catalog doesn't
// change often enough to justify a fresh DB scan per request.
export const revalidate = 3600;

const STATIC_ROUTES = ['/', '/showcase', '/collection', '/banlist', '/decks'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of STATIC_ROUTES) {
    const languages = Object.fromEntries(
      routing.locales.map((l) => [l, `${SITE_URL}${getPathname({ href: route, locale: l })}`])
    );
    for (const locale of routing.locales) {
      entries.push({
        url: `${SITE_URL}${getPathname({ href: route, locale })}`,
        changeFrequency: route === '/' ? 'daily' : 'weekly',
        priority: route === '/' ? 1 : 0.7,
        alternates: { languages },
      });
    }
  }

  const cards = await prisma.card.findMany({ select: { slug: true, updatedAt: true } });

  for (const card of cards) {
    const href = { pathname: '/card/[slug]' as const, params: { slug: card.slug } };
    const languages = Object.fromEntries(
      routing.locales.map((l) => [l, `${SITE_URL}${getPathname({ href, locale: l })}`])
    );
    for (const locale of routing.locales) {
      entries.push({
        url: `${SITE_URL}${getPathname({ href, locale })}`,
        lastModified: card.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages },
      });
    }
  }

  const decks = await prisma.animeDeck.findMany({ select: { slug: true, updatedAt: true } });

  for (const deck of decks) {
    const href = { pathname: '/decks/[slug]' as const, params: { slug: deck.slug } };
    const languages = Object.fromEntries(
      routing.locales.map((l) => [l, `${SITE_URL}${getPathname({ href, locale: l })}`])
    );
    for (const locale of routing.locales) {
      entries.push({
        url: `${SITE_URL}${getPathname({ href, locale })}`,
        lastModified: deck.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.5,
        alternates: { languages },
      });
    }
  }

  return entries;
}
