import { NextResponse } from 'next/server';
import { fetchAllQuotes } from '@/lib/venues';
import { getReplayQuotes } from '@/lib/replay';
import { isDatabaseAvailable } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isReplayMode = !isDatabaseAvailable();

  const quotes = isReplayMode ? getReplayQuotes() : await fetchAllQuotes();

  return NextResponse.json({
    quotes,
    mode: isReplayMode ? 'replay' : 'live',
    timestamp: Date.now(),
  });
}
