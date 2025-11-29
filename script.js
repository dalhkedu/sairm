// SAIRM Application Logic
const DATA_URL = './dashboard_data.json';
let charts = {};
let lastUpdatedTimestamp = null;

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    // Initial fetch
    updateDashboard();
    // Poll every 60s
    setInterval(updateDashboard, 60000);
});

async function updateDashboard() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error("Waiting for data stream...");
        const data = await response.json();
        const currentTimestamp = data.metadata?.last_updated;

        // 1. Update Text Elements & Lists
        if (data.metadata) {
            const statusEl = document.getElementById('last-updated');
            if (statusEl) statusEl.innerText = data.metadata.last_updated;
        }
        if (data.market_ticker) updateTickerUI(data.market_ticker);
        if (data.news_feed) updateNewsFeed(data.news_feed);

        // 2. Update Table (Agora lê do JSON)
        if (data.market_matrix) updateTable(data.market_matrix);

        // 3. Update Charts & Metrics
        if (data.dashboard_metrics) {
            updateMetricsAndCharts(data.dashboard_metrics);
            lastUpdatedTimestamp = currentTimestamp;
        }

    } catch (error) {
        console.error("Data fetch error:", error);
    }
}

// --- ESSA É A FUNÇÃO QUE FALTAVA ---
function updateMetricsAndCharts(metrics) {
    // A. Atualizar Textos (Números Grandes)
    updateText('cer-value', metrics.cer_current);
    updateText('rci-value', metrics.rci_current);

    // B. Atualizar Gráficos

    // 1. Chart CER (Linha)
    if (charts.cer && metrics.cer_history) {
        // Criar labels falsos baseados na quantidade de pontos
        const labels = metrics.cer_history.map((_, i) => `T-${metrics.cer_history.length - i}`);
        charts.cer.data.labels = labels;
        charts.cer.data.datasets[0].data = metrics.cer_history;
        charts.cer.update();
    }

    // 2. Chart RCI (Barra)
    if (charts.rci) {
        // [VC Funding Level, Cloud Revenue (Simulado fixo ou vindo do python)]
        charts.rci.data.datasets[0].data = [metrics.rci_data[0], metrics.rci_current * 100];
        charts.rci.update();
    }

    // 3. Chart HSD (Duas Linhas)
    if (charts.hsd && metrics.hsd_history_hardware) {
        const labels = metrics.hsd_history_hardware.map((_, i) => `T-${i}`);
        charts.hsd.data.labels = labels;
        charts.hsd.data.datasets[0].data = metrics.hsd_history_hardware;
        charts.hsd.data.datasets[1].data = metrics.hsd_history_software;
        charts.hsd.update();
    }

    // 4. Chart Energy (Barra)
    if (charts.energy && metrics.energy_data) {
        charts.energy.data.datasets[0].data = metrics.energy_data;
        charts.energy.update();
    }
}

// --- UI Updaters Auxiliares ---

function updateText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}

function updateTickerUI(tickers) {
    const tickerContent = document.getElementById('ticker-content');
    if (!tickerContent) return;
    let html = '';
    [...tickers, ...tickers].forEach(t => { // Duplicate for scroll
        const colorClass = t.change.includes('+') ? 'text-green' : 'text-red';
        html += `<span class="ticker-item"><span class="text-amber">${t.symbol}</span> ${t.price.toFixed(2)} <span class="${colorClass}">(${t.change})</span></span>`;
    });
    tickerContent.innerHTML = html;
}

function updateNewsFeed(newsItems) {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';
    newsItems.forEach(news => {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.innerHTML = `<span class="news-time">${news.time}</span><span class="news-tag">${news.tag}</span>${news.text}`;
        container.appendChild(div);
    });
}

function updateTable(matrixData) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    let html = '';
    matrixData.forEach(row => {
        html += `<tr>
            <td class="text-amber"><b>${row.ticker}</b></td>
            <td>${row.company}</td>
            <td>${row.cat}</td>
            <td class="${row.impact_class}">${row.impact}</td>
            <td class="${row.risk_class}">${row.risk}</td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

function initCharts() {
    Chart.defaults.color = '#8b9bb4';
    Chart.defaults.borderColor = '#2a3b55';
    Chart.defaults.font.family = "'Courier New', monospace";

    const ctxCer = document.getElementById('chart-cer');
    if (ctxCer) {
        charts.cer = new Chart(ctxCer, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Capex Efficiency', data: [], borderColor: '#ffbf00', backgroundColor: 'rgba(255, 191, 0, 0.1)', fill: true, tension: 0.4 }] },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } }
        });
    }

    const ctxRci = document.getElementById('chart-rci');
    if (ctxRci) {
        charts.rci = new Chart(ctxRci, {
            type: 'bar',
            data: { labels: ['VC Funding', 'Cloud Rev'], datasets: [{ label: 'Index', data: [], backgroundColor: ['#39ff14', '#ff073a'] }] },
            options: { indexAxis: 'y', plugins: { legend: { display: false } } }
        });
    }

    const ctxHsd = document.getElementById('chart-hsd');
    if (ctxHsd) {
        charts.hsd = new Chart(ctxHsd, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Hardware', data: [], borderColor: '#39ff14', tension: 0.3 }, { label: 'Software', data: [], borderColor: '#ff073a', borderDash: [5, 5], tension: 0.3 }] },
            options: { plugins: { legend: { position: 'bottom' } } }
        });
    }

    const ctxEnergy = document.getElementById('chart-energy');
    if (ctxEnergy) {
        charts.energy = new Chart(ctxEnergy, {
            type: 'bar',
            data: { labels: ['Vacancy %', 'MWh Price ($)'], datasets: [{ label: 'Status', data: [], backgroundColor: ['#ff073a', '#ffbf00'] }] },
            options: { plugins: { legend: { display: false } } }
        });
    }
}