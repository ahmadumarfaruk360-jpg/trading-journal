import React, { useState } from 'react';
import { DERIV_SYNTHETIC_ASSETS } from '../data/derivAssets';
import { Calculator, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';

interface SyntheticCalculatorProps {
  currentBalance?: number;
}

export const SyntheticCalculator: React.FC<SyntheticCalculatorProps> = ({ currentBalance = 100 }) => {
  const [selectedSymbol, setSelectedSymbol] = useState('Volatility 75 Index');
  const [accountBalance, setAccountBalance] = useState(currentBalance.toString());
  const [riskPercentage, setRiskPercentage] = useState('1.5');
  const [entryPrice, setEntryPrice] = useState('490000');
  const [stopLossPrice, setStopLossPrice] = useState('487500');
  const [manualLotSize, setManualLotSize] = useState('0.005');

  const asset = DERIV_SYNTHETIC_ASSETS.find((a) => a.symbol === selectedSymbol) || DERIV_SYNTHETIC_ASSETS[0];

  const balance = parseFloat(accountBalance) || 0;
  const riskPct = parseFloat(riskPercentage) || 0;
  const maxRiskAmount = (balance * riskPct) / 100;

  const entry = parseFloat(entryPrice) || 0;
  const sl = parseFloat(stopLossPrice) || 0;
  const pointsDistance = Math.abs(entry - sl);

  // Recommended lot calculation
  let recommendedLot = 0;
  if (pointsDistance > 0 && maxRiskAmount > 0) {
    recommendedLot = maxRiskAmount / pointsDistance;
    // Round to asset lot step
    recommendedLot = Math.max(asset.minLot, parseFloat(recommendedLot.toFixed(3)));
  }

  // Risk for manual lot
  const manualLot = parseFloat(manualLotSize) || asset.minLot;
  const manualRiskAmount = pointsDistance * manualLot;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-rose-500" />
            Deriv Synthetics Lot & Risk Calculator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calculate precise position sizes, point values, and maximum risk allocations before executing on MT5.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
            Account & Trade Setup
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Deriv Synthetic Index
            </label>
            <select
              value={selectedSymbol}
              onChange={(e) => {
                setSelectedSymbol(e.target.value);
                const found = DERIV_SYNTHETIC_ASSETS.find((a) => a.symbol === e.target.value);
                if (found) {
                  setManualLotSize(found.minLot.toString());
                }
              }}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              {DERIV_SYNTHETIC_ASSETS.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.name} ({a.categoryLabel} · Min Lot: {a.minLot})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Account Balance ($)
              </label>
              <input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Risk Per Trade (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={riskPercentage}
                onChange={(e) => setRiskPercentage(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Entry Price
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Stop Loss Price
              </label>
              <input
                type="number"
                step="any"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Custom Test Lot Size
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Min Allowed: {asset.minLot}
              </span>
            </div>
            <input
              type="number"
              step="any"
              value={manualLotSize}
              onChange={(e) => setManualLotSize(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Output Calculations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
            Risk & Lot Recommendation
          </h3>

          <div className="space-y-3 font-mono">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-sans block">
                  Stop Loss Distance
                </span>
                <span className="text-lg font-bold text-slate-200 tabular-nums">
                  {pointsDistance.toLocaleString()} pts
                </span>
              </div>
              <span className="text-xs text-slate-500 font-sans">
                {asset.name}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-sans block">
                  Target Risk Budget ({riskPct}%)
                </span>
                <span className="text-lg font-bold text-sky-400 tabular-nums">
                  ${maxRiskAmount.toFixed(2)}
                </span>
              </div>
              <ShieldCheck className="w-5 h-5 text-sky-400 opacity-60" />
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-rose-300 font-sans font-semibold block">
                  Recommended Lot Size
                </span>
                <span className="text-2xl font-extrabold text-white tabular-nums">
                  {recommendedLot.toFixed(3)}
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-400 font-sans">
                <span>{recommendedLot < asset.minLot ? 'Below min lot!' : 'Safe execution'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-sans block">
                  Risk with Test Lot ({manualLot})
                </span>
                <span
                  className={`text-base font-bold tabular-nums ${
                    manualRiskAmount > maxRiskAmount ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  ${manualRiskAmount.toFixed(2)}
                  <span className="text-xs font-normal text-slate-500 ml-1.5 font-sans">
                    ({balance > 0 ? ((manualRiskAmount / balance) * 100).toFixed(1) : 0}% of balance)
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Deriv Synthetics Risk Notice
            </div>
            <p>
              Crash and Boom indices can gap during spike ticks; maintain conservative lot sizes to account for slippage past stop losses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
