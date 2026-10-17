import { Trade } from '../types/trade';

const DB_NAME = 'deriv_synthetics_journal_db';
const DB_VERSION = 1;
const STORE_NAME = 'trades';
const INITIAL_DEPOSIT_KEY = 'deriv_initial_deposit';

export const DEFAULT_INITIAL_DEPOSIT = 100.0;

// Open IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export function getInitialDeposit(): number {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_DEPOSIT;
  const stored = localStorage.getItem(INITIAL_DEPOSIT_KEY);
  if (!stored) {
    localStorage.setItem(INITIAL_DEPOSIT_KEY, DEFAULT_INITIAL_DEPOSIT.toString());
    return DEFAULT_INITIAL_DEPOSIT;
  }
  const val = parseFloat(stored);
  return isNaN(val) || val <= 0 ? DEFAULT_INITIAL_DEPOSIT : val;
}

export function saveInitialDeposit(amount: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INITIAL_DEPOSIT_KEY, amount.toString());
}

export async function getTrades(): Promise<Trade[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as Trade[];
        if (!results || results.length === 0) {
          // Check localStorage fallback
          const localData = localStorage.getItem('deriv_trades');
          if (localData) {
            try {
              results = JSON.parse(localData);
            } catch {
              results = [];
            }
          } else {
            results = [];
          }
        }
        // Sort descending by trade date
        results.sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime());
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    const raw = localStorage.getItem('deriv_trades');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  }
}

export async function saveTrade(trade: Trade): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(trade);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    try {
      const current = await getTrades();
      const index = current.findIndex((t) => t.id === trade.id);
      if (index >= 0) {
        current[index] = trade;
      } else {
        current.unshift(trade);
      }
      localStorage.setItem('deriv_trades', JSON.stringify(current));
    } catch {
      // Handle quota error
    }
  }
}

export async function deleteTrade(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const current = (await getTrades()).filter((t) => t.id !== id);
    localStorage.setItem('deriv_trades', JSON.stringify(current));
  }
}

export async function clearAllTrades(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Ignore error
  }
  localStorage.removeItem('deriv_trades');
}
