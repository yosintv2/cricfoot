import { scheduleDays } from '@/lib/utils';

export const runtime = 'edge';

export async function GET() {
  const days = scheduleDays();
  return Response.json(days, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  });
}
