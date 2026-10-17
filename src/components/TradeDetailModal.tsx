import React, { useState } from 'react';
import { Trade } from '../types/trade';
import {
  X,
  TrendingUp,
  TrendingDown,
  Clock,
  Tag,
  Smile,
  Edit2,
  Trash2,
  Download,
  Maximize2,
  Columns,
  Layers,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';

interface TradeDetailModalProps {
  trade: Trade | null;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onOpenLightbox: (
    url: string,
    name?: string,
    htfUrl?: string,
    htfName?: string,
    beforeUrl?: string,
    beforeName?: string,
    afterUrl?: string,
    afterName?: string,
    initialView?: 'htf' | 'before' | 'after' | 'split'
  ) => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  onClose,
  onEdit,
  onDelete,
  onOpenLightbox,
}) => {
  const [viewMode, setViewMode] = useState<'all' | 'htf' | 'before' | 'after'>('all');

  if (!trade) return null;

  const isProfit = trade.pnl >= 0;
  const formattedDate = new Date(trade.tradeDate).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const pointsDiff =
    trade.positionType === 'Buy'
      ? trade.exitPrice - trade.entryPrice
      : trade.entryPrice - trade.exitPrice;

  // Resolve Multi-Timeframe Screenshots
  const htfUrl = trade.screenshotHtfUrl;
  const htfName = trade.screenshotHtfName || `${trade.symbol}_HTF_chart.png`;

  const beforeUrl =
    trade.screenshotBeforeUrl ||
    (!trade.screenshotHtfUrl && !trade.screenshotAfterUrl ? trade.screenshotUrl : undefined);
  const beforeName = trade.screenshotBeforeName || trade.screenshotName || `${trade.symbol}_LTF_entry.png`;

  const afterUrl = trade.screenshotAfterUrl;
  const afterName = trade.screenshotAfterName || `${trade.symbol}_outcome_exit.png`;

  const hasHtf = Boolean(htfUrl);
  const hasBefore = Boolean(beforeUrl);
  const hasAfter = Boolean(afterUrl);

  const availableScreenshotsCount = (hasHtf ? 1 : 0) + (hasBefore ? 1 : 0) + (hasAfter ? 1 : 0);
  const hasMultiple = availableScreenshotsCount > 1;

  const handleOpenComparison = (initialTab: 'htf' | 'before' | 'after' | 'split') => {
    const defaultUrl =
      initialTab === 'htf' && htfUrl
        ? htfUrl
        : initialTab === 'after' && afterUrl
        ? afterUrl
        : beforeUrl || htfUrl || afterUrl || '';
    const defaultName =
      initialTab === 'htf'
        ? htfName
        : initialTab === 'after'
        ? afterName
        : beforeName;

    onOpenLightbox(
      defaultUrl,
      defaultName,
      htfUrl,
      htfName,
      beforeUrl,
      beforeName,
      afterUrl,
      afterName,
      initialTab
    );
  };

  const ltfLabel = trade.lowerTimeframe || trade.timeframe;
  const htfLabel = trade.higherTimeframe;
  const htfTrend = trade.htfTrend;

  const isAligned =
    htfTrend &&
    ((htfTrend === 'Bullish' && trade.positionType === 'Buy') ||
      (htfTrend === 'Bearish' && trade.positionType === 'Sell'));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl my-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`p-2 rounded-xl flex items-center gap-1 font-bold text-xs ${
                trade.positionType === 'Buy'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {trade.positionType === 'Buy' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {trade.positionType.toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {trade.symbol}
                </h2>
                {/* Timeframe Tag */}
                <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {htfLabel ? `${htfLabel} ➔ ${ltfLabel}` : ltfLabel}
                </span>

                {availableScreenshotsCount > 1 && (
                  <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold">
                    {availableScreenshotsCount} Charts Attached
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {formattedDate}
                </span>
                <span>·</span>
                <span>Strategy: {trade.strategy}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(trade);
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Edit trade"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(trade.id);
              }}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Delete trade"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* MULTI-TIMEFRAME ANALYSIS STRIP */}
          {htfLabel && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans uppercase">
                    Multi-Timeframe Structure
                  </div>
                  <div className="text-white font-bold flex items-center gap-2 mt-0.5 font-sans">
                    <span>Higher: <span className="font-mono text-amber-400">{htfLabel}</span></span>
                    {htfTrend && (
                      <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {htfTrend}
                      </span>
                    )}
                    <span>➔ Lower Execution: <span className="font-mono text-sky-400">{ltfLabel}</span></span>
                  </div>
                </div>
              </div>

              {htfTrend && (
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-bold font-sans border ${
                    isAligned
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : htfTrend === 'Ranging'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {isAligned ? '✓ Trend Aligned' : htfTrend === 'Ranging' ? '⚡ Range Execution' : '⚠ Counter-Trend'}
                </div>
              )}
            </div>
          )}

          {/* SECTION: SCREENSHOTS (HTF, BEFORE/LTF, AFTER/OUTCOME) */}
          {availableScreenshotsCount > 0 ? (
            <div className="space-y-3">
              {/* Controls when multiple exist */}
              {hasMultiple && (
                <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewMode('all')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                        viewMode === 'all'
                          ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>All Charts Side-by-Side</span>
                    </button>

                    {hasHtf && (
                      <button
                        type="button"
                        onClick={() => setViewMode('htf')}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                          viewMode === 'htf'
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>HTF ({htfLabel || 'Chart'})</span>
                      </button>
                    )}

                    {hasBefore && (
                      <button
                        type="button"
                        onClick={() => setViewMode('before')}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                          viewMode === 'before'
                            ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        <span>LTF Entry</span>
                      </button>
                    )}

                    {hasAfter && (
                      <button
                        type="button"
                        onClick={() => setViewMode('after')}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                          viewMode === 'after'
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Outcome Exit</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenComparison('split')}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Fullscreen Comparison</span>
                  </button>
                </div>
              )}

              {/* Grid of Screenshots */}
              <div
                className={`grid gap-4 ${
                  viewMode === 'all' && availableScreenshotsCount >= 3
                    ? 'grid-cols-1 md:grid-cols-3'
                    : viewMode === 'all' && availableScreenshotsCount === 2
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1'
                }`}
              >
                {/* 1. HIGHER TIMEFRAME SCREENSHOT CARD */}
                {hasHtf && (viewMode === 'all' || viewMode === 'htf') && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col group">
                    <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between text-xs font-semibold">
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        HIGHER TIMEFRAME ({htfLabel || 'HTF'})
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-[160px]">
                        {htfName}
                      </span>
                    </div>

                    <div className="relative p-2 flex items-center justify-center bg-slate-950 min-h-[240px] max-h-[360px]">
                      <img
                        src={htfUrl}
                        alt={`${trade.symbol} HTF Chart Screenshot`}
                        referrerPolicy="no-referrer"
                        className="w-full max-h-[340px] object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenComparison('htf')}
                          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-amber-400" /> Fullscreen
                        </button>
                        <a
                          href={htfUrl}
                          download={htfName}
                          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-300" /> Download
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. LOWER TIMEFRAME ENTRY (BEFORE) SCREENSHOT CARD */}
                {hasBefore && (viewMode === 'all' || viewMode === 'before') && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col group">
                    <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between text-xs font-semibold">
                      <span className="text-sky-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        LOWER TIMEFRAME ENTRY ({ltfLabel})
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-[160px]">
                        {beforeName}
                      </span>
                    </div>

                    <div className="relative p-2 flex items-center justify-center bg-slate-950 min-h-[240px] max-h-[360px]">
                      <img
                        src={beforeUrl}
                        alt={`${trade.symbol} LTF Entry Screenshot`}
                        referrerPolicy="no-referrer"
                        className="w-full max-h-[340px] object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenComparison('before')}
                          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-sky-400" /> Fullscreen
                        </button>
                        <a
                          href={beforeUrl}
                          download={beforeName}
                          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-300" /> Download
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. OUTCOME (AFTER) SCREENSHOT CARD */}
                {hasAfter && (viewMode === 'all' || viewMode === 'after') && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col group">
                    <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between text-xs font-semibold">
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        OUTCOME (EXIT / RESULT)
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-[160px]">
                        {afterName}
                      </span>
                    </div>

                    <div className="relative p-2 flex items-center justify-center bg-slate-950 min-h-[240px] max-h-[360px]">
                      <img
                        src={afterUrl}
                        alt={`${trade.symbol} Outcome Screenshot`}
                        referrerPolicy="no-referrer"
                        className="w-full max-h-[340px] object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenComparison('after')}
                          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-emerald-400" /> Fullscreen
                        </button>
                        <a
                          href={afterUrl}
                          download={afterName}
                          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-300" /> Download
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 border border-slate-800/80 rounded-2xl bg-slate-950/60 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-1.5">
              <ImageIcon className="w-8 h-8 opacity-40 text-slate-600" />
              <span>No screenshots attached to this trade entry.</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(trade);
                }}
                className="mt-2 text-rose-400 hover:text-rose-300 text-xs font-medium cursor-pointer"
              >
                + Add HTF / LTF / Outcome Screenshots
              </button>
            </div>
          )}

          {/* Execution Financial Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">
                Net P&L ($)
              </span>
              <div
                className={`text-xl font-bold mt-1 tabular-nums ${
                  isProfit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">
                Points Difference
              </span>
              <div
                className={`text-xl font-bold mt-1 tabular-nums ${
                  pointsDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {pointsDiff >= 0 ? '+' : ''}{pointsDiff.toFixed(2)} pts
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">
                Lot Size
              </span>
              <div className="text-xl font-bold mt-1 text-slate-200 tabular-nums">
                {trade.lotSize}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">
                Risk / Reward
              </span>
              <div className="text-xl font-bold mt-1 text-sky-400 tabular-nums">
                {trade.riskRewardRatio ? `1 : ${trade.riskRewardRatio}` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Detailed Price Levels */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block font-sans text-[11px]">Entry Price</span>
              <span className="text-white font-semibold tabular-nums text-sm">
                {trade.entryPrice.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-sans text-[11px]">Exit Price</span>
              <span className="text-white font-semibold tabular-nums text-sm">
                {trade.exitPrice.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-sans text-[11px]">Stop Loss</span>
              <span className="text-slate-300 font-semibold tabular-nums text-sm">
                {trade.stopLoss ? trade.stopLoss.toLocaleString() : 'Not Set'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-sans text-[11px]">Take Profit</span>
              <span className="text-slate-300 font-semibold tabular-nums text-sm">
                {trade.takeProfit ? trade.takeProfit.toLocaleString() : 'Not Set'}
              </span>
            </div>
          </div>

          {/* Strategy, Emotion & Notes */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Tag className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-slate-400 font-medium">Strategy:</span>
                <span className="text-white font-semibold">{trade.strategy}</span>
              </div>

              {trade.emotion && (
                <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400 font-medium">Mindset:</span>
                  <span className="text-white font-semibold">{trade.emotion}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-400 font-medium font-sans">Outcome:</span>
                <span
                  className={
                    trade.outcome === 'Win'
                      ? 'text-emerald-400 font-bold'
                      : trade.outcome === 'Loss'
                      ? 'text-rose-400 font-bold'
                      : 'text-amber-400 font-bold'
                  }
                >
                  {trade.outcome.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Trade Review Notes */}
            {trade.notes && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Multi-Timeframe Reflection & Notes
                </span>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {trade.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
