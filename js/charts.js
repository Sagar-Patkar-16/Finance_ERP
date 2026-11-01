/* ============================================================
   Chart wrappers — Chart.js via CDN (loaded in each page's HTML)
   All charts use tokens for consistent theming.
   ============================================================ */
import { fmtCurrencyINR } from './format.js';

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: cssVar('--text-muted'), font: { family: 'Inter', size: 12 }, boxWidth: 10, boxHeight: 10, usePointStyle: true } },
    tooltip: { backgroundColor: cssVar('--text'), titleColor: '#fff', bodyColor: '#fff', padding: 10, cornerRadius: 6 }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: cssVar('--text-muted'), font: { family: 'Inter', size: 11 } } },
    y: { grid: { color: cssVar('--border') }, ticks: { color: cssVar('--text-muted'), font: { family: 'Inter', size: 11 } } }
  }
};

const registry = new Map();

export function lineChart(canvasId, { labels, datasets }) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  if (registry.has(canvasId)) registry.get(canvasId).destroy();
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map(d => ({
        label: d.label,
        data: d.data,
        borderColor: d.color || cssVar('--chart-1'),
        backgroundColor: d.fill ? (d.color || cssVar('--chart-1')) + '20' : 'transparent',
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        fill: !!d.fill,
        spanGaps: true,
        borderDash: d.dashed ? [5, 5] : [],
      }))
    },
    options: { ...BASE_OPTS }
  });
  registry.set(canvasId, chart);
  return chart;
}

export function barChart(canvasId, { labels, datasets, horizontal = false }) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  if (registry.has(canvasId)) registry.get(canvasId).destroy();
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map(d => ({
        label: d.label,
        data: d.data,
        backgroundColor: d.color || cssVar('--chart-1'),
        borderRadius: 6,
        barThickness: d.thickness || 20,
      }))
    },
    options: { ...BASE_OPTS, indexAxis: horizontal ? 'y' : 'x' }
  });
  registry.set(canvasId, chart);
  return chart;
}

export function doughnutChart(canvasId, { labels, data, colors }) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  if (registry.has(canvasId)) registry.get(canvasId).destroy();
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { ...BASE_OPTS.plugins, legend: { position: 'bottom', labels: BASE_OPTS.plugins.legend.labels } }
    }
  });
  registry.set(canvasId, chart);
  return chart;
}

/* Waterfall for cash flow (§5.1.F) */
export function waterfallChart(canvasId, { labels, values }) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  if (registry.has(canvasId)) registry.get(canvasId).destroy();

  // compute cumulative for floating bars
  let cum = 0;
  const base = [], up = [], down = [], totals = [];
  values.forEach((v, i) => {
    const isTotal = i === 0 || i === values.length - 1;
    if (isTotal) {
      base.push(0); up.push(v); down.push(0); totals.push(true);
      cum = v;
    } else {
      if (v >= 0) { base.push(cum); up.push(v); down.push(0); }
      else { base.push(cum + v); up.push(0); down.push(-v); }
      cum += v; totals.push(false);
    }
  });

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'base', data: base, backgroundColor: 'transparent', stack: 'w' },
        { label: 'Increase', data: up, backgroundColor: cssVar('--success'), stack: 'w', borderRadius: 4 },
        { label: 'Decrease', data: down, backgroundColor: cssVar('--critical'), stack: 'w', borderRadius: 4 },
      ]
    },
    options: {
      ...BASE_OPTS,
      plugins: { ...BASE_OPTS.plugins, legend: { display: false }, tooltip: {
        callbacks: { label: (ctx) => ctx.dataset.label === 'base' ? null : `${ctx.dataset.label}: ${fmtCurrencyINR(ctx.raw)}` }
      }},
      scales: { ...BASE_OPTS.scales, y: { ...BASE_OPTS.scales.y, ticks: { ...BASE_OPTS.scales.y.ticks, callback: v => fmtCurrencyINR(v) } } }
    }
  });
  registry.set(canvasId, chart);
  return chart;
}

/* Stacked horizontal for capacity (§5.6) */
export function stackedBar(canvasId, { labels, datasets }) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  if (registry.has(canvasId)) registry.get(canvasId).destroy();
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map(d => ({
        label: d.label,
        data: d.data,
        backgroundColor: d.color,
        borderRadius: 4,
        barThickness: 22,
      }))
    },
    options: {
      ...BASE_OPTS,
      indexAxis: 'y',
      scales: {
        ...BASE_OPTS.scales,
        x: { ...BASE_OPTS.scales.x, stacked: true, max: 100 },
        y: { ...BASE_OPTS.scales.y, stacked: true }
      }
    }
  });
  registry.set(canvasId, chart);
  return chart;
}

/* Horizontal bar for RFQ comparison / demand ranking */
export function hBarChart(canvasId, { labels, data, colors }) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  if (registry.has(canvasId)) registry.get(canvasId).destroy();
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors || cssVar('--chart-1'),
        borderRadius: 6,
        barThickness: 22,
      }]
    },
    options: {
      ...BASE_OPTS,
      indexAxis: 'y',
      plugins: { ...BASE_OPTS.plugins, legend: { display: false } },
      scales: {
        x: { ...BASE_OPTS.scales.x, grid: { color: cssVar('--border') } },
        y: { ...BASE_OPTS.scales.y, grid: { display: false } }
      }
    }
  });
  registry.set(canvasId, chart);
  return chart;
}