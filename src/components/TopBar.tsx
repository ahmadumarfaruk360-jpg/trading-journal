import React from 'react';
import { Plus } from 'lucide-react';

export type ActiveTab = 'journal' | 'analytics' | 'matrix' | 'calculator';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewTradeModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewTradeModal,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('journal');
        }}
        className="text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
      >
        <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
        <span>Deriv Synthetics Journal</span>
      </a>

      {/* Zone 2: 4 concise single-line nav links */}
      <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-400">
        <button
          type="button"
          onClick={() => onSelectTab('journal')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'journal' ? 'text-white font-semibold' : ''
          }`}
        >
          All Trades
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('analytics')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'analytics' ? 'text-white font-semibold' : ''
          }`}
        >
          Analytics & Growth
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('matrix')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'matrix' ? 'text-white font-semibold' : ''
          }`}
        >
          Asset Performance
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('calculator')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'calculator' ? 'text-white font-semibold' : ''
          }`}
        >
          Lot & Risk Calculator
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenNewTradeModal}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] rounded-xl shadow-lg shadow-rose-600/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Trade</span>
        </button>
      </div>
    </header>
  );
};
