import React from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { DERIV_CATEGORIES } from '../data/derivAssets';

interface JournalControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedOutcome: string;
  onOutcomeChange: (outcome: string) => void;
  selectedPosition: string;
  onPositionChange: (pos: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onExport: () => void;
  onImportClick: () => void;
  onClearAll: () => void;
  totalFilteredCount: number;
}

export const JournalControls: React.FC<JournalControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedOutcome,
  onOutcomeChange,
  selectedPosition,
  onPositionChange,
  viewMode,
  onViewModeChange,
  onExport,
  onImportClick,
  onClearAll,
  totalFilteredCount,
}) => {
  return (
    <div className="space-y-3">
      {/* Search and Primary Filters Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by index name, strategy, or notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* View Switch & Backup Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Segmented Grid / Table View Switch (Buttons with clean active states) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Compact Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Export JSON */}
          <button
            type="button"
            onClick={onExport}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title="Export Journal Backup (JSON)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import JSON */}
          <button
            type="button"
            onClick={onImportClick}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title="Import Journal Backup (JSON)"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Reset / Start Fresh */}
          <button
            type="button"
            onClick={onClearAll}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title="Start Fresh (Clear all trades & reset to $100 deposit)"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Deriv Category Filter Tabs (Interactive Filter Controls as functional buttons) */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
          {DERIV_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary filters (Outcome & Position) */}
        <div className="flex items-center gap-2 text-xs">
          {/* Outcome Filter */}
          <select
            value={selectedOutcome}
            onChange={(e) => onOutcomeChange(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Outcomes</option>
            <option value="Win">Wins Only</option>
            <option value="Loss">Losses Only</option>
            <option value="Breakeven">Breakeven Only</option>
          </select>

          {/* Position Type Filter */}
          <select
            value={selectedPosition}
            onChange={(e) => onPositionChange(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Directions</option>
            <option value="Buy">Buy / Long</option>
            <option value="Sell">Sell / Short</option>
          </select>

          <span className="text-slate-500 text-xs pl-1">
            Showing <strong className="text-slate-300">{totalFilteredCount}</strong> trades
          </span>
        </div>
      </div>
    </div>
  );
};
