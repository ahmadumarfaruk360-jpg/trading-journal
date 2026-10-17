import React, { useState, useEffect, useRef } from 'react';
import { Trade } from './types/trade';
import {
  getTrades,
  saveTrade,
  deleteTrade as removeTradeFromStorage,
  clearAllTrades,
  getInitialDeposit,
  saveInitialDeposit,
} from './services/storage';
import { TopBar, ActiveTab } from './components/TopBar';
import { DashboardMetrics } from './components/DashboardMetrics';
import { JournalControls } from './components/JournalControls';
import { TradeCard } from './components/TradeCard';
import { TradeTable } from './components/TradeTable';
import { TradeFormModal } from './components/TradeFormModal';
import { TradeDetailModal } from './components/TradeDetailModal';
import { ScreenshotLightbox } from './components/ScreenshotLightbox';
import { AnalyticsView } from './components/AnalyticsView';
import { AssetPerformanceMatrix } from './components/AssetPerformanceMatrix';
import { SyntheticCalculator } from './components/SyntheticCalculator';
import { StreakTrackerBanner } from './components/StreakTrackerBanner';
import {
  Plus,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Camera,
  TrendingUp,
} from 'lucide-react';

export default function App() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [initialDeposit, setInitialDeposit] = useState<number>(() => getInitialDeposit());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('journal');

  // Form Modal (Log New / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Detail Modal
  const [detailTrade, setDetailTrade] = useState<Trade | null>(null);

  // Lightbox with Multi-Timeframe (HTF, LTF Entry, Outcome) support
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    imageName: string;
    htfUrl?: string;
    htfName?: string;
    beforeUrl?: string;
    beforeName?: string;
    afterUrl?: string;
    afterName?: string;
    initialView?: 'htf' | 'before' | 'after' | 'split';
  }>({
    isOpen: false,
    imageUrl: '',
    imageName: '',
  });

  const handleOpenLightbox = (
    url: string,
    name?: string,
    htfUrl?: string,
    htfName?: string,
    beforeUrl?: string,
    beforeName?: string,
    afterUrl?: string,
    afterName?: string,
    initialView?: 'htf' | 'before' | 'after' | 'split'
  ) => {
    setLightboxState({
      isOpen: true,
      imageUrl: url,
      imageName: name || 'Trade Screenshot',
      htfUrl,
      htfName,
      beforeUrl,
      beforeName,
      afterUrl,
      afterName,
      initialView,
    });
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOutcome, setSelectedOutcome] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Import file ref
  const importFileRef = useRef<HTMLInputElement>(null);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load trades on mount with fresh $100 initialization check
  useEffect(() => {
    initializeAndLoad();
  }, []);

  const initializeAndLoad = async () => {
    setIsLoading(true);
    try {
      // If first run of fresh $100 request, wipe old seed trades
      const FRESH_KEY = 'deriv_fresh_start_100_v1';
      if (!localStorage.getItem(FRESH_KEY)) {
        await clearAllTrades();
        saveInitialDeposit(100);
        setInitialDeposit(100);
        localStorage.setItem(FRESH_KEY, 'true');
        setTrades([]);
      } else {
        const data = await getTrades();
        setTrades(data);
      }
    } catch {
      setTrades([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrades = async () => {
    try {
      const data = await getTrades();
      setTrades(data);
    } catch {
      // Fallback
    }
  };

  // Update initial deposit
  const handleUpdateDeposit = (newDeposit: number) => {
    saveInitialDeposit(newDeposit);
    setInitialDeposit(newDeposit);
    showToast(`Account starting capital updated to $${newDeposit.toFixed(2)}`);
  };

  // Save Trade (Create or Update)
  const handleSaveTrade = async (tradeToSave: Trade) => {
    await saveTrade(tradeToSave);
    await loadTrades();
    setIsFormModalOpen(false);
    setEditingTrade(null);
    showToast(editingTrade ? 'Trade updated' : 'Trade logged with screenshot');
  };

  // Delete Trade
  const handleDeleteTrade = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trade entry?')) {
      await removeTradeFromStorage(id);
      await loadTrades();
      if (detailTrade?.id === id) {
        setDetailTrade(null);
      }
      showToast('Trade deleted');
    }
  };

  // Edit Trade Trigger
  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsFormModalOpen(true);
  };

  // Reset to fresh 0 trades with $100 deposit
  const handleClearAllTrades = async () => {
    if (window.confirm('Reset journal back to a clean state with 0 trades and $100.00 deposit?')) {
      await clearAllTrades();
      saveInitialDeposit(100);
      setInitialDeposit(100);
      setTrades([]);
      showToast('Fresh start initialized with $100.00 starting deposit');
    }
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      initialDeposit,
      trades,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `deriv_synthetics_journal_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported journal data backup');
  };

  // Import JSON Backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          for (const item of imported) {
            if (item.id && item.symbol) {
              await saveTrade(item);
            }
          }
          await loadTrades();
          showToast(`Successfully imported ${imported.length} trades`);
        } else if (imported && Array.isArray(imported.trades)) {
          if (imported.initialDeposit) {
            handleUpdateDeposit(imported.initialDeposit);
          }
          for (const item of imported.trades) {
            if (item.id && item.symbol) {
              await saveTrade(item);
            }
          }
          await loadTrades();
          showToast(`Successfully imported ${imported.trades.length} trades`);
        }
      } catch {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    if (importFileRef.current) {
      importFileRef.current.value = '';
    }
  };

  // Total Net PnL
  const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
  const currentBalance = initialDeposit + totalPnL;

  // Filter logic
  const filteredTrades = trades.filter((trade) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSymbol = trade.symbol.toLowerCase().includes(q);
      const matchStrategy = trade.strategy.toLowerCase().includes(q);
      const matchNotes = trade.notes.toLowerCase().includes(q);
      if (!matchSymbol && !matchStrategy && !matchNotes) return false;
    }

    if (selectedCategory !== 'all') {
      if (trade.category !== selectedCategory) return false;
    }

    if (selectedOutcome !== 'all') {
      if (trade.outcome !== selectedOutcome) return false;
    }

    if (selectedPosition !== 'all') {
      if (trade.positionType !== selectedPosition) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Hidden file input for importing backup */}
      <input
        type="file"
        ref={importFileRef}
        accept=".json"
        onChange={handleImportFile}
        className="hidden"
      />

      {/* Top Bar adhering to 3-zone contract */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewTradeModal={() => {
          setEditingTrade(null);
          setIsFormModalOpen(true);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top KPI Metrics Strip (Shows $100 starting deposit & real-time balance) */}
        <DashboardMetrics
          trades={trades}
          initialDeposit={initialDeposit}
          onUpdateDeposit={handleUpdateDeposit}
        />

        {/* Tab Content Routing */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            {/* Active Winning / Losing Strike Status & Momentum Banner */}
            <StreakTrackerBanner trades={trades} />

            {/* Filter and Control Bar */}
            <JournalControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedOutcome={selectedOutcome}
              onOutcomeChange={setSelectedOutcome}
              selectedPosition={selectedPosition}
              onPositionChange={setSelectedPosition}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onExport={handleExportJSON}
              onImportClick={() => importFileRef.current?.click()}
              onClearAll={handleClearAllTrades}
              totalFilteredCount={filteredTrades.length}
            />

            {/* Trades Display: Loading vs Fresh Start vs Filtered Empty vs Content */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-72 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800/60"
                  />
                ))}
              </div>
            ) : trades.length === 0 ? (
              /* Fresh Start Launchpad with $100 initial deposit */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 shadow-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
                  <DollarSign className="w-3.5 h-3.5" /> Starting Capital: ${initialDeposit.toFixed(2)}
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Your Fresh Deriv Trading Journal
                  </h3>
                  <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                    Zero trades logged yet. Your journal is initialized with a <strong className="text-white">${initialDeposit.toFixed(2)} deposit</strong>. Track every trade on Deriv Synthetics with entry prices, exit prices, and attached MT5 chart screenshots.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTrade(null);
                      setIsFormModalOpen(true);
                    }}
                    className="px-6 py-3.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] rounded-xl shadow-lg shadow-rose-600/30 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Log Your First Trade</span>
                  </button>
                </div>

                {/* 3 Discipline Tips for a $100 Account */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-left">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>1–2% Risk Sizing</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      On a $100 balance, risk $1.00–$2.00 per trade. Use minimum lot sizes (0.20 on Crash/Boom, 0.001 on V75).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-sky-400" />
                      <span>Before & After Screenshots</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Attach both your initial setup (Before) and final exit outcome (After) to analyze chart patterns, execution quality, and spike catches.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-rose-400" />
                      <span>1:2 Risk to Reward</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Target setups where potential reward is at least double your risk to achieve positive long-term growth.
                    </p>
                  </div>
                </div>
              </div>
            ) : filteredTrades.length === 0 ? (
              /* Filtered empty state */
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-rose-400 mx-auto flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">No trades match active filter</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Try clearing your search query or reset category filter.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedOutcome('all');
                    setSelectedPosition('all');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Active Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTrades.map((trade) => (
                  <TradeCard
                    key={trade.id}
                    trade={trade}
                    onViewDetails={setDetailTrade}
                    onEdit={handleEditTrade}
                    onDelete={handleDeleteTrade}
                    onOpenLightbox={handleOpenLightbox}
                  />
                ))}
              </div>
            ) : (
              <TradeTable
                trades={filteredTrades}
                onViewDetails={setDetailTrade}
                onEdit={handleEditTrade}
                onDelete={handleDeleteTrade}
                onOpenLightbox={handleOpenLightbox}
              />
            )}
          </div>
        )}

        {/* Tab 2: Analytics & Growth */}
        {activeTab === 'analytics' && <AnalyticsView trades={trades} />}

        {/* Tab 3: Asset Performance Matrix */}
        {activeTab === 'matrix' && (
          <AssetPerformanceMatrix
            trades={trades}
            onFilterBySymbol={(sym) => {
              setSearchQuery(sym);
              setActiveTab('journal');
            }}
          />
        )}

        {/* Tab 4: Lot & Risk Calculator */}
        {activeTab === 'calculator' && <SyntheticCalculator currentBalance={currentBalance} />}
      </main>

      {/* Trade Entry & Edit Modal */}
      <TradeFormModal
        isOpen={isFormModalOpen}
        initialTrade={editingTrade}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTrade(null);
        }}
        onSave={handleSaveTrade}
        onOpenLightbox={handleOpenLightbox}
      />

      {/* Detailed Trade Inspector Modal */}
      <TradeDetailModal
        trade={detailTrade}
        onClose={() => setDetailTrade(null)}
        onEdit={handleEditTrade}
        onDelete={handleDeleteTrade}
        onOpenLightbox={handleOpenLightbox}
      />

      {/* Screenshot Lightbox Fullscreen Viewer */}
      <ScreenshotLightbox
        isOpen={lightboxState.isOpen}
        imageUrl={lightboxState.imageUrl}
        imageName={lightboxState.imageName}
        title={lightboxState.imageName}
        htfUrl={lightboxState.htfUrl}
        htfName={lightboxState.htfName}
        beforeUrl={lightboxState.beforeUrl}
        beforeName={lightboxState.beforeName}
        afterUrl={lightboxState.afterUrl}
        afterName={lightboxState.afterName}
        initialView={lightboxState.initialView}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Quiet, compliant footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-6 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2">
          <span>Deriv Synthetics Trading Journal</span>
          <span>·</span>
          <span>Starting Balance: ${initialDeposit.toFixed(2)}</span>
          <span>·</span>
          <span>Deriv Synthetic Indices Only</span>
        </div>
      </footer>
    </div>
  );
}
