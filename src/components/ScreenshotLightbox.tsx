import React, { useState, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Columns,
  Image as ImageIcon,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ScreenshotLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  imageName?: string;
  title?: string;
  htfUrl?: string;
  htfName?: string;
  beforeUrl?: string;
  beforeName?: string;
  afterUrl?: string;
  afterName?: string;
  initialView?: 'htf' | 'before' | 'after' | 'split';
  onClose: () => void;
}

export const ScreenshotLightbox: React.FC<ScreenshotLightboxProps> = ({
  isOpen,
  imageUrl,
  imageName = 'trade_screenshot.png',
  title = 'Trade Screenshot',
  htfUrl,
  htfName,
  beforeUrl,
  beforeName,
  afterUrl,
  afterName,
  initialView,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [activeTab, setActiveTab] = useState<'htf' | 'before' | 'after' | 'split'>('before');

  const hasHtf = Boolean(htfUrl);
  const hasBefore = Boolean(beforeUrl || (!hasHtf && !afterUrl && imageUrl));
  const hasAfter = Boolean(afterUrl);

  const availableCount = (hasHtf ? 1 : 0) + (hasBefore ? 1 : 0) + (hasAfter ? 1 : 0);
  const hasMultiple = availableCount > 1;

  const effectiveHtfUrl = htfUrl || '';
  const effectiveHtfName = htfName || 'higher_timeframe_chart.png';
  const effectiveBeforeUrl = beforeUrl || imageUrl;
  const effectiveBeforeName = beforeName || imageName || 'before_trade_setup.png';
  const effectiveAfterUrl = afterUrl || '';
  const effectiveAfterName = afterName || 'after_trade_outcome.png';

  // Sync initial tab when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      if (initialView === 'htf' && hasHtf) {
        setActiveTab('htf');
      } else if (initialView === 'after' && hasAfter) {
        setActiveTab('after');
      } else if (initialView === 'split' && hasMultiple) {
        setActiveTab('split');
      } else if (hasBefore) {
        setActiveTab('before');
      } else if (hasHtf) {
        setActiveTab('htf');
      } else if (hasAfter) {
        setActiveTab('after');
      }
    }
  }, [isOpen, initialView, hasHtf, hasBefore, hasAfter, hasMultiple]);

  if (!isOpen) return null;

  const currentDisplayUrl =
    activeTab === 'htf' && hasHtf
      ? effectiveHtfUrl
      : activeTab === 'after' && hasAfter
      ? effectiveAfterUrl
      : effectiveBeforeUrl || effectiveHtfUrl || effectiveAfterUrl;

  const currentDisplayName =
    activeTab === 'htf' && hasHtf
      ? effectiveHtfName
      : activeTab === 'after' && hasAfter
      ? effectiveAfterName
      : effectiveBeforeName;

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleDownload = (urlToDownload: string, nameToDownload: string) => {
    if (!urlToDownload) return;
    const link = document.createElement('a');
    link.href = urlToDownload;
    link.download = nameToDownload;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl w-full max-h-[94vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/95 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>{title}</span>
                {hasMultiple && (
                  <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold">
                    {availableCount} Charts Available
                  </span>
                )}
              </h3>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {activeTab === 'split' ? 'Multi-Timeframe Side-by-Side Comparison' : currentDisplayName}
              </span>
            </div>
          </div>

          {/* Selector Tabs when multiple images exist */}
          {hasMultiple && (
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
              {hasHtf && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('htf');
                    setScale(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'htf'
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>HTF Chart</span>
                </button>
              )}

              {hasBefore && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('before');
                    setScale(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'before'
                      ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
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
                  onClick={() => {
                    setActiveTab('after');
                    setScale(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'after'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Outcome Exit</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveTab('split');
                  setScale(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'split'
                    ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            {activeTab !== 'split' && (
              <>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-40 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 font-mono w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={scale >= 3}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-40 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-slate-700 mx-1" />
              </>
            )}

            <button
              type="button"
              onClick={() => {
                if (activeTab === 'htf' && hasHtf) {
                  handleDownload(effectiveHtfUrl, effectiveHtfName);
                } else if (activeTab === 'after' && hasAfter) {
                  handleDownload(effectiveAfterUrl, effectiveAfterName);
                } else {
                  handleDownload(effectiveBeforeUrl, effectiveBeforeName);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="Download Screenshot"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 rounded-md transition-colors ml-1 cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content canvas */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[440px] bg-slate-950/90">
          {activeTab === 'split' && hasMultiple ? (
            /* Multi-Timeframe Side-by-Side split view */
            <div
              className={`grid gap-4 w-full h-full max-h-[76vh] ${
                availableCount === 3
                  ? 'grid-cols-1 md:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2'
              }`}
            >
              {/* HTF Column */}
              {hasHtf && (
                <div className="flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-900/60 p-2">
                  <div className="flex items-center justify-between pb-2 px-1 text-xs font-semibold text-amber-400 border-b border-slate-800/80 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      HIGHER TIMEFRAME (STRUCTURE)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownload(effectiveHtfUrl, effectiveHtfName)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      title="Download HTF Screenshot"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 flex items-center justify-center overflow-auto min-h-[260px]">
                    <img
                      src={effectiveHtfUrl}
                      alt="Higher Timeframe Structure Chart"
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-[65vh] object-contain rounded shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Before / LTF Entry Column */}
              {hasBefore && (
                <div className="flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-900/60 p-2">
                  <div className="flex items-center justify-between pb-2 px-1 text-xs font-semibold text-sky-400 border-b border-slate-800/80 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      LOWER TIMEFRAME (ENTRY TRIGGER)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownload(effectiveBeforeUrl, effectiveBeforeName)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      title="Download Before Screenshot"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 flex items-center justify-center overflow-auto min-h-[260px]">
                    <img
                      src={effectiveBeforeUrl}
                      alt="Before Trade Setup"
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-[65vh] object-contain rounded shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* After / Outcome Column */}
              {hasAfter && (
                <div className="flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-900/60 p-2">
                  <div className="flex items-center justify-between pb-2 px-1 text-xs font-semibold text-emerald-400 border-b border-slate-800/80 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      OUTCOME (EXIT / RESULT)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownload(effectiveAfterUrl, effectiveAfterName)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      title="Download After Screenshot"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 flex items-center justify-center overflow-auto min-h-[260px]">
                    <img
                      src={effectiveAfterUrl}
                      alt="After Trade Outcome"
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-[65vh] object-contain rounded shadow-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Single Image View with Pan/Zoom */
            <div className="w-full h-full flex flex-col items-center justify-center">
              {hasMultiple && (
                <div className="mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                      activeTab === 'htf'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : activeTab === 'before'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {activeTab === 'htf'
                      ? 'HIGHER TIMEFRAME (MARKET STRUCTURE)'
                      : activeTab === 'before'
                      ? 'LOWER TIMEFRAME (ENTRY TRIGGER)'
                      : 'OUTCOME (EXIT / RESULT)'}
                  </span>
                </div>
              )}
              <div className="overflow-auto max-w-full max-h-[75vh] flex items-center justify-center">
                <img
                  src={currentDisplayUrl}
                  alt={currentDisplayName}
                  referrerPolicy="no-referrer"
                  style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
                  className="max-w-full max-h-[72vh] object-contain transition-transform duration-100 select-none rounded shadow-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
