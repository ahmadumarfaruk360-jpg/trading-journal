import React, { useState, useMemo } from 'react';
import { Trade } from '../types/trade';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Flame,
  Award,
  Layers,
} from 'lucide-react';

interface MonthlyPerformanceReportProps {
  trades: Trade[];
}

interface MonthlyData {
  key: string; // "2026-10"
  year: number;
  month: number;
  monthName: string;
  yearLabel: string;
  fullLabel: string;
  tradesCount: number;
  wins: number;
  losses: number;
  breakevens: number;
  totalPnL: number;
  grossProfit: number;
  grossLoss: number; // positive number representing loss magnitude
  profitFactor: number;
  winRate: number;
  avgTradePnL: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
  trades: Trade[];
}

export const MonthlyPerformanceReport: React.FC<MonthlyPerformanceReportProps> = ({ trades }) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedMonthKey, setExpandedMonthKey] = useState<string | null>(null);

  // Group trades by month
  const monthlyDataList = useMemo(() => {
    const map: Record<string, MonthlyData> = {};

    trades.forEach((t) => {
      const d = new Date(t.tradeDate);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-11
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleString('en-US', { month: 'long' });
      const fullLabel = `${monthName} ${year}`;
      const yearLabel = String(year);

      if (!map[key]) {
        map[key] = {
          key,
          year,
          month,
          monthName,
          yearLabel,
          fullLabel,
          tradesCount: 0,
          wins: 0,
          losses: 0,
          breakevens: 0,
          totalPnL: 0,
          grossProfit: 0,
          grossLoss: 0,
          profitFactor: 0,
          winRate: 0,
          avgTradePnL: 0,
          bestTrade: null,
          worstTrade: null,
          trades: [],
        };
      }

      const item = map[key];
      item.tradesCount += 1;
      item.totalPnL += t.pnl;
      item.trades.push(t);

      if (t.pnl > 0) {
        item.grossProfit += t.pnl;
        item.wins += 1;
      } else if (t.pnl < 0) {
        item.grossLoss += Math.abs(t.pnl);
        item.losses += 1;
      } else {
        item.breakevens += 1;
      }

      if (!item.bestTrade || t.pnl > item.bestTrade.pnl) {
        item.bestTrade = t;
      }
      if (!item.worstTrade || t.pnl < item.worstTrade.pnl) {
        item.worstTrade = t;
      }
    });

    // Compute derived rates
    const list = Object.values(map).map((item) => {
      item.winRate = item.tradesCount > 0 ? (item.wins / item.tradesCount) * 100 : 0;
      item.avgTradePnL = item.tradesCount > 0 ? item.totalPnL / item.tradesCount : 0;
      item.profitFactor =
        item.grossLoss > 0
          ? item.grossProfit / item.grossLoss
          : item.grossProfit > 0
          ? 99.9
          : 0;
      // Sort trades in month descending by date
      item.trades.sort(
        (a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
      );
      return item;
    });

    // Sort months chronologically
    list.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.key.localeCompare(a.key);
      }
      return a.key.localeCompare(b.key);
    });

    return list;
  }, [trades, sortOrder]);

  // Available distinct years for filter
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    trades.forEach((t) => {
      const y = new Date(t.tradeDate).getFullYear();
      if (!isNaN(y)) years.add(String(y));
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [trades]);

  // Filtered by year if selected
  const filteredMonths = useMemo(() => {
    if (selectedYear === 'all') return monthlyDataList;
    return monthlyDataList.filter((m) => m.yearLabel === selectedYear);
  }, [monthlyDataList, selectedYear]);

  // Overall Monthly Stats
  const totalMonthsCount = filteredMonths.length;
  const profitableMonths = filteredMonths.filter((m) => m.totalPnL > 0);
  const losingMonths = filteredMonths.filter((m) => m.totalPnL < 0);
  const monthlyWinRate = totalMonthsCount > 0 ? (profitableMonths.length / totalMonthsCount) * 100 : 0;
  
  const bestMonth = [...filteredMonths].sort((a, b) => b.totalPnL - a.totalPnL)[0];
  const worstMonth = [...filteredMonths].sort((a, b) => a.totalPnL - b.totalPnL)[0];
  const totalPeriodPnL = filteredMonths.reduce((acc, m) => acc + m.totalPnL, 0);
  const avgMonthlyPnL = totalMonthsCount > 0 ? totalPeriodPnL / totalMonthsCount : 0;

  // Max absolute monthly PnL for scaling relative visual bars
  const maxAbsPnL = Math.max(...filteredMonths.map((m) => Math.abs(m.totalPnL)), 1);

  if (trades.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Monthly Performance & Equity Progression
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated monthly profit/loss, consistency ratios, and win rates across calendar months.
          </p>
        </div>

        {/* Filter Controls: Year selector & Sort order */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {availableYears.length > 1 && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-medium focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Toggle chronological sort order"
          >
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Monthly Summary KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Profitable Months Ratio */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">
            Green Months
          </span>
          <div className="text-lg font-bold text-emerald-400 mt-1 tabular-nums flex items-baseline gap-1.5">
            <span>{profitableMonths.length} / {totalMonthsCount}</span>
            <span className="text-xs text-slate-400 font-normal">
              ({monthlyWinRate.toFixed(0)}%)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
            {losingMonths.length} drawdown month{losingMonths.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Best Month */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">
            Best Month
          </span>
          <div className="text-lg font-bold text-emerald-400 mt-1 tabular-nums truncate">
            {bestMonth ? (
              <>
                {bestMonth.totalPnL >= 0 ? '+' : ''}${bestMonth.totalPnL.toFixed(2)}
              </>
            ) : (
              '$0.00'
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-sans block mt-0.5 truncate">
            {bestMonth ? bestMonth.fullLabel : 'N/A'}
          </span>
        </div>

        {/* Avg Monthly PnL */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">
            Avg Monthly Return
          </span>
          <div
            className={`text-lg font-bold mt-1 tabular-nums ${
              avgMonthlyPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {avgMonthlyPnL >= 0 ? '+' : ''}${avgMonthlyPnL.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
            Across {totalMonthsCount} recorded month{totalMonthsCount === 1 ? '' : 's'}
          </span>
        </div>

        {/* Total Period Net PnL */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">
            Period Total Net
          </span>
          <div
            className={`text-lg font-bold mt-1 tabular-nums ${
              totalPeriodPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalPeriodPnL >= 0 ? '+' : ''}${totalPeriodPnL.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
            {trades.length} total trades executed
          </span>
        </div>
      </div>

      {/* Visual Relative Monthly Growth Bars */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Monthly PnL Spectrum</span>
          </span>
          <span className="text-[11px] font-mono lowercase font-normal text-slate-500">
            relative magnitude
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {filteredMonths.map((m) => {
            const isProfit = m.totalPnL >= 0;
            const barWidthPercent = Math.max(
              Math.min((Math.abs(m.totalPnL) / maxAbsPnL) * 100, 100),
              4
            );

            return (
              <div key={m.key} className="flex items-center gap-3 text-xs font-mono">
                {/* Month Name */}
                <div className="w-24 shrink-0 text-slate-300 font-sans font-medium truncate">
                  {m.monthName.slice(0, 3)} '{m.yearLabel.slice(2)}
                </div>

                {/* Progress bar container */}
                <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden flex items-center p-0.5 border border-slate-800">
                  <div
                    style={{ width: `${barWidthPercent}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      isProfit
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/30'
                        : 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-sm shadow-rose-500/30'
                    }`}
                  />
                </div>

                {/* Net P&L & Win Rate Label */}
                <div className="w-28 text-right shrink-0">
                  <span
                    className={`font-bold tabular-nums ${
                      isProfit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isProfit ? '+' : ''}${m.totalPnL.toFixed(2)}
                  </span>
                </div>

                <div className="w-16 text-right shrink-0 text-[11px] text-slate-400 font-sans">
                  {m.winRate.toFixed(0)}% win
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Month-by-Month Detailed Report Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider px-1">
          <span>Monthly Breakdown</span>
          <span>Click month to view trade logs</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {filteredMonths.map((m) => {
            const isProfit = m.totalPnL >= 0;
            const isExpanded = expandedMonthKey === m.key;

            return (
              <div
                key={m.key}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-indigo-500/40 bg-slate-950/90 shadow-xl'
                    : 'border-slate-800/80 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                {/* Month Card Header / Summary Row */}
                <div
                  onClick={() => setExpandedMonthKey(isExpanded ? null : m.key)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  {/* Left: Month Title & Trades summary */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isProfit
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {isProfit ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="font-sans font-bold text-sm text-white flex items-center gap-2">
                        <span>{m.fullLabel}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider ${
                            isProfit
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isProfit ? 'Profitable' : 'Drawdown'}
                        </span>
                      </div>
                      <div className="text-[11px] font-sans text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>
                          {m.tradesCount} trade{m.tradesCount === 1 ? '' : 's'}
                        </span>
                        <span>·</span>
                        <span className="text-emerald-400">{m.wins}W</span>
                        <span>·</span>
                        <span className="text-rose-400">{m.losses}L</span>
                        {m.breakevens > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-amber-400">{m.breakevens}BE</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle / Right: Win Rate, Profit Factor & Net PnL */}
                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    {/* Win Rate with Mini Visual Pill */}
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">
                        Win Rate
                      </div>
                      <div className="text-sm font-bold text-slate-200 mt-0.5 tabular-nums flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            m.winRate >= 50 ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span>{m.winRate.toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Profit Factor */}
                    <div className="text-left sm:text-right hidden md:block">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">
                        Profit Factor
                      </div>
                      <div className="text-sm font-bold text-sky-400 mt-0.5 tabular-nums">
                        {m.profitFactor >= 99 ? '∞' : m.profitFactor.toFixed(2)}
                      </div>
                    </div>

                    {/* Net P&L in USD */}
                    <div className="text-right pl-2 sm:pl-4 sm:border-l sm:border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">
                        Monthly Net PnL
                      </div>
                      <div
                        className={`text-base font-extrabold tabular-nums tracking-tight mt-0.5 ${
                          isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfit ? '+' : ''}${m.totalPnL.toFixed(2)}
                      </div>
                    </div>

                    {/* Expand icon */}
                    <div className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Month Deep Dive Drawer */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-slate-900/40 p-4 space-y-4 animate-in fade-in duration-150">
                    {/* Month Statistics Sub-bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-sans uppercase">
                          Gross Profits
                        </span>
                        <div className="font-bold text-emerald-400 mt-0.5 tabular-nums">
                          +${m.grossProfit.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-sans uppercase">
                          Gross Losses
                        </span>
                        <div className="font-bold text-rose-400 mt-0.5 tabular-nums">
                          -${m.grossLoss.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-sans uppercase">
                          Avg Trade PnL
                        </span>
                        <div
                          className={`font-bold mt-0.5 tabular-nums ${
                            m.avgTradePnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {m.avgTradePnL >= 0 ? '+' : ''}${m.avgTradePnL.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-500 font-sans uppercase">
                          Best Month Win
                        </span>
                        <div className="font-bold text-emerald-400 mt-0.5 tabular-nums truncate">
                          {m.bestTrade ? `+$${m.bestTrade.pnl.toFixed(2)} (${m.bestTrade.symbol})` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* List of trades for this month */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-sans font-semibold text-slate-400 block px-1">
                        Executed Trades in {m.fullLabel}:
                      </span>

                      <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                        {m.trades.map((t) => {
                          const tradeDateReadable = new Date(t.tradeDate).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                          );
                          const tProfit = t.pnl >= 0;

                          return (
                            <div
                              key={t.id}
                              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800/60 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    t.positionType === 'Buy'
                                      ? 'bg-emerald-500/10 text-emerald-400'
                                      : 'bg-rose-500/10 text-rose-400'
                                  }`}
                                >
                                  {t.positionType}
                                </span>
                                <div className="truncate font-sans font-medium text-slate-200">
                                  {t.symbol}
                                </div>
                                <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">
                                  · {tradeDateReadable}
                                </span>
                                <span className="text-[10px] text-slate-400 hidden md:inline truncate max-w-[140px]">
                                  [{t.strategy}]
                                </span>
                              </div>

                              <div className="text-right shrink-0">
                                <span
                                  className={`font-bold tabular-nums ${
                                    tProfit ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {tProfit ? '+' : ''}${t.pnl.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
