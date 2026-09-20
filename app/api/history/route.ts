import { NextResponse } from 'next/server';
import { getRecentOpportunities, isDatabaseAvailable } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isReplayMode = !isDatabaseAvailable();

  if (isReplayMode) {
    return NextResponse.json({
      history: [],
      mode: 'replay',
      message: 'Historical data requires DATABASE_URL',
    });
  }

  const history = await getRecentOpportunities(100);

  return NextResponse.json({
    history,
    mode: 'live',
    timestamp: Date.now(),
  });
}
