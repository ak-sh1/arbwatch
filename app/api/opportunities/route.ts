import { NextResponse } from 'next/server';
import { fetchAllQuotes } from '@/lib/venues';
import { getReplayQuotes } from '@/lib/replay';
import { findArbitrageOpportunities } from '@/lib/arbitrage';
import { DEFAULT_ALERT_CONFIG } from '@/lib/constants';
import { isDatabaseAvailable, saveOpportunity } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isReplayMode = !isDatabaseAvailable();
  const quotes = isReplayMode ? getReplayQuotes() : await fetchAllQuotes();

  const opportunities = findArbitrageOpportunities(quotes, DEFAULT_ALERT_CONFIG);

  if (!isReplayMode) {
    for (const opp of opportunities) {
      await saveOpportunity(opp);
    }
  }

  return NextResponse.json({
    opportunities,
    mode: isReplayMode ? 'replay' : 'live',
    timestamp: Date.now(),
  });
}
