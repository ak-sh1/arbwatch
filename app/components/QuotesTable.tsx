import { Quote } from '@/lib/types';

interface QuotesTableProps {
  quotes: Quote[];
}

export default function QuotesTable({ quotes }: QuotesTableProps) {
  const formatPrice = (price: number, symbol: string) => {
    const decimals = symbol === 'BTC' ? 0 : symbol === 'ETH' ? 2 : symbol === 'SOL' ? 2 : 3;
    return `$${price.toFixed(decimals)}`;
  };

  const formatAge = (age: number) => {
    return age < 1000 ? `${age}ms` : `${(age / 1000).toFixed(1)}s`;
  };

  const getAgeColor = (age: number) => {
    if (age < 2000) return 'text-green-400';
    if (age < 5000) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Symbol</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Venue</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Bid</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Ask</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Mid</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No quotes available
                </td>
              </tr>
            ) : (
              quotes.map((quote, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-blue-300">
                    {quote.symbol}
                  </td>
                  <td className="px-4 py-3 text-slate-300 capitalize">
                    {quote.venue}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {formatPrice(quote.bid, quote.symbol)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {formatPrice(quote.ask, quote.symbol)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatPrice(quote.mid, quote.symbol)}
                  </td>
                  <td className={`px-4 py-3 text-right text-sm ${getAgeColor(quote.age)}`}>
                    {formatAge(quote.age)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
