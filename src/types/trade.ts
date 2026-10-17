export type PositionType = 'Buy' | 'Sell';
export type TradeOutcome = 'Win' | 'Loss' | 'Breakeven';

export type DerivCategory =
  | 'volatility'
  | 'crash_boom'
  | 'step'
  | 'jump'
  | 'range_break'
  | 'dex'
  | 'other';

export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1';

export type TradeEmotion =
  | 'Disciplined'
  | 'Patient'
  | 'Confident'
  | 'FOMO'
  | 'Revenge Trade'
  | 'Hesitant'
  | 'Neutral';

export type MarketTrend = 'Bullish' | 'Bearish' | 'Ranging';

export interface DerivAsset {
  symbol: string;
  name: string;
  category: DerivCategory;
  categoryLabel: string;
  minLot: number;
  lotStep: number;
  description: string;
  typicalDecimals: number;
}

export interface Trade {
  id: string;
  symbol: string;
  category: DerivCategory;
  positionType: PositionType;
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number; // in USD
  pnlPercentage?: number;
  outcome: TradeOutcome;
  tradeDate: string; // ISO string e.g. "2026-10-15T14:30"
  timeframe: Timeframe; // Lower / Execution timeframe (e.g. M5, M1)
  lowerTimeframe?: Timeframe;
  higherTimeframe?: Timeframe; // Higher timeframe (e.g. H1, H4, D1)
  htfTrend?: MarketTrend; // Trend on higher timeframe
  strategy: string;
  riskRewardRatio?: number;
  emotion?: TradeEmotion;
  notes: string;
  // Multi-Timeframe Screenshots
  screenshotHtfUrl?: string; // Higher Timeframe Structure Chart (H1/H4/D1)
  screenshotHtfName?: string;
  screenshotBeforeUrl?: string; // Lower Timeframe Entry Setup Chart (M1/M5/M15)
  screenshotBeforeName?: string;
  screenshotAfterUrl?: string; // Outcome / Exit Chart
  screenshotAfterName?: string;
  screenshotUrl?: string; // Legacy fallback or primary screenshot
  screenshotName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TradeFilter {
  searchQuery: string;
  category: string;
  positionType: string;
  outcome: string;
  timeframe: string;
  strategy: string;
  startDate: string;
  endDate: string;
  sortBy: 'date_desc' | 'date_asc' | 'pnl_desc' | 'pnl_asc';
}
