import React from 'react';
import { Trade } from '../types/trade';
import { Award, TrendingUp, TrendingDown, Target } from 'lucide-react';

interface AssetPerformanceMatrixProps {
  trades: Trade[];
  onFilterBySymbol?: (symbol: string) => void;
}

interface AssetStat {
  symbol: string;
  category: string;
  tradesCount: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnL: number;
  buyTrades: number;
  buyWins: number;
  sellTrades: number;
  sellWins: number;
}

export const AssetPerformanceMatrix: React.FC<AssetPerformanceMatrixProps> = ({
  trades,
  onFilterBySymbol,
}) => {
  // Aggregate stats per symbol
  const statsMap: Record<string, AssetStat> = {};

  trades.forEach((t) => {
    if (!statsMap[t.symbol]) {
      statsMap[t.symbol] = {
        symbol: t.symbol,
        category: t.category,
        tradesCount: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalPnL: 0,
        buyTrades: 0,
        buyWins: 0,
        sellTrades: 0,
        sellWins: 0,
      };
    }

    const stat = statsMap[t.symbol];
    stat.tradesCount += 1;
    stat.totalPnL += t.pnl;
    if (t.outcome === 'Win') stat.wins += 1;
    if (t.outcome === 'Loss') stat.losses += 1;

    if (t.positionType === 'Buy') {
      stat.buyTrades += 1;
      if (t.outcome === 'Win') stat.buyWins += 1;
    } else {
      stat.sellTrades += 1;
      if (t.outcome === 'Win') stat.sellWins += 1;
    }
  });

  const assetStatsList = Object.values(statsMap).map((stat) => ({
    ...stat,
    winRate: stat.tradesCount > 0 ? (stat.wins / stat.tradesCount) * 100 : 0,
  }));

  // Sort descending by total PnL
  assetStatsList.sort((a, b) => b.totalPnL - a.totalPnL);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-rose-500" />
            Synthetic Asset Performance Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pinpoint which Deriv synthetic indices generate your highest edge and which leak capital.
          </p>
        </div>
      </div>

      {assetStatsList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No trade data available yet. Record your first trade to view synthetic performance breakdown!
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Synthetic Index</th>
                <th className="py-3.5 px-4 text-center">Trades</th>
                <th className="py-3.5 px-4 text-center">Win Rate</th>
                <th className="py-3.5 px-4 text-right">Net P&L ($)</th>
                <th className="py-3.5 px-4 text-center">Buy / Long Wins</th>
                <th className="py-3.5 px-4 text-center">Sell / Short Wins</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {assetStatsList.map((stat) => {
                const isNetPositive = stat.totalPnL >= 0;
                const buyWinRate =
                  stat.buyTrades > 0 ? ((stat.buyWins / stat.buyTrades) * 100).toFixed(0) : '-';
                const sellWinRate =
                  stat.sellTrades > 0 ? ((stat.sellWins / stat.sellTrades) * 100).toFixed(0) : '-';

                return (
                  <tr key={stat.symbol} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-white whitespace-nowrap">
                      {stat.symbol}
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums text-slate-300">
                      {stat.tradesCount}
                      <span className="text-[10px] text-slate-500 font-sans block">
                        ({stat.wins}W · {stat.losses}L)
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums font-bold">
                      <span
                        className={
                          stat.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {stat.winRate.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums font-bold text-sm">
                      <span
                        className={
                          isNetPositive ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {isNetPositive ? '+' : ''}${stat.totalPnL.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums text-slate-300">
                      {buyWinRate !== '-' ? `${buyWinRate}%` : '-'}
                      <span className="text-[10px] text-slate-500 font-sans block">
                        ({stat.buyWins}/{stat.buyTrades})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center tabular-nums text-slate-300">
                      {sellWinRate !== '-' ? `${sellWinRate}%` : '-'}
                      <span className="text-[10px] text-slate-500 font-sans block">
                        ({stat.sellWins}/{stat.sellTrades})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-sans">
                      {onFilterBySymbol && (
                        <button
                          type="button"
                          onClick={() => onFilterBySymbol(stat.symbol)}
                          className="px-2.5 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          View Journal
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
