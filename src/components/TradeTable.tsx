import React from 'react';
import { Trade } from '../types/trade';
import {
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Eye,
  Edit2,
  Trash2,
  Maximize2,
} from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
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

export const TradeTable: React.FC<TradeTableProps> = ({
  trades,
  onViewDetails,
  onEdit,
  onDelete,
  onOpenLightbox,
}) => {
  return (
    <div className="w-full overflow-x-auto bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
            <th className="py-3.5 px-4">Charts (HTF / LTF / Exit)</th>
            <th className="py-3.5 px-4">Date</th>
            <th className="py-3.5 px-4">Asset & Timeframes</th>
            <th className="py-3.5 px-4">Type</th>
            <th className="py-3.5 px-4 text-right">Entry</th>
            <th className="py-3.5 px-4 text-right">Exit</th>
            <th className="py-3.5 px-4 text-right">Lot</th>
            <th className="py-3.5 px-4 text-right">Net P&L ($)</th>
            <th className="py-3.5 px-4">Setup</th>
            <th className="py-3.5 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {trades.map((trade) => {
            const isProfit = trade.pnl >= 0;
            const formattedDate = new Date(trade.tradeDate).toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const htfUrl = trade.screenshotHtfUrl;
            const htfName = trade.screenshotHtfName || `${trade.symbol} HTF`;

            const beforeUrl =
              trade.screenshotBeforeUrl ||
              (!trade.screenshotHtfUrl && !trade.screenshotAfterUrl ? trade.screenshotUrl : undefined);
            const beforeName = trade.screenshotBeforeName || trade.screenshotName || `${trade.symbol} LTF`;

            const afterUrl = trade.screenshotAfterUrl;
            const afterName = trade.screenshotAfterName || `${trade.symbol} Exit`;

            const ltf = trade.lowerTimeframe || trade.timeframe;
            const htf = trade.higherTimeframe;

            return (
              <tr
                key={trade.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {/* Screenshot Thumbnails (HTF, LTF, Outcome) */}
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-1.5">
                    {/* HTF Thumbnail */}
                    {htfUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenLightbox(
                            htfUrl,
                            htfName,
                            htfUrl,
                            htfName,
                            beforeUrl,
                            beforeName,
                            afterUrl,
                            afterName,
                            'htf'
                          )
                        }
                        className="relative w-9 h-7 rounded-md overflow-hidden border border-amber-500/40 bg-slate-950 block group/thumb cursor-pointer shrink-0"
                        title={`HTF Chart (${htf || 'HTF'}) - Click to expand`}
                      >
                        <img
                          src={htfUrl}
                          alt="HTF Chart"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                        />
                        <span className="absolute top-0 left-0 bg-amber-500 text-slate-950 text-[8px] font-extrabold px-1 rounded-br font-sans leading-tight">
                          H
                        </span>
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                          <Maximize2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      </button>
                    )}

                    {/* Before / LTF Entry Thumbnail */}
                    {beforeUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenLightbox(
                            beforeUrl,
                            beforeName,
                            htfUrl,
                            htfName,
                            beforeUrl,
                            beforeName,
                            afterUrl,
                            afterName,
                            'before'
                          )
                        }
                        className="relative w-9 h-7 rounded-md overflow-hidden border border-sky-500/40 bg-slate-950 block group/thumb cursor-pointer shrink-0"
                        title={`LTF Entry Chart (${ltf}) - Click to expand`}
                      >
                        <img
                          src={beforeUrl}
                          alt="LTF Entry Chart"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                        />
                        <span className="absolute top-0 left-0 bg-sky-500 text-white text-[8px] font-extrabold px-1 rounded-br font-sans leading-tight">
                          L
                        </span>
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                          <Maximize2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      </button>
                    )}

                    {/* After / Outcome Thumbnail */}
                    {afterUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenLightbox(
                            afterUrl,
                            afterName,
                            htfUrl,
                            htfName,
                            beforeUrl,
                            beforeName,
                            afterUrl,
                            afterName,
                            'after'
                          )
                        }
                        className="relative w-9 h-7 rounded-md overflow-hidden border border-emerald-500/40 bg-slate-950 block group/thumb cursor-pointer shrink-0"
                        title="Outcome Exit Chart - Click to expand"
                      >
                        <img
                          src={afterUrl}
                          alt="Outcome Chart"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                        />
                        <span className="absolute top-0 left-0 bg-emerald-500 text-white text-[8px] font-extrabold px-1 rounded-br font-sans leading-tight">
                          E
                        </span>
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                          <Maximize2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      </button>
                    )}

                    {!htfUrl && !beforeUrl && !afterUrl && (
                      <div
                        className="w-9 h-7 rounded-md border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-600"
                        title="No screenshot"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </td>

                {/* Date */}
                <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap font-sans text-xs">
                  {formattedDate}
                </td>

                {/* Asset Symbol & Timeframes */}
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-200 whitespace-nowrap">
                  <div
                    onClick={() => onViewDetails(trade)}
                    className="hover:text-rose-400 cursor-pointer flex flex-col gap-0.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{trade.symbol}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal bg-slate-800/80 px-1 rounded">
                        {htf ? `${htf}➔${ltf}` : ltf}
                      </span>
                    </div>
                    {trade.htfTrend && (
                      <span className="text-[10px] text-slate-500 font-mono font-normal">
                        HTF: {trade.htfTrend}
                      </span>
                    )}
                  </div>
                </td>

                {/* Position Type */}
                <td className="py-2.5 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                      trade.positionType === 'Buy' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {trade.positionType === 'Buy' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {trade.positionType.toUpperCase()}
                  </span>
                </td>

                {/* Entry */}
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-300">
                  {trade.entryPrice.toLocaleString()}
                </td>

                {/* Exit */}
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-300">
                  {trade.exitPrice.toLocaleString()}
                </td>

                {/* Lot */}
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">
                  {trade.lotSize}
                </td>

                {/* Net P&L */}
                <td className="py-2.5 px-4 text-right tabular-nums whitespace-nowrap font-bold">
                  <span
                    className={`inline-block px-2 py-0.5 rounded ${
                      isProfit
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                  </span>
                </td>

                {/* Strategy */}
                <td className="py-2.5 px-4 font-sans text-slate-400 whitespace-nowrap truncate max-w-[160px]" title={trade.strategy}>
                  {trade.strategy}
                </td>

                {/* Actions */}
                <td className="py-2.5 px-4 text-center whitespace-nowrap font-sans">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onViewDetails(trade)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(trade)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(trade.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
