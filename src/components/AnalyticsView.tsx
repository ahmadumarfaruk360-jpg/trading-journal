import React from 'react';
import { Trade } from '../types/trade';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Zap,
  Target,
  Brain,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { MonthlyPerformanceReport } from './MonthlyPerformanceReport';
import { StreakTrackerBanner } from './StreakTrackerBanner';

interface AnalyticsViewProps {
  trades: Trade[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
        No trades recorded yet. Start journaling your trades to unlock detailed synthetic analytics!
      </div>
    );
  }

  // Strategy Breakdown
  const strategyMap: Record<string, { count: number; wins: number; pnl: number }> = {};
  trades.forEach((t) => {
    if (!strategyMap[t.strategy]) {
      strategyMap[t.strategy] = { count: 0, wins: 0, pnl: 0 };
    }
    strategyMap[t.strategy].count += 1;
    strategyMap[t.strategy].pnl += t.pnl;
    if (t.outcome === 'Win') strategyMap[t.strategy].wins += 1;
  });

  const strategies = Object.entries(strategyMap)
    .map(([name, data]) => ({
      name,
      ...data,
      winRate: (data.wins / data.count) * 100,
    }))
    .sort((a, b) => b.pnl - a.pnl);

  // Emotion / Mindset Breakdown
  const emotionMap: Record<string, { count: number; wins: number; pnl: number }> = {};
  trades.forEach((t) => {
    const emotionKey = t.emotion || 'Neutral';
    if (!emotionMap[emotionKey]) {
      emotionMap[emotionKey] = { count: 0, wins: 0, pnl: 0 };
    }
    emotionMap[emotionKey].count += 1;
    emotionMap[emotionKey].pnl += t.pnl;
    if (t.outcome === 'Win') emotionMap[emotionKey].wins += 1;
  });

  const emotions = Object.entries(emotionMap)
    .map(([name, data]) => ({
      name,
      ...data,
      winRate: (data.wins / data.count) * 100,
    }))
    .sort((a, b) => b.pnl - a.pnl);

  // Best & Worst Trades
  const sortedByPnL = [...trades].sort((a, b) => b.pnl - a.pnl);
  const bestTrade = sortedByPnL[0];
  const worstTrade = sortedByPnL[sortedByPnL.length - 1];

  // Win Streak Calculation
  const chronological = [...trades].sort(
    (a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
  );

  let currentStreak = 0;
  let maxWinStreak = 0;
  let currentLossStreak = 0;
  let maxLossStreak = 0;

  chronological.forEach((t) => {
    if (t.outcome === 'Win') {
      currentStreak += 1;
      currentLossStreak = 0;
      if (currentStreak > maxWinStreak) maxWinStreak = currentStreak;
    } else if (t.outcome === 'Loss') {
      currentLossStreak += 1;
      currentStreak = 0;
      if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
    } else {
      currentStreak = 0;
      currentLossStreak = 0;
    }
  });

  // Determine current active streak status (from latest trade backwards)
  let activeStreakType: 'Win' | 'Loss' | 'Breakeven' = 'Breakeven';
  let activeStreakCount = 0;
  if (chronological.length > 0) {
    const lastTrade = chronological[chronological.length - 1];
    activeStreakType = lastTrade.outcome;
    for (let i = chronological.length - 1; i >= 0; i--) {
      if (chronological[i].outcome === activeStreakType) {
        activeStreakCount++;
      } else {
        break;
      }
    }
  }

  const tradesWithScreenshotsCount = trades.filter(
    (t) => Boolean(t.screenshotHtfUrl || t.screenshotBeforeUrl || t.screenshotAfterUrl || t.screenshotUrl)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Zap className="w-5 h-5 text-rose-500" />
          Trading Journey Analytics & Mindset Audit
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Uncover the setups, monthly consistency, and psychology patterns that drive your trading success in Deriv synthetics.
        </p>
      </div>

      {/* Key Milestones Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Best Trade */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Largest Win</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-emerald-400 tabular-nums">
              +${bestTrade.pnl.toFixed(2)}
            </div>
            <div className="text-xs text-slate-300 font-medium truncate mt-1">
              {bestTrade.symbol} · {bestTrade.strategy}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Lot: {bestTrade.lotSize} · {bestTrade.positionType}
          </div>
        </div>

        {/* Worst Trade */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Largest Drawdown</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-rose-400 tabular-nums">
              ${worstTrade.pnl.toFixed(2)}
            </div>
            <div className="text-xs text-slate-300 font-medium truncate mt-1">
              {worstTrade.symbol} · {worstTrade.strategy}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Lot: {worstTrade.lotSize} · {worstTrade.positionType}
          </div>
        </div>

        {/* Active Streak & Max Streak Record */}
        <div
          className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all ${
            activeStreakType === 'Win' && activeStreakCount > 0
              ? 'border-emerald-500/40 shadow-sm shadow-emerald-500/10'
              : activeStreakType === 'Loss' && activeStreakCount > 0
              ? 'border-rose-500/40 shadow-sm shadow-rose-500/10'
              : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
            <span className="text-slate-400 flex items-center gap-1.5">
              {activeStreakType === 'Win' && activeStreakCount > 0 ? (
                <Flame className="w-4 h-4 text-emerald-400" />
              ) : activeStreakType === 'Loss' && activeStreakCount > 0 ? (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              ) : (
                <TrendingUp className="w-4 h-4 text-sky-400" />
              )}
              <span>Active Streak</span>
            </span>

            <span
              className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                activeStreakType === 'Win' && activeStreakCount > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : activeStreakType === 'Loss' && activeStreakCount > 0
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {activeStreakType === 'Win'
                ? 'Winning'
                : activeStreakType === 'Loss'
                ? 'Losing'
                : 'Neutral'}
            </span>
          </div>

          <div className="my-2">
            <div
              className={`text-2xl font-extrabold font-mono tabular-nums ${
                activeStreakType === 'Win'
                  ? 'text-emerald-400'
                  : activeStreakType === 'Loss'
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              {activeStreakCount}{' '}
              <span className="text-xs font-normal font-sans text-slate-400">
                {activeStreakType === 'Win'
                  ? 'win streak active 🔥'
                  : activeStreakType === 'Loss'
                  ? 'loss streak active ❄️'
                  : 'trade streak'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Record: {maxWinStreak} wins in a row
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Max Drawdown Streak: {maxLossStreak}
          </div>
        </div>

        {/* Screenshot Coverage */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Journal Rigor</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
              {((tradesWithScreenshotsCount / trades.length) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Trades with verified chart
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {tradesWithScreenshotsCount} of {trades.length} trades documented
          </div>
        </div>
      </div>

      {/* Streak Tracker & Momentum Sequence */}
      <StreakTrackerBanner trades={trades} />

      {/* Monthly Performance Report Section */}
      <MonthlyPerformanceReport trades={trades} />

      {/* Two Column Strategy & Mindset Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-500" />
            Performance by Strategy Setup
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {strategies.map((strat) => (
              <div
                key={strat.name}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="font-sans pr-2">
                  <div className="font-semibold text-slate-200">{strat.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {strat.count} trade{strat.count > 1 ? 's' : ''} · Win Rate: {strat.winRate.toFixed(1)}%
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-bold tabular-nums ${
                      strat.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {strat.pnl >= 0 ? '+' : ''}${strat.pnl.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emotion / Mindset Audit */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Brain className="w-4 h-4 text-amber-500" />
            Mindset & Discipline Correlation
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {emotions.map((emo) => (
              <div
                key={emo.name}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="font-sans pr-2">
                  <div className="font-semibold text-slate-200">{emo.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {emo.count} trade{emo.count > 1 ? 's' : ''} · Win Rate: {emo.winRate.toFixed(1)}%
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-bold tabular-nums ${
                      emo.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {emo.pnl >= 0 ? '+' : ''}${emo.pnl.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
