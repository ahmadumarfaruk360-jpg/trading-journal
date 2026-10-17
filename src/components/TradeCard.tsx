import React, { useState } from 'react';
import { Trade } from '../types/trade';
import {
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Maximize2,
  Layers,
} from 'lucide-react';

interface TradeCardProps {
  trade: Trade;
  onViewDetails: (trade: Trade) => void;
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

export const TradeCard: React.FC<TradeCardProps> = ({
  trade,
  onViewDetails,
  onEdit,
  onDelete,
  onOpenLightbox,
}) => {
  const isProfit = trade.pnl >= 0;

  // Resolve Multi-Timeframe screenshots
  const htfUrl = trade.screenshotHtfUrl;
  const htfName = trade.screenshotHtfName || `${trade.symbol} HTF Chart`;

  const beforeUrl =
    trade.screenshotBeforeUrl ||
    (!trade.screenshotHtfUrl && !trade.screenshotAfterUrl ? trade.screenshotUrl : undefined);
  const beforeName = trade.screenshotBeforeName || trade.screenshotName || `${trade.symbol} LTF Entry`;

  const afterUrl = trade.screenshotAfterUrl;
  const afterName = trade.screenshotAfterName || `${trade.symbol} Outcome Exit`;

  const hasHtf = Boolean(htfUrl);
  const hasBefore = Boolean(beforeUrl);
  const hasAfter = Boolean(afterUrl);

  const availableCount = (hasHtf ? 1 : 0) + (hasBefore ? 1 : 0) + (hasAfter ? 1 : 0);

  // Active view tab on card
  const [activeImageTab, setActiveImageTab] = useState<'htf' | 'before' | 'after'>(() => {
    if (hasBefore) return 'before';
    if (hasHtf) return 'htf';
    if (hasAfter) return 'after';
    return 'before';
  });

  const currentDisplayUrl =
    activeImageTab === 'htf' && hasHtf
      ? htfUrl
      : activeImageTab === 'after' && hasAfter
      ? afterUrl
      : beforeUrl || htfUrl || afterUrl;

  const currentDisplayName =
    activeImageTab === 'htf' && hasHtf
      ? htfName
      : activeImageTab === 'after' && hasAfter
      ? afterName
      : beforeName;

  // Format date readable
  const dateObj = new Date(trade.tradeDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCardImageClick = () => {
    if (!currentDisplayUrl) {
      onViewDetails(trade);
      return;
    }
    onOpenLightbox(
      currentDisplayUrl,
      currentDisplayName,
      htfUrl,
      htfName,
      beforeUrl,
      beforeName,
      afterUrl,
      afterName,
      availableCount > 1 ? activeImageTab : undefined
    );
  };

  const ltfTimeframe = trade.lowerTimeframe || trade.timeframe;
  const htfTimeframe = trade.higherTimeframe;

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group">
      {/* Top Banner / Screenshot Area */}
      <div className="relative w-full h-48 bg-slate-950 overflow-hidden">
        {currentDisplayUrl ? (
          <div className="w-full h-full relative cursor-pointer" onClick={handleCardImageClick}>
            <img
              src={currentDisplayUrl}
              alt={`${trade.symbol} chart screenshot`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-medium">
              <Maximize2 className="w-4 h-4 text-rose-400" />
              <span>
                {availableCount > 1
                  ? `Click to view ${activeImageTab.toUpperCase()} chart`
                  : 'Click to expand chart screenshot'}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center bg-slate-950/60 text-slate-600 gap-1.5 cursor-pointer"
            onClick={() => onViewDetails(trade)}
          >
            <ImageIcon className="w-8 h-8 opacity-40 text-slate-500" />
            <span className="text-xs text-slate-400 font-medium">No screenshots attached</span>
            <span className="text-[10px] text-rose-400/80 hover:underline">Click to view details</span>
          </div>
        )}

        {/* Top-left: Position direction and Multi-timeframe badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-wider ${
              trade.positionType === 'Buy'
                ? 'bg-emerald-500/90 text-white'
                : 'bg-rose-500/90 text-white'
            }`}
          >
            {trade.positionType === 'Buy' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {trade.positionType.toUpperCase()}
          </span>

          {/* Timeframe pill showing HTF and LTF */}
          <span className="bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-slate-200 border border-slate-700/60 flex items-center gap-1">
            {htfTimeframe ? (
              <>
                <span className="text-amber-400 font-bold">{htfTimeframe}</span>
                <span className="text-slate-500">➔</span>
                <span className="text-sky-400 font-bold">{ltfTimeframe}</span>
              </>
            ) : (
              <span>{ltfTimeframe}</span>
            )}
          </span>
        </div>

        {/* Top-right: Net PnL badge */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <div
            className={`px-2.5 py-1 rounded-md text-sm font-extrabold font-mono tracking-tight shadow-lg ${
              isProfit
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md'
            }`}
          >
            {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
          </div>
        </div>

        {/* Bottom Banner: Multi-Timeframe Interactive Pill Switcher */}
        {availableCount > 1 ? (
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
            <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-0.5 flex items-center text-[10px] font-semibold gap-0.5">
              {hasHtf && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageTab('htf');
                  }}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    activeImageTab === 'htf'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  HTF ({htfTimeframe || 'H1'})
                </button>
              )}

              {hasBefore && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageTab('before');
                  }}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    activeImageTab === 'before'
                      ? 'bg-sky-500 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  LTF Entry
                </button>
              )}

              {hasAfter && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageTab('after');
                  }}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    activeImageTab === 'after'
                      ? 'bg-emerald-500 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Exit
                </button>
              )}
            </div>

            <span className="text-[10px] bg-slate-950/80 backdrop-blur-md text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono">
              {availableCount} Charts
            </span>
          </div>
        ) : hasHtf ? (
          <div className="absolute bottom-2.5 left-3 z-10 pointer-events-none">
            <span className="bg-slate-950/90 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
              HTF Structure ({htfTimeframe || 'Chart'})
            </span>
          </div>
        ) : hasBefore ? (
          <div className="absolute bottom-2.5 left-3 z-10 pointer-events-none">
            <span className="bg-slate-950/90 backdrop-blur-md border border-sky-500/40 text-sky-300 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
              LTF Entry Setup
            </span>
          </div>
        ) : hasAfter ? (
          <div className="absolute bottom-2.5 left-3 z-10 pointer-events-none">
            <span className="bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
              Outcome Exit
            </span>
          </div>
        ) : null}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Symbol Title & Clean Unboxed Metadata */}
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onViewDetails(trade)}
              className="text-base font-bold text-white hover:text-rose-400 transition-colors cursor-pointer truncate"
              title={trade.symbol}
            >
              {trade.symbol}
            </h3>
          </div>

          {/* Clean metadata */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-400 mt-1">
            <span>{trade.strategy}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Lot: {trade.lotSize}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {formattedDate}
            </span>
          </div>

          {/* Multi-Timeframe Alignment indicator if set */}
          {trade.htfTrend && (
            <div className="mt-2 text-[11px] flex items-center gap-2">
              <span className="text-slate-400">Trend Bias:</span>
              <span
                className={`font-semibold ${
                  trade.htfTrend === 'Bullish'
                    ? 'text-emerald-400'
                    : trade.htfTrend === 'Bearish'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {htfTimeframe} {trade.htfTrend}
              </span>
            </div>
          )}

          {/* Price Execution Details */}
          <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Entry</div>
              <div className="text-slate-200 font-semibold tabular-nums mt-0.5">
                {trade.entryPrice.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Exit</div>
              <div className="text-slate-200 font-semibold tabular-nums mt-0.5">
                {trade.exitPrice.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Notes excerpt if present */}
          {trade.notes && (
            <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
              {trade.notes}
            </p>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60 text-xs">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            {trade.emotion && (
              <>
                <span>Mindset:</span>
                <span className="text-slate-200 font-medium">{trade.emotion}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onViewDetails(trade)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="View full trade details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(trade)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Edit trade"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(trade.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Delete trade"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
