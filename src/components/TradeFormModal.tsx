import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calculator,
  Check,
  AlertCircle,
  Clock,
  Tag,
  Smile,
  FileText,
  Search,
  Eye,
  Layers,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { Trade, PositionType, Timeframe, TradeEmotion, DerivCategory, MarketTrend } from '../types/trade';
import { DERIV_SYNTHETIC_ASSETS, POPULAR_STRATEGIES, TIMEFRAMES } from '../data/derivAssets';

interface TradeFormModalProps {
  isOpen: boolean;
  initialTrade?: Trade | null;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  onOpenLightbox?: (
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

export const TradeFormModal: React.FC<TradeFormModalProps> = ({
  isOpen,
  initialTrade,
  onClose,
  onSave,
  onOpenLightbox,
}) => {
  // Form State
  const [symbol, setSymbol] = useState('Crash 1000 Index');
  const [positionType, setPositionType] = useState<PositionType>('Sell');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [lotSize, setLotSize] = useState<string>('0.5');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [pnl, setPnl] = useState<string>('');

  // Timeframes: Higher (HTF) & Lower (LTF)
  const [higherTimeframe, setHigherTimeframe] = useState<Timeframe>('H1');
  const [htfTrend, setHtfTrend] = useState<MarketTrend>('Bearish');
  const [lowerTimeframe, setLowerTimeframe] = useState<Timeframe>('M5');

  const [strategy, setStrategy] = useState<string>('Spike Hunting (Crash/Boom)');
  const [customStrategy, setCustomStrategy] = useState<string>('');
  const [isCustomStrategy, setIsCustomStrategy] = useState(false);
  const [emotion, setEmotion] = useState<TradeEmotion>('Disciplined');
  const [tradeDate, setTradeDate] = useState<string>(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState<string>('');

  // Multi-Timeframe Screenshots: HTF, Before (LTF Entry), and After (Outcome)
  const [screenshotHtfUrl, setScreenshotHtfUrl] = useState<string>('');
  const [screenshotHtfName, setScreenshotHtfName] = useState<string>('');
  const [screenshotBeforeUrl, setScreenshotBeforeUrl] = useState<string>('');
  const [screenshotBeforeName, setScreenshotBeforeName] = useState<string>('');
  const [screenshotAfterUrl, setScreenshotAfterUrl] = useState<string>('');
  const [screenshotAfterName, setScreenshotAfterName] = useState<string>('');

  // Drag states
  const [isDraggingHtf, setIsDraggingHtf] = useState<boolean>(false);
  const [isDraggingBefore, setIsDraggingBefore] = useState<boolean>(false);
  const [isDraggingAfter, setIsDraggingAfter] = useState<boolean>(false);

  // Active paste target ('htf' | 'before' | 'after')
  const [activePasteTarget, setActivePasteTarget] = useState<'htf' | 'before' | 'after'>('htf');

  const fileInputHtfRef = useRef<HTMLInputElement>(null);
  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  // Symbol selector search & dropdown
  const [symbolSearch, setSymbolSearch] = useState('');
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate initial trade if editing
  useEffect(() => {
    if (initialTrade) {
      setSymbol(initialTrade.symbol);
      setPositionType(initialTrade.positionType);
      setEntryPrice(initialTrade.entryPrice.toString());
      setExitPrice(initialTrade.exitPrice.toString());
      setLotSize(initialTrade.lotSize.toString());
      setStopLoss(initialTrade.stopLoss ? initialTrade.stopLoss.toString() : '');
      setTakeProfit(initialTrade.takeProfit ? initialTrade.takeProfit.toString() : '');
      setPnl(initialTrade.pnl.toString());

      setLowerTimeframe(initialTrade.lowerTimeframe || initialTrade.timeframe || 'M5');
      setHigherTimeframe(initialTrade.higherTimeframe || 'H1');
      setHtfTrend(initialTrade.htfTrend || (initialTrade.positionType === 'Buy' ? 'Bullish' : 'Bearish'));

      if (POPULAR_STRATEGIES.includes(initialTrade.strategy)) {
        setStrategy(initialTrade.strategy);
        setIsCustomStrategy(false);
      } else {
        setIsCustomStrategy(true);
        setCustomStrategy(initialTrade.strategy);
      }
      setEmotion(initialTrade.emotion || 'Disciplined');
      setTradeDate(new Date(initialTrade.tradeDate).toISOString().slice(0, 16));
      setNotes(initialTrade.notes || '');

      // HTF screenshot
      setScreenshotHtfUrl(initialTrade.screenshotHtfUrl || '');
      setScreenshotHtfName(initialTrade.screenshotHtfName || '');

      // Before screenshot
      const beforeUrl = initialTrade.screenshotBeforeUrl || initialTrade.screenshotUrl || '';
      const beforeName = initialTrade.screenshotBeforeName || initialTrade.screenshotName || '';
      setScreenshotBeforeUrl(beforeUrl);
      setScreenshotBeforeName(beforeName);

      // After screenshot
      setScreenshotAfterUrl(initialTrade.screenshotAfterUrl || '');
      setScreenshotAfterName(initialTrade.screenshotAfterName || '');

      // Smart active target
      if (!initialTrade.screenshotHtfUrl) {
        setActivePasteTarget('htf');
      } else if (!beforeUrl) {
        setActivePasteTarget('before');
      } else {
        setActivePasteTarget('after');
      }
    } else {
      // Defaults for a new trade
      setSymbol('Crash 1000 Index');
      setPositionType('Sell');
      setEntryPrice('');
      setExitPrice('');
      setLotSize('0.2');
      setStopLoss('');
      setTakeProfit('');
      setPnl('');
      setHigherTimeframe('H1');
      setHtfTrend('Bearish');
      setLowerTimeframe('M5');
      setStrategy('Spike Hunting (Crash/Boom)');
      setIsCustomStrategy(false);
      setCustomStrategy('');
      setEmotion('Disciplined');
      setTradeDate(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      setNotes('');
      setScreenshotHtfUrl('');
      setScreenshotHtfName('');
      setScreenshotBeforeUrl('');
      setScreenshotBeforeName('');
      setScreenshotAfterUrl('');
      setScreenshotAfterName('');
      setActivePasteTarget('htf');
    }
    setErrors({});
  }, [initialTrade, isOpen]);

  // Close symbol dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSymbolDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clipboard paste listener to allow instant screenshot pasting (Ctrl+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file, activePasteTarget);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, activePasteTarget]);

  // Current selected asset object
  const currentAsset = DERIV_SYNTHETIC_ASSETS.find((a) => a.symbol === symbol) || {
    symbol,
    name: symbol,
    category: 'other' as DerivCategory,
    categoryLabel: 'Synthetics',
    minLot: 0.1,
    lotStep: 0.01,
    description: 'Custom Deriv Synthetic',
    typicalDecimals: 2,
  };

  // Auto calculate point difference
  const entryNum = parseFloat(entryPrice);
  const exitNum = parseFloat(exitPrice);
  const lotNum = parseFloat(lotSize);
  const hasValidPrices = !isNaN(entryNum) && !isNaN(exitNum) && entryNum > 0 && exitNum > 0;

  const pointsDiff = hasValidPrices
    ? positionType === 'Buy'
      ? exitNum - entryNum
      : entryNum - exitNum
    : 0;

  // Auto calculate R:R ratio if SL is present
  const slNum = parseFloat(stopLoss);
  const tpNum = parseFloat(takeProfit);
  let calculatedRR: number | undefined = undefined;

  if (hasValidPrices && !isNaN(slNum)) {
    const riskPoints = positionType === 'Buy' ? entryNum - slNum : slNum - entryNum;
    if (riskPoints > 0) {
      if (!isNaN(tpNum)) {
        const rewardPoints = positionType === 'Buy' ? tpNum - entryNum : entryNum - tpNum;
        if (rewardPoints > 0) {
          calculatedRR = parseFloat((rewardPoints / riskPoints).toFixed(2));
        }
      } else if (pointsDiff !== 0) {
        calculatedRR = parseFloat((pointsDiff / riskPoints).toFixed(2));
      }
    }
  }

  // Auto estimate PnL
  const handleAutoEstimatePnL = () => {
    if (!hasValidPrices) {
      setErrors((prev) => ({ ...prev, pnl: 'Please enter valid Entry and Exit prices first' }));
      return;
    }
    const estimated = pointsDiff * (lotNum || 1);
    setPnl(estimated.toFixed(2));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.pnl;
      return next;
    });
  };

  // Convert File to Base64
  const handleImageFile = (file: File, target: 'htf' | 'before' | 'after') => {
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        [target]: 'Please upload a valid image file (PNG, JPG, WEBP)',
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (target === 'htf') {
        setScreenshotHtfUrl(result);
        setScreenshotHtfName(file.name || `htf_chart_${Date.now()}.png`);
        setActivePasteTarget('before');
      } else if (target === 'before') {
        setScreenshotBeforeUrl(result);
        setScreenshotBeforeName(file.name || `ltf_entry_${Date.now()}.png`);
        setActivePasteTarget('after');
      } else {
        setScreenshotAfterUrl(result);
        setScreenshotAfterName(file.name || `outcome_exit_${Date.now()}.png`);
      }
      setErrors((prev) => {
        const next = { ...prev };
        delete next[target];
        return next;
      });
    };
    reader.onerror = () => {
      setErrors((prev) => ({ ...prev, [target]: 'Failed to read image file' }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = (target: 'htf' | 'before' | 'after') => {
    if (target === 'htf') {
      setScreenshotHtfUrl('');
      setScreenshotHtfName('');
      if (fileInputHtfRef.current) fileInputHtfRef.current.value = '';
      setActivePasteTarget('htf');
    } else if (target === 'before') {
      setScreenshotBeforeUrl('');
      setScreenshotBeforeName('');
      if (fileInputBeforeRef.current) fileInputBeforeRef.current.value = '';
      setActivePasteTarget('before');
    } else {
      setScreenshotAfterUrl('');
      setScreenshotAfterName('');
      if (fileInputAfterRef.current) fileInputAfterRef.current.value = '';
      setActivePasteTarget('after');
    }
  };

  // Trend alignment check
  const isAligned =
    (htfTrend === 'Bullish' && positionType === 'Buy') ||
    (htfTrend === 'Bearish' && positionType === 'Sell');

  // Validation & Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!symbol.trim()) newErrors.symbol = 'Asset symbol is required';
    if (!entryPrice || isNaN(parseFloat(entryPrice)) || parseFloat(entryPrice) <= 0) {
      newErrors.entryPrice = 'Valid entry price is required';
    }
    if (!exitPrice || isNaN(parseFloat(exitPrice)) || parseFloat(exitPrice) <= 0) {
      newErrors.exitPrice = 'Valid exit price is required';
    }
    if (!lotSize || isNaN(parseFloat(lotSize)) || parseFloat(lotSize) <= 0) {
      newErrors.lotSize = 'Valid lot size is required';
    }
    if (pnl === '' || isNaN(parseFloat(pnl))) {
      newErrors.pnl = 'Net profit/loss is required (enter exact or click estimate)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const pnlVal = parseFloat(pnl);
    const outcome = pnlVal > 0.001 ? 'Win' : pnlVal < -0.001 ? 'Loss' : 'Breakeven';
    const finalStrategy = isCustomStrategy ? customStrategy.trim() || 'Custom' : strategy;

    const primaryScreenshotUrl = screenshotBeforeUrl || screenshotHtfUrl || screenshotAfterUrl || undefined;
    const primaryScreenshotName = screenshotBeforeName || screenshotHtfName || screenshotAfterName || undefined;

    const tradeToSave: Trade = {
      id: initialTrade?.id || `trade-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      symbol: symbol.trim(),
      category: currentAsset.category,
      positionType,
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      lotSize: parseFloat(lotSize),
      stopLoss: stopLoss && !isNaN(parseFloat(stopLoss)) ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit && !isNaN(parseFloat(takeProfit)) ? parseFloat(takeProfit) : undefined,
      pnl: pnlVal,
      pnlPercentage: entryNum > 0 ? parseFloat(((pointsDiff / entryNum) * 100).toFixed(2)) : undefined,
      outcome,
      tradeDate: new Date(tradeDate).toISOString(),
      // Timeframes
      timeframe: lowerTimeframe,
      lowerTimeframe,
      higherTimeframe,
      htfTrend,
      strategy: finalStrategy,
      riskRewardRatio: calculatedRR,
      emotion,
      notes: notes.trim(),
      // Multi-Timeframe Screenshots
      screenshotHtfUrl: screenshotHtfUrl || undefined,
      screenshotHtfName: screenshotHtfName || undefined,
      screenshotBeforeUrl: screenshotBeforeUrl || undefined,
      screenshotBeforeName: screenshotBeforeName || undefined,
      screenshotAfterUrl: screenshotAfterUrl || undefined,
      screenshotAfterName: screenshotAfterName || undefined,
      // Fallback
      screenshotUrl: primaryScreenshotUrl,
      screenshotName: primaryScreenshotName,
      createdAt: initialTrade?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSave(tradeToSave);
  };

  const filteredAssets = DERIV_SYNTHETIC_ASSETS.filter(
    (a) =>
      a.name.toLowerCase().includes(symbolSearch.toLowerCase()) ||
      a.categoryLabel.toLowerCase().includes(symbolSearch.toLowerCase()) ||
      a.symbol.toLowerCase().includes(symbolSearch.toLowerCase())
  );

  if (!isOpen) return null;

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
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              {initialTrade ? 'Edit Synthetic Trade' : 'Journal New Deriv Trade'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-Timeframe analysis: Higher Timeframe structure, Lower Timeframe execution, and chart screenshots.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* SECTION 1: ASSET & POSITION DIRECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Symbol Picker */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Deriv Synthetic Asset <span className="text-rose-400">*</span>
              </label>

              <button
                type="button"
                onClick={() => setIsSymbolDropdownOpen(!isSymbolDropdownOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-950 border rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                  errors.symbol ? 'border-rose-500' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="text-white font-semibold">{symbol}</span>
                  <span className="ml-2 text-xs text-slate-400 font-normal">
                    ({currentAsset.categoryLabel})
                  </span>
                </div>
                <span className="text-xs text-slate-500">Change ▾</span>
              </button>

              {/* Asset Dropdown List */}
              {isSymbolDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 max-h-72 overflow-y-auto">
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search synthetic index..."
                      value={symbolSearch}
                      onChange={(e) => setSymbolSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    {filteredAssets.map((asset) => (
                      <button
                        key={asset.symbol}
                        type="button"
                        onClick={() => {
                          setSymbol(asset.symbol);
                          if (!lotSize || parseFloat(lotSize) < asset.minLot) {
                            setLotSize(asset.minLot.toString());
                          }
                          if (asset.category === 'crash_boom' && !isCustomStrategy) {
                            setStrategy('Spike Hunting (Crash/Boom)');
                          }
                          setIsSymbolDropdownOpen(false);
                          setSymbolSearch('');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                          symbol === asset.symbol
                            ? 'bg-rose-500/10 text-rose-400 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-200">{asset.name}</div>
                          <div className="text-[11px] text-slate-500">{asset.description}</div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          Min: {asset.minLot}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {errors.symbol && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.symbol}
                </p>
              )}
            </div>

            {/* Position Direction (Buy vs Sell) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Position Type <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPositionType('Buy')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border cursor-pointer ${
                    positionType === 'Buy'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>BUY / LONG</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPositionType('Sell')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border cursor-pointer ${
                    positionType === 'Sell'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/10'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  <span>SELL / SHORT</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: MULTI-TIMEFRAME ANALYSIS & ALIGNMENT LAYOUT */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/70">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Multi-Timeframe Structure & Execution Alignment</span>
              </span>

              {/* Trend Alignment Indicator */}
              <div
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 border ${
                  isAligned
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : htfTrend === 'Ranging'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                <span>
                  {isAligned
                    ? '✓ Trend Aligned Trade'
                    : htfTrend === 'Ranging'
                    ? '⚡ Range Bound Execution'
                    : '⚠ Counter-Trend Trade'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Higher Timeframe (HTF) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Higher Time Frame (HTF)
                </label>
                <select
                  value={higherTimeframe}
                  onChange={(e) => setHigherTimeframe(e.target.value as Timeframe)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-400 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="D1">Daily (D1) - Macro Structure</option>
                  <option value="H4">4 Hours (H4) - Key Levels</option>
                  <option value="H1">1 Hour (H1) - Directional Bias</option>
                  <option value="M30">30 Min (M30) - Intermediate</option>
                  <option value="M15">15 Min (M15) - Swing</option>
                  <option value="M5">5 Min (M5)</option>
                </select>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Overall trend and major support/resistance
                </span>
              </div>

              {/* Higher Timeframe Trend / Bias */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  HTF Trend / Bias
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setHtfTrend('Bullish')}
                    className={`py-1.5 text-xs rounded-xl font-medium border transition-colors cursor-pointer ${
                      htfTrend === 'Bullish'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Bullish
                  </button>
                  <button
                    type="button"
                    onClick={() => setHtfTrend('Bearish')}
                    className={`py-1.5 text-xs rounded-xl font-medium border transition-colors cursor-pointer ${
                      htfTrend === 'Bearish'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Bearish
                  </button>
                  <button
                    type="button"
                    onClick={() => setHtfTrend('Ranging')}
                    className={`py-1.5 text-xs rounded-xl font-medium border transition-colors cursor-pointer ${
                      htfTrend === 'Ranging'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Ranging
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Market structure condition on {higherTimeframe}
                </span>
              </div>

              {/* Lower Timeframe (LTF / Execution) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Execution / Lower Timeframe (LTF)
                </label>
                <select
                  value={lowerTimeframe}
                  onChange={(e) => setLowerTimeframe(e.target.value as Timeframe)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-sky-400 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="M1">1 Min (M1) - Ultra-fast / Spikes</option>
                  <option value="M5">5 Min (M5) - Standard Spike/Scalp</option>
                  <option value="M15">15 Min (M15) - Day Trading</option>
                  <option value="M30">30 Min (M30) - Intraday</option>
                  <option value="H1">1 Hour (H1) - Trend Following</option>
                </select>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Candlestick entry trigger & spike catch
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: ENTRY, EXIT, LOT SIZE & P&L */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Execution Prices & PnL
              </span>
              {hasValidPrices && (
                <span
                  className={`text-xs font-mono font-medium ${
                    pointsDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  Points Diff: {pointsDiff >= 0 ? '+' : ''}
                  {pointsDiff.toFixed(currentAsset.typicalDecimals)} pts
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Entry Price */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Entry Price <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 6245.85"
                  value={entryPrice}
                  onChange={(e) => {
                    setEntryPrice(e.target.value);
                    if (errors.entryPrice) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.entryPrice;
                        return n;
                      });
                    }
                  }}
                  className={`w-full px-3.5 py-2 bg-slate-950 border rounded-xl font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                    errors.entryPrice ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {errors.entryPrice && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.entryPrice}</p>
                )}
              </div>

              {/* Exit Price */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Exit Price <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 6182.20"
                  value={exitPrice}
                  onChange={(e) => {
                    setExitPrice(e.target.value);
                    if (errors.exitPrice) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.exitPrice;
                        return n;
                      });
                    }
                  }}
                  className={`w-full px-3.5 py-2 bg-slate-950 border rounded-xl font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                    errors.exitPrice ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {errors.exitPrice && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.exitPrice}</p>
                )}
              </div>

              {/* Lot Size */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Lot Size <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setLotSize(currentAsset.minLot.toString())}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Min: {currentAsset.minLot}
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  placeholder="0.2"
                  value={lotSize}
                  onChange={(e) => {
                    setLotSize(e.target.value);
                    if (errors.lotSize) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.lotSize;
                        return n;
                      });
                    }
                  }}
                  className={`w-full px-3.5 py-2 bg-slate-950 border rounded-xl font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                    errors.lotSize ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {errors.lotSize && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.lotSize}</p>
                )}
              </div>
            </div>

            {/* Optional Stop Loss, Take Profit & Actual Net P&L */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Stop Loss (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="SL Price"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Take Profit (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="TP Price"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Exact Net PnL in USD */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Net Profit / Loss ($) <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoEstimatePnL}
                    className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                    title="Estimate from points difference"
                  >
                    <Calculator className="w-3 h-3" /> Auto Estimate
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-mono text-slate-500">$</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 45.20 or -15.50"
                    value={pnl}
                    onChange={(e) => {
                      setPnl(e.target.value);
                      if (errors.pnl) {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.pnl;
                          return n;
                        });
                      }
                    }}
                    className={`w-full pl-7 pr-3.5 py-2 bg-slate-950 border rounded-xl font-mono text-sm font-bold placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                      pnl && parseFloat(pnl) > 0
                        ? 'text-emerald-400 border-emerald-500/40'
                        : pnl && parseFloat(pnl) < 0
                        ? 'text-rose-400 border-rose-500/40'
                        : 'text-white border-slate-800'
                    }`}
                  />
                </div>
                {errors.pnl && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.pnl}</p>
                )}
              </div>
            </div>

            {calculatedRR && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <span>Risk to Reward Ratio:</span>
                <span className="font-mono font-bold text-sky-400">1 : {calculatedRR}</span>
              </div>
            )}
          </div>

          {/* SECTION 4: 3-SCREENSHOT MULTI-TIMEFRAME ATTACHMENTS (HTF, BEFORE/LTF, AFTER/OUTCOME) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-rose-400" />
                  <span>Trade Chart Screenshots (HTF, Entry Setup & Outcome)</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Attach your <strong className="text-amber-300">Higher Timeframe</strong> market structure chart, <strong className="text-sky-300">Lower Timeframe entry trigger</strong>, and <strong className="text-emerald-300">Exit outcome</strong>.
                </p>
              </div>

              {/* Paste target toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Paste targets:
                </span>
                <div className="inline-flex rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActivePasteTarget('htf')}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      activePasteTarget === 'htf'
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Paste to HTF
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePasteTarget('before')}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      activePasteTarget === 'before'
                        ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Paste to LTF Setup
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePasteTarget('after')}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      activePasteTarget === 'after'
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Paste to Outcome
                  </button>
                </div>
              </div>
            </div>

            {/* Hidden native inputs */}
            <input
              type="file"
              ref={fileInputHtfRef}
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file, 'htf');
              }}
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputBeforeRef}
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file, 'before');
              }}
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputAfterRef}
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file, 'after');
              }}
              className="hidden"
            />

            {/* 3-Column Multi-Timeframe Screenshot Upload Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SLOT 1: HIGHER TIMEFRAME (HTF) */}
              <div
                className={`flex flex-col rounded-2xl border transition-all ${
                  activePasteTarget === 'htf'
                    ? 'ring-1 ring-amber-500/40 border-amber-500/50 bg-amber-950/10'
                    : 'border-slate-800 bg-slate-950/50'
                }`}
                onClick={() => setActivePasteTarget('htf')}
              >
                <div className="px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      1. HTF Chart ({higherTimeframe})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Structure / Trend</span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-center">
                  {!screenshotHtfUrl ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingHtf(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDraggingHtf(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingHtf(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFile(file, 'htf');
                      }}
                      onClick={() => fileInputHtfRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[140px] ${
                        isDraggingHtf
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-800 hover:border-amber-500/50 bg-slate-950/40 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          Attach <span className="text-amber-300">HTF</span> Chart
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {higherTimeframe} structure & S/R
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border border-slate-800/90 rounded-xl overflow-hidden bg-slate-950 p-2 flex flex-col gap-2">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 group">
                        <img
                          src={screenshotHtfUrl}
                          alt="HTF Structure Screenshot"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/90 text-slate-950 tracking-wide shadow">
                          HTF ({higherTimeframe})
                        </div>
                        {onOpenLightbox && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenLightbox(
                                screenshotHtfUrl,
                                screenshotHtfName || 'HTF Chart',
                                screenshotHtfUrl,
                                screenshotHtfName,
                                screenshotBeforeUrl,
                                screenshotBeforeName,
                                screenshotAfterUrl,
                                screenshotAfterName,
                                'htf'
                              );
                            }}
                            className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-xs text-white font-medium transition-opacity cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Expand
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <div className="truncate max-w-[130px] text-slate-300 font-mono text-[10px] flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{screenshotHtfName}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputHtfRef.current?.click();
                            }}
                            className="px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveScreenshot('htf');
                            }}
                            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            title="Remove HTF screenshot"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.htf && <p className="text-[11px] text-rose-400 mt-1">{errors.htf}</p>}
                </div>
              </div>

              {/* SLOT 2: BEFORE TRADE (LTF SETUP / ENTRY) */}
              <div
                className={`flex flex-col rounded-2xl border transition-all ${
                  activePasteTarget === 'before'
                    ? 'ring-1 ring-sky-500/40 border-sky-500/50 bg-sky-950/10'
                    : 'border-slate-800 bg-slate-950/50'
                }`}
                onClick={() => setActivePasteTarget('before')}
              >
                <div className="px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                      2. LTF Entry ({lowerTimeframe})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Entry Trigger</span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-center">
                  {!screenshotBeforeUrl ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingBefore(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDraggingBefore(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingBefore(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFile(file, 'before');
                      }}
                      onClick={() => fileInputBeforeRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[140px] ${
                        isDraggingBefore
                          ? 'border-sky-500 bg-sky-500/10'
                          : 'border-slate-800 hover:border-sky-500/50 bg-slate-950/40 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-sky-400">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          Attach <span className="text-sky-300">LTF</span> Chart
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {lowerTimeframe} trigger candle
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border border-slate-800/90 rounded-xl overflow-hidden bg-slate-950 p-2 flex flex-col gap-2">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 group">
                        <img
                          src={screenshotBeforeUrl}
                          alt="LTF Entry Screenshot"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-sky-500/90 text-white tracking-wide shadow">
                          LTF ({lowerTimeframe})
                        </div>
                        {onOpenLightbox && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenLightbox(
                                screenshotBeforeUrl,
                                screenshotBeforeName || 'LTF Setup Chart',
                                screenshotHtfUrl,
                                screenshotHtfName,
                                screenshotBeforeUrl,
                                screenshotBeforeName,
                                screenshotAfterUrl,
                                screenshotAfterName,
                                'before'
                              );
                            }}
                            className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-xs text-white font-medium transition-opacity cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Expand
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <div className="truncate max-w-[130px] text-slate-300 font-mono text-[10px] flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-sky-400 shrink-0" />
                          <span className="truncate">{screenshotBeforeName}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputBeforeRef.current?.click();
                            }}
                            className="px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveScreenshot('before');
                            }}
                            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            title="Remove LTF screenshot"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.before && <p className="text-[11px] text-rose-400 mt-1">{errors.before}</p>}
                </div>
              </div>

              {/* SLOT 3: AFTER TRADE (OUTCOME / EXIT) */}
              <div
                className={`flex flex-col rounded-2xl border transition-all ${
                  activePasteTarget === 'after'
                    ? 'ring-1 ring-emerald-500/40 border-emerald-500/50 bg-emerald-950/10'
                    : 'border-slate-800 bg-slate-950/50'
                }`}
                onClick={() => setActivePasteTarget('after')}
              >
                <div className="px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      3. Outcome (Exit)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Result / Spike</span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-center">
                  {!screenshotAfterUrl ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingAfter(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDraggingAfter(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingAfter(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFile(file, 'after');
                      }}
                      onClick={() => fileInputAfterRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[140px] ${
                        isDraggingAfter
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-800 hover:border-emerald-500/50 bg-slate-950/40 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-emerald-400">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          Attach <span className="text-emerald-300">Outcome</span> Chart
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Spike caught / TP or SL hit
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border border-slate-800/90 rounded-xl overflow-hidden bg-slate-950 p-2 flex flex-col gap-2">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 group">
                        <img
                          src={screenshotAfterUrl}
                          alt="Outcome Screenshot"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/90 text-white tracking-wide shadow">
                          OUTCOME EXIT
                        </div>
                        {onOpenLightbox && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenLightbox(
                                screenshotAfterUrl,
                                screenshotAfterName || 'Outcome Chart',
                                screenshotHtfUrl,
                                screenshotHtfName,
                                screenshotBeforeUrl,
                                screenshotBeforeName,
                                screenshotAfterUrl,
                                screenshotAfterName,
                                'after'
                              );
                            }}
                            className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-xs text-white font-medium transition-opacity cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Expand
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <div className="truncate max-w-[130px] text-slate-300 font-mono text-[10px] flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{screenshotAfterName}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputAfterRef.current?.click();
                            }}
                            className="px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveScreenshot('after');
                            }}
                            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            title="Remove outcome screenshot"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.after && <p className="text-[11px] text-rose-400 mt-1">{errors.after}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: CONTEXT & METADATA (Date, Strategy, Emotion) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Trade Date/Time */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Date & Time
              </label>
              <input
                type="datetime-local"
                value={tradeDate}
                onChange={(e) => setTradeDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Strategy Tag */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Strategy Setup
              </label>
              {!isCustomStrategy ? (
                <select
                  value={strategy}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomStrategy(true);
                    } else {
                      setStrategy(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 truncate"
                >
                  {POPULAR_STRATEGIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="__custom__">+ Custom Strategy...</option>
                </select>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter strategy..."
                    value={customStrategy}
                    onChange={(e) => setCustomStrategy(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomStrategy(false)}
                    className="text-xs text-slate-400 hover:text-white px-1.5 py-1 cursor-pointer"
                  >
                    Preset
                  </button>
                </div>
              )}
            </div>

            {/* Trader Emotion */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-slate-400" /> Mindset / Emotion
              </label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value as TradeEmotion)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="Disciplined">Disciplined</option>
                <option value="Confident">Confident</option>
                <option value="Patient">Patient</option>
                <option value="FOMO">FOMO (Chased Trade)</option>
                <option value="Revenge Trade">Revenge Trade</option>
                <option value="Hesitant">Hesitant</option>
                <option value="Neutral">Neutral</option>
              </select>
            </div>
          </div>

          {/* SECTION 6: NOTES & MULTI-TIMEFRAME ANALYSIS LESSONS */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Multi-Timeframe Notes & Reflection
            </label>
            <textarea
              rows={3}
              placeholder="What did the HTF chart indicate? What lower timeframe price action triggered your execution? Did you enter with the trend or on a spike retest?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 leading-relaxed resize-y"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {initialTrade ? 'Save Changes' : 'Journal Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
