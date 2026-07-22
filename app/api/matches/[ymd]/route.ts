import { fetchMatches } from '@/lib/api';

export const runtime = 'edge';

export async function GET(_req: Request, { params }: { params: Promise<{ ymd: string }> }) {
  const { ymd } = await params;
  if (!/^\d{8}$/.test(ymd)) {
    return Response.json({ error: 'Invalid date format (expected YYYYMMDD)' }, { status: 400 });
  }
  const matches = await fetchMatches(ymd);
  return Response.json(matches, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  });
}
