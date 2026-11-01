// /* ============================================================
//    FORMAT — pure formatting helpers. No imports. Breaks circular
//    dependency between app.js and components.js.
//    ============================================================ */

// export function fmtCurrencyINR(v, compact = true) {
//   if (v == null || isNaN(v)) return '—';
//   if (compact) {
//     if (Math.abs(v) >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
//     if (Math.abs(v) >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
//     if (Math.abs(v) >= 1e3) return `₹${(v / 1e3).toFixed(1)} K`;
//   }
//   return '₹' + Number(v).toLocaleString('en-IN');
// }

// export function fmtNumber(v, d = 0) {
//   if (v == null || isNaN(v)) return '—';
//   return Number(v).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
// }

// export function fmtDate(d) {
//   if (!d) return '—';
//   const dt = new Date(d);
//   if (isNaN(dt)) return d;
//   return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
// }

// export function initials(name) {
//   return (name || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
// }

/* ============================================================
   FORMAT — International Multi-Currency, Date & Number Formatter
   ============================================================ */

export let currentCurrency = localStorage.getItem('erp-currency') || 'USD';

export function setGlobalCurrency(curr) {
  currentCurrency = curr;
  localStorage.setItem('erp-currency', curr);
}

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

const FX_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.2,
};

/**
 * Converts and formats amounts into the globally selected currency.
 * Uses international Millions (M), Billions (B), and Thousands (K).
 */
export function fmtCurrency(amount, compact = true, sourceCurrency = 'INR') {
  if (amount == null || isNaN(amount)) return '—';

  // Base normalization (prototype state data is stored in INR equivalent)
  const amountInUSD = sourceCurrency === 'INR' ? amount / FX_RATES.INR : amount;
  const targetRate = FX_RATES[currentCurrency] || 1;
  const converted = amountInUSD * targetRate;
  const symbol = CURRENCY_SYMBOLS[currentCurrency] || '$';

  const abs = Math.abs(converted);
  if (compact) {
    if (abs >= 1e9) return `${symbol}${(converted / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${symbol}${(converted / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `${symbol}${(converted / 1e3).toFixed(1)}K`;
  }

  return `${symbol}${converted.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Backward compatibility alias for existing code
export const fmtCurrencyINR = fmtCurrency;

export function fmtNumber(v, d = 0) {
  if (v == null || isNaN(v)) return '—';
  return Number(v).toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function initials(name) {
  return (name || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}