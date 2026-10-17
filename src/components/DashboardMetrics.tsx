import React, { useState } from 'react';
import { Trade } from '../types/trade';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  BarChart3,
  Flame,
  Wallet,
  Edit3,
  Check,
  X,
  Zap,
  Award,
} from 'lucide-react';

interface DashboardMetricsProps {
  trades: Trade[];
  initialDeposit: number;
  onUpdateDeposit: (newDeposit: number) => void;
}

interface DayPerformance {
  dateStr: string;
  displayDate: string;
  netPnL: number;
  tradesCount: number;
  wins: number;
  losses: number;
  breakevens: number;
  outcome: 'Win' | 'Loss' | 'Breakeven';
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  trades,
  initialDeposit,
  onUpdateDeposit,
}) => {
  const [isEditingDeposit, setIsEditingDeposit] = useState(false);
  const [depositInput, setDepositInput] = useState(initialDeposit.toString());

  const totalTrades = trades.length;

  // Calculate metrics
  const wins = trades.filter((t) => t.outcome === 'Win');
  const losses = trades.filter((t) => t.outcome === 'Loss');
  const breakevens = trades.filter((t) => t.outcome === 'Breakeven');

  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);

  const currentBalance = initialDeposit + totalPnL;
  const returnPercentage = initialDeposit > 0 ? (totalPnL / initialDeposit) * 100 : 0;

  const grossWins = wins.reduce((acc, t) => acc + (t.pnl > 0 ? t.pnl : 0), 0);
  const grossLosses = Math.abs(losses.reduce((acc, t) => acc + (t.pnl < 0 ? t.pnl : 0), 0));

  const profitFactor =
    grossLosses > 0
      ? (grossWins / grossLosses).toFixed(2)
      : grossWins > 0
      ? '∞'
      : '0.00';

  const buyTrades = trades.filter((t) => t.positionType === 'Buy');
  const sellTrades = trades.filter((t) => t.positionType === 'Sell');
  const buyWinRate =
    buyTrades.length > 0
      ? (buyTrades.filter((t) => t.outcome === 'Win').length / buyTrades.length) * 100
      : 0;
  const sellWinRate =
    sellTrades.length > 0
      ? (sellTrades.filter((t) => t.outcome === 'Win').length / sellTrades.length) * 100
      : 0;

  // Best synthetic asset
  const assetPnLMap: Record<string, number> = {};
  trades.forEach((t) => {
    assetPnLMap[t.symbol] = (assetPnLMap[t.symbol] || 0) + t.pnl;
  });
  const sortedAssets = Object.entries(assetPnLMap).sort((a, b) => b[1] - a[1]);
  const bestAsset = sortedAssets[0] || ['No trades yet', 0];

  // Daily Trading Streak Calculation (tracks consecutive winning or losing days)
  const dayPerformanceMap: Record<string, DayPerformance> = {};
  trades.forEach((t) => {
    const d = new Date(t.tradeDate);
    const isValidDate = !isNaN(d.getTime());
    const dateKey = isValidDate
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      : (t.tradeDate.split('T')[0] || t.tradeDate);

    const displayDate = isValidDate
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : dateKey;

    if (!dayPerformanceMap[dateKey]) {
      dayPerformanceMap[dateKey] = {
        dateStr: dateKey,
        displayDate,
        netPnL: 0,
        tradesCount: 0,
        wins: 0,
        losses: 0,
        breakevens: 0,
        outcome: 'Breakeven',
      };
    }

    dayPerformanceMap[dateKey].netPnL += t.pnl;
    dayPerformanceMap[dateKey].tradesCount += 1;
    if (t.outcome === 'Win') dayPerformanceMap[dateKey].wins += 1;
    else if (t.outcome === 'Loss') dayPerformanceMap[dateKey].losses += 1;
    else dayPerformanceMap[dateKey].breakevens += 1;
  });

  // Classify each trading day's net outcome
  const tradingDays: DayPerformance[] = Object.values(dayPerformanceMap)
    .map((day) => {
      const outcome: 'Win' | 'Loss' | 'Breakeven' =
        day.netPnL > 0.0001 ? 'Win' : day.netPnL < -0.0001 ? 'Loss' : 'Breakeven';
      return {
        ...day,
        outcome,
      };
    })
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  // Determine current active streak (from latest active trading day backward)
  let currentStreakType: 'Win' | 'Loss' | 'Breakeven' | 'None' = 'None';
  let currentStreakDays = 0;

  if (tradingDays.length > 0) {
    const latestDay = tradingDays[tradingDays.length - 1];
    currentStreakType = latestDay.outcome;

    if (latestDay.outcome === 'Win') {
      for (let i = tradingDays.length - 1; i >= 0; i--) {
        if (tradingDays[i].outcome === 'Win') {
          currentStreakDays++;
        } else {
          break;
        }
      }
    } else if (latestDay.outcome === 'Loss') {
      for (let i = tradingDays.length - 1; i >= 0; i--) {
        if (tradingDays[i].outcome === 'Loss') {
          currentStreakDays++;
        } else {
          break;
        }
      }
    } else {
      currentStreakDays = 1;
    }
  }

  // Calculate historical max streaks for days
  let maxWinningDays = 0;
  let maxLosingDays = 0;
  let tempWin = 0;
  let tempLoss = 0;

  tradingDays.forEach((day) => {
    if (day.outcome === 'Win') {
      tempWin++;
      tempLoss = 0;
      if (tempWin > maxWinningDays) maxWinningDays = tempWin;
    } else if (day.outcome === 'Loss') {
      tempLoss++;
      tempWin = 0;
      if (tempLoss > maxLosingDays) maxLosingDays = tempLoss;
    } else {
      tempWin = 0;
      tempLoss = 0;
    }
  });

  // Recent 5 active trading days for visual indicator pills
  const recentDays = tradingDays.slice(-5);
  const emptyPillSlots = Math.max(0, 5 - recentDays.length);

  // Consecutive trade-by-trade streak
  const chronologicalTrades = [...trades].sort(
    (a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
  );

  let currentTradeStreakType: 'Win' | 'Loss' | 'Breakeven' = 'Breakeven';
  let currentTradeStreakCount = 0;

  if (chronologicalTrades.length > 0) {
    const lastTrade = chronologicalTrades[chronologicalTrades.length - 1];
    currentTradeStreakType = lastTrade.outcome;
    for (let i = chronologicalTrades.length - 1; i >= 0; i--) {
      if (chronologicalTrades[i].outcome === currentTradeStreakType) {
        currentTradeStreakCount++;
      } else {
        break;
      }
    }
  }

  let cumulative = initialDeposit;
  const equityPoints: number[] = [initialDeposit];
  chronologicalTrades.forEach((t) => {
    cumulative += t.pnl;
    equityPoints.push(cumulative);
  });

  const svgWidth = 320;
  const svgHeight = 65;
  const minVal = Math.min(...equityPoints, initialDeposit * 0.9);
  const maxVal = Math.max(...equityPoints, initialDeposit * 1.1);
  const range = maxVal - minVal || 1;

  const pointsString = equityPoints
    .map((val, idx) => {
      const x = (idx / (equityPoints.length - 1 || 1)) * (svgWidth - 16) + 8;
      const y = svgHeight - 12 - ((val - minVal) / range) * (svgHeight - 24);
      return `${x},${y}`;
    })
    .join(' ');

  const isNetPositive = totalPnL >= 0;

  const handleSaveDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(depositInput);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateDeposit(parsed);
      setIsEditingDeposit(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* Metric 1: Current Account Balance & Initial Deposit */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-rose-400" /> Account Balance
          </span>
          <button
            type="button"
            onClick={() => {
              setDepositInput(initialDeposit.toString());
              setIsEditingDeposit(!isEditingDeposit);
            }}
            className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 p-1 hover:bg-slate-800 rounded transition-colors"
            title="Edit starting deposit"
          >
            <Edit3 className="w-3 h-3" />
            <span>Deposit</span>
          </button>
        </div>

        <div className="my-2">
          {isEditingDeposit ? (
            <form onSubmit={handleSaveDeposit} className="flex items-center gap-1.5 mt-1">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-400">$</span>
                <input
                  type="number"
                  step="any"
                  value={depositInput}
                  onChange={(e) => setDepositInput(e.target.value)}
                  className="w-full bg-slate-950 border border-rose-500 rounded-lg pl-6 pr-2 py-1.5 text-sm font-mono text-white focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors"
                title="Save"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingDeposit(false)}
                className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight tabular-nums text-white">
                ${currentBalance.toFixed(2)}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <span>Start: ${initialDeposit.toFixed(2)}</span>
                <span>·</span>
                <span
                  className={`font-mono font-semibold ${
                    returnPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {returnPercentage >= 0 ? '+' : ''}
                  {returnPercentage.toFixed(2)}%
                </span>
              </div>
            </>
          )}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-2">
          <span>Net Return</span>
          <span
            className={`font-mono font-bold ${
              isNetPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isNetPositive ? '+' : ''}${totalPnL.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Metric 2: Trading Streak (Tracks consecutive winning or losing days) */}
      <div
        className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all ${
          currentStreakType === 'Win' && currentStreakDays > 0
            ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5'
            : currentStreakType === 'Loss' && currentStreakDays > 0
            ? 'border-rose-500/40 shadow-lg shadow-rose-500/5'
            : 'border-slate-800/80'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            {currentStreakType === 'Win' && currentStreakDays > 0 ? (
              <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : currentStreakType === 'Loss' && currentStreakDays > 0 ? (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            )}
            Trading Streak
          </span>

          {/* Status Pill Badge */}
          {currentTradeStreakType === 'Win' && currentTradeStreakCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 text-emerald-400" />
              <span>Winning Streak 🔥</span>
            </span>
          ) : currentTradeStreakType === 'Loss' && currentTradeStreakCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wide uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
              <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
              <span>Losing Streak ⚠️</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/60">
              Neutral
            </span>
          )}
        </div>

        <div className="my-2">
          {totalTrades === 0 ? (
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-500 tracking-tight">
                0 Trades
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Log trades to track active streak
              </div>
            </div>
          ) : (
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight tabular-nums flex items-baseline gap-2">
                <span
                  className={
                    currentTradeStreakType === 'Win'
                      ? 'text-emerald-400'
                      : currentTradeStreakType === 'Loss'
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }
                >
                  {currentTradeStreakCount}{' '}
                  <span className="text-xs font-semibold font-sans">
                    {currentTradeStreakCount === 1 ? 'Trade' : 'Trades'}
                  </span>
                </span>
                <span
                  className={`text-xs font-medium font-sans ${
                    currentTradeStreakType === 'Win'
                      ? 'text-emerald-400/90'
                      : currentTradeStreakType === 'Loss'
                      ? 'text-rose-400/90'
                      : 'text-slate-400'
                  }`}
                >
                  {currentTradeStreakType === 'Win'
                    ? 'Win Streak'
                    : currentTradeStreakType === 'Loss'
                    ? 'Loss Streak'
                    : 'Breakeven'}
                </span>
              </div>

              {/* Consecutive Days Visual Indicator Strip */}
              <div className="mt-2.5 flex items-center gap-1.5">
                {recentDays.map((day, idx) => {
                  const isCurrentStreakDay =
                    currentStreakType !== 'Breakeven' &&
                    currentStreakType !== 'None' &&
                    idx >= recentDays.length - currentStreakDays &&
                    day.outcome === currentStreakType;

                  return (
                    <div
                      key={day.dateStr}
                      className={`group relative flex-1 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold transition-all cursor-default ${
                        day.outcome === 'Win'
                          ? isCurrentStreakDay
                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/60 shadow-sm shadow-emerald-500/20'
                            : 'bg-emerald-950/60 text-emerald-400/80 border border-emerald-500/30'
                          : day.outcome === 'Loss'
                          ? isCurrentStreakDay
                            ? 'bg-rose-500/25 text-rose-300 border border-rose-400/60 shadow-sm shadow-rose-500/20'
                            : 'bg-rose-950/60 text-rose-400/80 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                      title={`${day.displayDate}: ${day.netPnL >= 0 ? '+' : ''}$${day.netPnL.toFixed(
                        2
                      )} (${day.tradesCount} trade${day.tradesCount > 1 ? 's' : ''})`}
                    >
                      <span>
                        {day.outcome === 'Win'
                          ? 'W'
                          : day.outcome === 'Loss'
                          ? 'L'
                          : 'BE'}
                      </span>
                    </div>
                  );
                })}

                {/* Empty slots placeholders if trader has traded fewer than 5 active days */}
                {Array.from({ length: emptyPillSlots }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex-1 h-6 rounded-md border border-dashed border-slate-800/80 bg-slate-950/40 flex items-center justify-center text-[9px] font-mono text-slate-600"
                    title="Future trading session"
                  >
                    ·
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-2 font-mono">
          <span className="flex items-center gap-1 text-slate-400">
            <Award className="w-3 h-3 text-amber-400" />
            <span>Best: {maxWinningDays}d Win</span>
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">
            Max Loss: {maxLosingDays}d
          </span>
        </div>
      </div>

      {/* Metric 3: Win Rate & Outcome Breakdown */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Win Rate
          </span>
          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Target className="w-4 h-4" />
          </span>
        </div>

        <div className="my-2">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight tabular-nums flex items-baseline gap-2">
            <span>{totalTrades > 0 ? `${winRate.toFixed(1)}%` : '0.0%'}</span>
            <span className="text-xs text-slate-400 font-normal font-sans">
              ({wins.length}/{totalTrades} trades)
            </span>
          </div>

          {/* Outcome Bar */}
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex mt-2.5">
            {totalTrades === 0 ? (
              <div className="bg-slate-800 h-full w-full" />
            ) : (
              <>
                <div
                  style={{ width: `${(wins.length / totalTrades) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title={`Wins: ${wins.length}`}
                />
                <div
                  style={{ width: `${(breakevens.length / totalTrades) * 100}%` }}
                  className="bg-amber-500 h-full"
                  title={`Breakeven: ${breakevens.length}`}
                />
                <div
                  style={{ width: `${(losses.length / totalTrades) * 100}%` }}
                  className="bg-rose-500 h-full"
                  title={`Losses: ${losses.length}`}
                />
              </>
            )}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-2">
          <span className="text-emerald-400 font-mono">{wins.length} W</span>
          <span className="text-slate-400">·</span>
          <span className="text-rose-400 font-mono">{losses.length} L</span>
          <span className="text-slate-400">·</span>
          <span className="text-amber-400 font-mono">{breakevens.length} BE</span>
        </div>
      </div>

      {/* Metric 3: Directional Bias & Profit Factor */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Directional Performance
          </span>
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Activity className="w-4 h-4" />
          </span>
        </div>

        <div className="my-2 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Long (Buy):
            </span>
            <span className="font-mono font-bold text-slate-100 tabular-nums">
              {buyTrades.length > 0 ? `${buyWinRate.toFixed(1)}%` : '--'}
              <span className="text-slate-500 font-normal ml-1">({buyTrades.length})</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Short (Sell):
            </span>
            <span className="font-mono font-bold text-slate-100 tabular-nums">
              {sellTrades.length > 0 ? `${sellWinRate.toFixed(1)}%` : '--'}
              <span className="text-slate-500 font-normal ml-1">({sellTrades.length})</span>
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-2">
          <span>Profit Factor</span>
          <span className="font-mono font-bold text-slate-200">{profitFactor}</span>
        </div>
      </div>

      {/* Metric 4: Equity Curve */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-slate-400" /> Equity Progression
          </span>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Flame className="w-3 h-3 text-rose-400" />
            <span className="truncate max-w-[110px]">
              {totalTrades > 0 ? bestAsset[0].replace(' Index', '') : 'Fresh Start'}
            </span>
          </div>
        </div>

        {/* SVG Sparkline */}
        <div className="my-1 w-full h-[54px] flex items-center justify-center">
          {totalTrades > 0 ? (
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke={isNetPositive ? '#10b981' : '#f43f5e'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />
            </svg>
          ) : (
            <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
              <span>Flat Baseline · $100.00</span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-2">
          <span>Current Equity</span>
          <span
            className={`font-mono font-bold ${
              currentBalance >= initialDeposit ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            ${currentBalance.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
