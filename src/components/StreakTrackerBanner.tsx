import React, { useState } from 'react';
import { Trade } from '../types/trade';
import {
  Flame,
  TrendingDown,
  TrendingUp,
  Award,
  ShieldAlert,
  Zap,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface StreakTrackerBannerProps {
  trades: Trade[];
}

export const StreakTrackerBanner: React.FC<StreakTrackerBannerProps> = ({ trades }) => {
  const [streakMode, setStreakMode] = useState<'trades' | 'days'>('trades');

  if (trades.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Streak Tracker: Neutral</div>
            <p className="text-xs text-slate-400 mt-0.5">
              Log your first trade to track active winning streaks, drawdown phases, and momentum.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
          <Flame className="w-3.5 h-3.5 text-slate-600" />
          <span>0 Active Streak</span>
        </div>
      </div>
    );
  }

  // Sort trades chronologically (oldest to newest)
  const chronological = [...trades].sort(
    (a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
  );

  // 1. TRADE-BY-TRADE STREAK CALCULATION
  let currentStreakType: 'Win' | 'Loss' | 'Breakeven' = 'Breakeven';
  let currentStreakCount = 0;
  let currentStreakPnL = 0;
  let currentStreakTrades: Trade[] = [];

  // Work backwards from latest trade
  if (chronological.length > 0) {
    const lastTrade = chronological[chronological.length - 1];
    currentStreakType = lastTrade.outcome;

    for (let i = chronological.length - 1; i >= 0; i--) {
      const t = chronological[i];
      if (t.outcome === currentStreakType) {
        currentStreakCount++;
        currentStreakPnL += t.pnl;
        currentStreakTrades.unshift(t);
      } else {
        break;
      }
    }
  }

  // All-time max trade streaks
  let maxTradeWinStreak = 0;
  let maxTradeLossStreak = 0;
  let tempWin = 0;
  let tempLoss = 0;

  chronological.forEach((t) => {
    if (t.outcome === 'Win') {
      tempWin++;
      tempLoss = 0;
      if (tempWin > maxTradeWinStreak) maxTradeWinStreak = tempWin;
    } else if (t.outcome === 'Loss') {
      tempLoss++;
      tempWin = 0;
      if (tempLoss > maxTradeLossStreak) maxTradeLossStreak = tempLoss;
    } else {
      tempWin = 0;
      tempLoss = 0;
    }
  });

  // 2. DAILY STREAK CALCULATION
  const dayMap: Record<string, { netPnL: number; dateStr: string; displayDate: string }> = {};
  chronological.forEach((t) => {
    const d = new Date(t.tradeDate);
    const key = !isNaN(d.getTime())
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      : t.tradeDate.split('T')[0];
    const displayDate = !isNaN(d.getTime())
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : key;

    if (!dayMap[key]) {
      dayMap[key] = { netPnL: 0, dateStr: key, displayDate };
    }
    dayMap[key].netPnL += t.pnl;
  });

  const dailyList = Object.values(dayMap)
    .map((day) => {
      const outcome: 'Win' | 'Loss' | 'Breakeven' =
        day.netPnL > 0.0001 ? 'Win' : day.netPnL < -0.0001 ? 'Loss' : 'Breakeven';
      return {
        ...day,
        outcome,
      };
    })
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  let currentDailyStreakType: 'Win' | 'Loss' | 'Breakeven' = 'Breakeven';
  let currentDailyStreakDays = 0;
  let currentDailyStreakPnL = 0;

  if (dailyList.length > 0) {
    const lastDay = dailyList[dailyList.length - 1];
    currentDailyStreakType = lastDay.outcome;

    for (let i = dailyList.length - 1; i >= 0; i--) {
      const d = dailyList[i];
      if (d.outcome === currentDailyStreakType) {
        currentDailyStreakDays++;
        currentDailyStreakPnL += d.netPnL;
      } else {
        break;
      }
    }
  }

  let maxDailyWinStreak = 0;
  let maxDailyLossStreak = 0;
  let tempDayWin = 0;
  let tempDayLoss = 0;

  dailyList.forEach((d) => {
    if (d.outcome === 'Win') {
      tempDayWin++;
      tempDayLoss = 0;
      if (tempDayWin > maxDailyWinStreak) maxDailyWinStreak = tempDayWin;
    } else if (d.outcome === 'Loss') {
      tempDayLoss++;
      tempDayWin = 0;
      if (tempDayLoss > maxDailyLossStreak) maxDailyLossStreak = tempDayLoss;
    } else {
      tempDayWin = 0;
      tempDayLoss = 0;
    }
  });

  // Effective Active Streak values based on mode
  const isActiveWinning =
    streakMode === 'trades'
      ? currentStreakType === 'Win' && currentStreakCount > 0
      : currentDailyStreakType === 'Win' && currentDailyStreakDays > 0;

  const isActiveLosing =
    streakMode === 'trades'
      ? currentStreakType === 'Loss' && currentStreakCount > 0
      : currentDailyStreakType === 'Loss' && currentDailyStreakDays > 0;

  const activeCount = streakMode === 'trades' ? currentStreakCount : currentDailyStreakDays;
  const activePnL = streakMode === 'trades' ? currentStreakPnL : currentDailyStreakPnL;
  const unitLabel = streakMode === 'trades' ? (activeCount === 1 ? 'trade' : 'trades') : (activeCount === 1 ? 'day' : 'days');

  // Recent 12 chronological trades for the momentum timeline
  const recentTrades = chronological.slice(-12);

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden p-5 sm:p-6 shadow-xl relative ${
        isActiveWinning
          ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 ring-1 ring-emerald-500/20'
          : isActiveLosing
          ? 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 ring-1 ring-rose-500/20'
          : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800'
      }`}
    >
      {/* Top Controls: Mode Switcher & Record Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Streak Tracker & Momentum
          </span>
          <span className="text-slate-600">·</span>
          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl bg-slate-950 p-0.5 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setStreakMode('trades')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                streakMode === 'trades'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Trade-by-Trade
            </button>
            <button
              type="button"
              onClick={() => setStreakMode('days')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                streakMode === 'days'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Consistency
            </button>
          </div>
        </div>

        {/* All-time record highlights */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <Award className="w-3.5 h-3.5" />
            <span>
              Best Win: {streakMode === 'trades' ? maxTradeWinStreak : maxDailyWinStreak} in a row
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>
              Max Loss: {streakMode === 'trades' ? maxTradeLossStreak : maxDailyLossStreak}
            </span>
          </span>
        </div>
      </div>

      {/* Main Strike Banner Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-4">
        {/* Left Column: Big Status Banner (Winning vs Losing vs Neutral) */}
        <div className="lg:col-span-7 space-y-3">
          {isActiveWinning ? (
            /* CURRENTLY WINNING */
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 mb-2">
                <Flame className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>You are in a WINNING STREAK!</span>
              </div>

              <div className="flex items-baseline gap-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                  <span className="font-mono text-emerald-400 text-3xl sm:text-4xl">
                    {activeCount}
                  </span>
                  <span>Consecutive Win{activeCount > 1 ? 's' : ''}</span>
                </h3>

                <span className="font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40 text-sm">
                  +${activePnL.toFixed(2)} accumulated
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-xl mt-1">
                You're in the green zone. Stay disciplined, respect your stop losses, and stick to your verified lot sizing—do not succumb to overconfidence or FOMO.
              </p>
            </div>
          ) : isActiveLosing ? (
            /* CURRENTLY LOSING */
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20 mb-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>You are in a LOSING STREAK</span>
              </div>

              <div className="flex items-baseline gap-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                  <span className="font-mono text-rose-400 text-3xl sm:text-4xl">
                    {activeCount}
                  </span>
                  <span>Consecutive Loss{activeCount > 1 ? 'es' : ''}</span>
                </h3>

                <span className="font-mono font-bold text-rose-300 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-500/40 text-sm">
                  -${Math.abs(activePnL).toFixed(2)} drawdown
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-xl mt-1">
                Take a deep breath and step back. Do not attempt revenge trading. Review your before-entry chart screenshots, confirm high-probability signals, and reduce your risk.
              </p>
            </div>
          ) : (
            /* NEUTRAL */
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Neutral Streak</span>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight">
                Reset & Ready for the Next Setup
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed max-w-xl mt-1">
                Your last trade resulted in Breakeven or a fresh start. Focus on execution quality and let your edge play out.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Visual Momentum Sequence Timeline */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-500" /> Recent Trade Sequence
            </span>
            <span className="text-[11px] font-mono text-slate-500">Last {recentTrades.length} trades</span>
          </div>

          {/* Beads Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {recentTrades.map((t, idx) => {
              const isWin = t.outcome === 'Win';
              const isLoss = t.outcome === 'Loss';
              const isInCurrentStreak =
                streakMode === 'trades' &&
                idx >= recentTrades.length - currentStreakCount &&
                t.outcome === currentStreakType;

              return (
                <div
                  key={t.id}
                  className={`group relative flex-1 min-w-[28px] h-9 rounded-lg flex flex-col items-center justify-center font-mono text-xs font-extrabold transition-all cursor-default select-none ${
                    isWin
                      ? isInCurrentStreak
                        ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/30 scale-105'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : isLoss
                      ? isInCurrentStreak
                        ? 'bg-rose-500 text-white ring-2 ring-rose-400 shadow-lg shadow-rose-500/30 scale-105'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                  title={`${t.symbol}: ${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)} (${new Date(
                    t.tradeDate
                  ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                >
                  <span>{isWin ? 'W' : isLoss ? 'L' : 'BE'}</span>
                </div>
              );
            })}
          </div>

          {/* Legend and Streak impact */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Win</span>
              <span className="w-2 h-2 rounded-full bg-rose-400 ml-1.5" />
              <span>Loss</span>
            </span>
            <span className="text-slate-300">
              {isActiveWinning
                ? `🔥 Streak Active: ${activeCount} ${unitLabel}`
                : isActiveLosing
                ? `❄️ Drawdown: ${activeCount} ${unitLabel}`
                : 'Balanced State'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
