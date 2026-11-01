import { chip, icon, toast } from '../components.js';
import { db } from '../state.js';
import { fmtNumber, fmtCurrencyINR } from '../format.js';

export function register(route) {
  route('supply-chain/dashboard', renderDashboard);
}

function renderDashboard() {
  return `
    <div class="page-header">
      <div><div class="page-title">Supply Chain Planning Dashboard</div><div class="page-subtitle">Consolidated view of Forecast, MRP & Replenishment</div></div>
    </div>
    
    <div class="grid grid-charts">
      <!-- Widget 1: Demand Forecast -->
      <div class="card">
        <div class="card-header"><div class="card-title">Demand Forecast</div></div>
        <div class="card-body" style="height:240px"><canvas id="dashForecast"></canvas></div>
      </div>
      
      <!-- Widget 2: Purchase Recommendations -->
      <div class="card">
        <div class="card-header"><div class="card-title">Purchase Recommendations</div></div>
        <div class="card-body" style="padding:16px">
          <div style="background:var(--brand-primary-soft);padding:16px;border-radius:8px;margin-bottom:12px">
            <div style="color:var(--brand-primary);font-weight:600;font-size:12px;text-transform:uppercase;margin-bottom:4px">System Output</div>
            <div style="font-weight:600;font-size:15px">"Material shortage predicted for IT-100"</div>
            <div style="font-size:13px;margin-top:4px">Current Stock: 80 | Safety: 100 | Demand: 150</div>
            <div style="margin-top:12px;font-weight:600;font-size:16px;color:var(--critical)">Recommendation: Purchase 170 units</div>
            <button class="btn btn-primary btn-sm" style="margin-top:12px;width:100%" onclick="window.__navigate('purchasing/prs')">Create PR Now</button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-3" style="margin-top:20px">
      <!-- Widget 3: Material Shortages -->
      <div class="card">
        <div class="card-header"><div class="card-title">Material Shortages</div></div>
        <div class="card-body">
          ${db.items.filter(i => i.stock < i.safety).map(i => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
              <div><b>${i.code}</b><br><span class="text-muted" style="font-size:12px">${i.name}</span></div>
              <div style="text-align:right"><span style="color:var(--critical);font-weight:600">Short by ${i.safety - i.stock}</span></div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Widget 4: Production Capacity -->
      <div class="card">
        <div class="card-header"><div class="card-title">Production Capacity</div></div>
        <div class="card-body">
          ${db.workCenters.slice(0,3).map(w => {
            const pct = Math.round(w.used / w.capacity * 100);
            return `
            <div style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span>${w.id}</span><span>${pct}%</span></div>
              <div class="progress"><div class="progress-bar ${pct >= 90 ? 'critical' : 'success'}" style="width:${pct}%"></div></div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Widget 5: Supplier Lead Times -->
      <div class="card">
        <div class="card-header"><div class="card-title">Supplier Lead Times</div></div>
        <div class="card-body">
          ${db.suppliers.slice(0,3).map(s => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
              <span>${s.name}</span>
              <span style="font-weight:600">${s.actual} days <span style="color:${s.variance > 0 ? 'var(--warning)' : 'var(--success)'};font-size:11px">(${s.variance > 0 ? '+' : ''}${s.variance})</span></span>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

document.addEventListener('route-rendered', (e) => {
  if (e.detail.path !== 'supply-chain/dashboard') return;
  const canvas = document.getElementById('dashForecast');
  if (canvas && window.Chart) {
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Apr','May','Jun','Jul','Aug','Sep'],
        datasets: [{ label: 'Forecast', data: [8.4,9.1,9.6,10.0,10.9,11.2], borderColor: '#4F46E5', tension: 0.4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }
});