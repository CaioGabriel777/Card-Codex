import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Lightweight card typeahead used by the header/hero search inputs.
 * Matches against the name in every locale so results show up regardless
 * of which language the user is typing in.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await prisma.card.findMany({
    where: {
      OR: [
        { nameEn: { contains: q, mode: 'insensitive' } },
        { namePt: { contains: q, mode: 'insensitive' } },
        { nameJa: { contains: q, mode: 'insensitive' } },
      ],
    },
    orderBy: { nameEn: 'asc' },
    take: 6,
    select: {
      slug: true,
      nameEn: true,
      namePt: true,
      nameJa: true,
      imageSmallUrl: true,
      type: true,
    },
  });

  return NextResponse.json({ results });
}
