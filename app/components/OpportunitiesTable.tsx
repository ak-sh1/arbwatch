import { ArbitrageOpportunity } from '@/lib/types';

interface OpportunitiesTableProps {
  opportunities: ArbitrageOpportunity[];
}

export default function OpportunitiesTable({ opportunities }: OpportunitiesTableProps) {
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatBps = (bps: number) => {
    return `${bps.toFixed(2)} bps`;
  };

  const getEdgeColor = (netEdgeBps: number) => {
    if (netEdgeBps > 20) return 'text-green-400';
    if (netEdgeBps > 10) return 'text-yellow-400';
    if (netEdgeBps > 0) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Pair</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Buy @</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Sell @</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Gross Edge</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Fees</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Net Edge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {opportunities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No arbitrage opportunities detected
                </td>
              </tr>
            ) : (
              opportunities.map((opp, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-purple-300">
                    {opp.symbolPair}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div className="flex flex-col">
                      <span className="capitalize text-sm text-slate-400">{opp.buyVenue}</span>
                      <span className="font-mono">{formatPrice(opp.buyPrice)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div className="flex flex-col">
                      <span className="capitalize text-sm text-slate-400">{opp.sellVenue}</span>
                      <span className="font-mono">{formatPrice(opp.sellPrice)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {formatBps(opp.edgeBps)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-400">
                    {formatBps(opp.feesBps)}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${getEdgeColor(opp.netEdgeBps)}`}>
                    {formatBps(opp.netEdgeBps)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {opportunities.length > 0 && (
        <div className="px-4 py-3 bg-slate-700/30 text-xs text-slate-400">
          Net Edge = Gross Edge - Total Fees. Positive net edge indicates potential profit after fees.
        </div>
      )}
    </div>
  );
}
