const FERIADOS_2026 = {
    '2026-01-01': 'Confraternização Universal',
    '2026-02-16': 'Carnaval',
    '2026-02-17': 'Carnaval',
    '2026-02-18': 'Quarta-feira de Cinzas',
    '2026-04-03': 'Sexta-feira Santa',
    '2026-04-05': 'Páscoa',
    '2026-04-21': 'Tiradentes',
    '2026-05-01': 'Dia do Trabalho',
    '2026-06-04': 'Corpus Christi',
    '2026-09-07': 'Independência do Brasil',
    '2026-10-12': 'Nossa Senhora Aparecida / Dia das Crianças',
    '2026-11-02': 'Finados',
    '2026-11-15': 'Proclamação da República',
    '2026-11-20': 'Dia da Consciência Negra',
    '2026-12-25': 'Natal'
};

document.addEventListener('DOMContentLoaded', () => {
    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker Registrado!'))
            .catch(err => console.log('SW Falhou:', err));
    }

    feather.replace();
    setupNavigation();
    renderData();
    setupFilters();
    loadPreferences(); // Load saved WhatsApp settings
    initCalendar(); // New init

    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            closeModals();
        }
    });

    document.addEventListener('festasUpdated', () => {
        renderFestas();
        renderCalendar(); // Re-render to show new event dots
        updateDashboardCounts();
        renderDashboardPreview();
    });
    document.addEventListener('tarefasUpdated', () => {
        renderTarefas();
        updateDashboardCounts();
    });
});

window.navTo = function (targetId) {
    showSection(targetId);
}

// --- MODAL & CRUD LOGIC ---

// --- FESTAS ---
window.openPartyModal = function (id = null) {
    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-festa');
    const title = document.getElementById('modal-festa-title');
    const form = document.getElementById('form-festa');

    form.reset(); // Clear previous data

    if (id) {
        // Edit Mode
        const festa = Store.getFestas().find(f => String(f.id) === String(id));
        if (!festa) return;

        title.innerText = 'Editar Festa';
        document.getElementById('festa-id').value = id;
        document.getElementById('festa-nome').value = festa.nome;
        document.getElementById('festa-responsavel').value = festa.responsavel || '';
        document.getElementById('festa-data').value = festa.data;
        document.getElementById('festa-hora').value = festa.hora;
        document.getElementById('festa-telefone').value = festa.telefone || '';
        document.getElementById('festa-status').value = festa.status || 'neutral';
        document.getElementById('festa-idade').value = festa.idade ? festa.idade.replace(' anos', '') : '';
        document.getElementById('festa-criancas').value = festa.criancas || '';
        document.getElementById('festa-local').value = festa.local || '';
        document.getElementById('festa-obs').value = festa.obs || '';
    } else {
        // Create Mode
        title.innerText = 'Nova Festa';
        document.getElementById('festa-id').value = '';
        document.getElementById('form-festa').reset(); // Ensure all new fields are clear
    }

    // Toggle Visibility
    modal.classList.add('active');
    document.getElementById('modal-tarefa').style.display = 'none';
    modalContent.style.display = 'flex';
}

window.editarFesta = function (id) {
    openPartyModal(id);
}

window.excluirFesta = function (id) {
    if (confirm('Tem certeza que deseja excluir esta festa?')) {
        Store.deleteFesta(id);
    }
}

document.getElementById('form-festa').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('festa-id').value;

    // Status Logic for Label
    const statusVal = document.getElementById('festa-status').value;
    let statusLabel = 'Pendente';
    if (statusVal === 'warning') statusLabel = 'Planejamento';
    if (statusVal === 'success') statusLabel = 'Confirmada';
    if (statusVal === 'dark') statusLabel = 'Realizada';

    const festaData = {
        id: id || undefined, // undefined lets Store generate ID
        nome: document.getElementById('festa-nome').value,
        responsavel: document.getElementById('festa-responsavel').value,
        data: document.getElementById('festa-data').value,
        hora: document.getElementById('festa-hora').value,
        telefone: document.getElementById('festa-telefone').value,
        status: statusVal,
        statusLabel: statusLabel,
        idade: document.getElementById('festa-idade').value + ' anos',
        criancas: document.getElementById('festa-criancas').value,
        local: document.getElementById('festa-local').value,
        obs: document.getElementById('festa-obs').value
    };

    if (id) {
        Store.updateFesta(festaData);
    } else {
        Store.addFesta(festaData);
    }

    closeModals();
});


// --- TAREFAS ---
window.openTaskModal = function (id = null) {
    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-tarefa');
    const title = document.getElementById('modal-tarefa-title');
    const form = document.getElementById('form-tarefa');

    form.reset();

    if (id) {
        const tarefa = Store.getTarefas().find(t => String(t.id) === String(id));
        if (!tarefa) return;
        title.innerText = 'Editar Tarefa';
        document.getElementById('tarefa-id').value = tarefa.id;
        document.getElementById('tarefa-titulo').value = tarefa.titulo;
        document.getElementById('tarefa-prazo').value = tarefa.prazo || '';
    } else {
        title.innerText = 'Nova Tarefa';
        document.getElementById('tarefa-id').value = '';
        
        // Data formatada para YYYY-MM-DD usando offset local
        const hoje = new Date();
        const offset = hoje.getTimezoneOffset() * 60000;
        const dataLocal = new Date(hoje.getTime() - offset).toISOString().split('T')[0];
        document.getElementById('tarefa-prazo').value = dataLocal;
    }

    modal.classList.add('active');
    document.getElementById('modal-festa').style.display = 'none';
    modalContent.style.display = 'flex';
}

window.editarTarefa = function (id) {
    openTaskModal(id);
}

window.excluirTarefa = function (id) {
    if (confirm('Excluir esta tarefa?')) {
        Store.deleteTarefa(id);
    }
}

document.getElementById('form-tarefa').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('tarefa-id').value;
    const tarefaData = {
        id: id || undefined,
        titulo: document.getElementById('tarefa-titulo').value,
        prazo: document.getElementById('tarefa-prazo').value || '',
        // Preserves 'feita' status if updating, or defaults to false in Store if new
    };

    if (id) {
        const existing = Store.getTarefas().find(t => String(t.id) === String(id));
        if (existing) tarefaData.feita = existing.feita; // Keep checked status
        Store.updateTarefa(tarefaData);
    } else {
        Store.addTarefa(tarefaData);
    }
    closeModals();
});


window.closeModals = function () {
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('active');
    // slight delay to clear content display for animation reset
    setTimeout(() => {
        document.getElementById('modal-festa').style.display = 'none';
        document.getElementById('modal-tarefa').style.display = 'none';
    }, 200);
}


// --- DOM HELPERS ---

const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');

function setupNavigation() {
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            if (targetId) showSection(targetId);
        });
    });
}

function showSection(targetId) {
    contentSections.forEach(sec => sec.classList.remove('active'));
    menuItems.forEach(item => item.classList.remove('active'));

    const targetSection = document.getElementById(targetId);
    if (targetSection) targetSection.classList.add('active');

    const activeBtn = document.querySelector(`.menu-item[data-target="${targetId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

function renderData() {
    renderFestas();
    renderTarefas();
    updateDashboardCounts();
    renderDashboardPreview();
}

function renderDashboardPreview() {
    const hoje = new Date().toISOString().slice(0, 10);
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    let festas = Store.getFestas();

    // Saudação e data
    const greetEl = document.getElementById('dash-greeting');
    const dateEl = document.getElementById('dash-date-label');
    if (greetEl) {
        const h = new Date().getHours();
        const emoji = h < 12 ? '☀️' : h < 18 ? '🌤️' : '🌙';
        greetEl.textContent = emoji;
    }
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    // Próximas festas (date >= hoje, excluindo realizadas)
    const proximas = festas
        .filter(f => f.data >= hoje)
        .sort((a, b) => new Date(a.data) - new Date(b.data));

    // Realizadas (date < hoje), mais recentes primeiro
    const realizadas = festas
        .filter(f => f.data < hoje)
        .sort((a, b) => new Date(b.data) - new Date(a.data));

    // --- SPOTLIGHT: próxima festa ---
    const spotEl = document.getElementById('dash-spotlight');
    if (spotEl) {
        if (proximas.length > 0) {
            const next = proximas[0];
            const dateObj = new Date(next.data + 'T12:00:00');
            const diffDays = Math.ceil((dateObj - new Date()) / (1000 * 60 * 60 * 24));
            const diffLabel = diffDays === 0 ? '🎉 Hoje!' : diffDays === 1 ? 'Amanhã' : `Em ${diffDays} dias`;
            spotEl.innerHTML = `
            <div class="dash-spotlight-card" onclick="navTo('parties')">
                <div class="spotlight-left">
                    <span class="spotlight-tag">Próxima Festa</span>
                    <h2 class="spotlight-name">${next.nome}</h2>
                    <p class="spotlight-info">
                        <i data-feather="user" style="width:13px;height:13px"></i> ${next.responsavel || '-'}
                        &nbsp;•&nbsp;
                        <i data-feather="map-pin" style="width:13px;height:13px"></i> ${next.local || 'Local não definido'}
                    </p>
                </div>
                <div class="spotlight-right">
                    <div class="spotlight-date-block">
                        <span class="spotlight-day">${dateObj.getDate()}</span>
                        <span class="spotlight-month">${months[dateObj.getMonth()]}</span>
                    </div>
                    <div class="spotlight-meta">
                        <span class="spotlight-time"><i data-feather="clock" style="width:12px;height:12px"></i> ${next.hora}</span>
                        <span class="spotlight-diff">${diffLabel}</span>
                        <span class="spotlight-kids"><i data-feather="users" style="width:12px;height:12px"></i> ${next.criancas || '-'} crianças</span>
                    </div>
                </div>
            </div>`;
        } else {
            spotEl.innerHTML = '';
        }
    }

    // --- LISTA DE PRÓXIMAS FESTAS ---
    const container = document.getElementById('dashboard-preview-list');
    if (container) {
        if (proximas.length === 0) {
            container.innerHTML = `<div class="dash-empty"><i data-feather="calendar"></i><p>Nenhuma festa próxima</p></div>`;
        } else {
            container.innerHTML = proximas.map(f => {
                const dateObj = new Date(f.data + 'T12:00:00');
                const day = dateObj.getDate();
                const month = months[dateObj.getMonth()];
                const statusClass = f.status === 'success' ? 'kpi-green' : f.status === 'warning' ? 'kpi-yellow' : 'kpi-gray-soft';
                const statusText = f.statusLabel || 'Pendente';
                return `
                <div class="dash-festa-row" onclick="navTo('parties')">
                    <div class="dfr-date">
                        <span class="dfr-day">${day}</span>
                        <span class="dfr-month">${month}</span>
                    </div>
                    <div class="dfr-info">
                        <span class="dfr-name">${f.nome}</span>
                        <span class="dfr-sub">${f.responsavel || ''} • ${f.hora || '--:--'} • ${f.criancas || '-'} crianças</span>
                    </div>
                    <span class="dfr-badge ${statusClass}">${statusText}</span>
                </div>`;
            }).join('');
        }
    }

    // --- ÚLTIMAS REALIZADAS ---
    const realEl = document.getElementById('dash-realizadas-list');
    if (realEl) {
        const ultimas = realizadas.slice(0, 4);
        if (ultimas.length === 0) {
            realEl.innerHTML = `<p style="color:var(--text-muted);font-size:0.82rem">Nenhuma festa realizada ainda.</p>`;
        } else {
            realEl.innerHTML = ultimas.map(f => {
                const dateObj = new Date(f.data + 'T12:00:00');
                const day = dateObj.getDate();
                const month = months[dateObj.getMonth()];
                return `
                <div class="dash-real-row">
                    <span class="dash-real-date">${day} ${month}</span>
                    <span class="dash-real-name">${f.nome}</span>
                    <span class="dash-real-resp">${f.responsavel || ''}</span>
                </div>`;
            }).join('');
        }
    }

    // --- INSIGHTS ANUAIS ---
    const chartEl = document.getElementById('dash-insights-chart');
    if (chartEl) {
        const now = new Date();
        const monthlyCounts = [];
        let maxCount = 0;
        
        // Vamos pegar os últimos 7 meses para formar as colunas
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const m = date.getMonth();
            const y = date.getFullYear();
            
            const count = festas.filter(f => {
                const fd = new Date(f.data + 'T12:00:00');
                if(isNaN(fd.getTime())) return false; 
                return fd.getMonth() === m && fd.getFullYear() === y;
            }).length;
            
            if (count > maxCount) maxCount = count;
            
            monthlyCounts.push({
                label: months[m].substring(0,3).toUpperCase(),
                count: count,
                isCurrent: i === 0
            });
        }
        
        if (maxCount === 0) maxCount = 1; // prevent divide by zero
        
        chartEl.innerHTML = monthlyCounts.map(m => {
            const heightPercent = Math.max((m.count / maxCount) * 100, 5); // min 5% height
            const hlClass = m.isCurrent ? 'highlight' : '';
            return `
            <div class="chart-bar-wrap ${hlClass}" title="${m.count} festas em ${m.label}">
                <div class="chart-bar" style="height: ${heightPercent}%"></div>
                <span class="chart-label">${m.label}</span>
            </div>`;
        }).join('');
        
        // Comparativo (Mes atual vs Mes anterior)
        const curMonth = monthlyCounts[6].count;
        const prevMonth = monthlyCounts[5].count;
        const trendEl = document.getElementById('insights-trend');
        
        if (trendEl) {
            if (prevMonth > 0) {
                const perc = Math.round(((curMonth - prevMonth) / prevMonth) * 100);
                const signal = perc >= 0 ? '+' : '';
                trendEl.innerText = `${signal}${perc}% vs ${monthlyCounts[5].label}`;
                trendEl.style.color = perc >= 0 ? 'var(--accent)' : 'var(--danger)';
            } else if (curMonth > 0) {
                trendEl.innerText = `Em Alta!`;
            } else {
                trendEl.innerText = `Sem Dados`;
            }
        }
    }

    feather.replace();
}

/**
 * --- CALENDAR LOGIC ---
 */
let currentCalDate = new Date(2026, 0, 19); // Start at Jan 2026 as per prompt, or use new Date()
let selectedDate = new Date(2026, 0, 19);

function initCalendar() {
    document.getElementById('prev-month').addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('next-month').addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
    renderDayDetails(selectedDate);
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('calendar-title');
    const festas = Store.getFestas();

    // Set Title (Ex: Janeiro 2026)
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    title.innerText = `${monthNames[currentCalDate.getMonth()]} ${currentCalDate.getFullYear()}`;

    grid.innerHTML = '';

    // Logic for days
    const firstDayOfMonth = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Padding days (previous month)
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)

    for (let i = 0; i < startingDayOfWeek; i++) {
        const day = document.createElement('div');
        day.classList.add('calendar-day', 'prev-month');
        // Optional: show number of prev month day? Keeping empty for simplicity or calculate needed.
        grid.appendChild(day);
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.classList.add('calendar-day');
        day.innerText = i;

        // Construct date string YYYY-MM-DD for comparison
        const monthStr = (currentCalDate.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = i.toString().padStart(2, '0');
        const dateString = `${currentCalDate.getFullYear()}-${monthStr}-${dayStr}`;

        // Check for events
        const hasEvent = festas.some(f => f.data === dateString);
        if (hasEvent) day.classList.add('has-event');

        // Check for holidays
        if (FERIADOS_2026[dateString]) {
            day.classList.add('is-holiday');
            day.title = FERIADOS_2026[dateString];
        }

        // Check selected
        if (selectedDate &&
            selectedDate.getDate() === i &&
            selectedDate.getMonth() === currentCalDate.getMonth() &&
            selectedDate.getFullYear() === currentCalDate.getFullYear()) {
            day.classList.add('selected');
        }

        // Click Handler
        day.addEventListener('click', () => {
            selectedDate = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth(), i);
            renderCalendar(); // Re-render to update selected class
            renderDayDetails(selectedDate);
        });

        grid.appendChild(day);
    }
}

function renderDayDetails(date) {
    const container = document.getElementById('day-details-content');
    if (!container) return;

    const festas = Store.getFestas();
    const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = date.getDate().toString().padStart(2, '0');
    const dateString = `${date.getFullYear()}-${monthStr}-${dayStr}`;

    container.innerHTML = `<h2 id="selected-date-title" style="font-size: 1.35rem; font-weight: 700; color: #fff; margin-bottom: 1.5rem; text-align: center;">${formatDate(dateString)}</h2>`;

    // Check for Holiday
    if (FERIADOS_2026[dateString]) {
        container.innerHTML += `
            <div class="holiday-banner" style="background: rgba(248, 113, 113, 0.15); border: 1px solid rgba(248, 113, 113, 0.3); color: #f87171; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; text-align: center; font-weight: 600; font-size: 0.9rem;">
                <i data-feather="star" style="width:14px; height:14px; margin-right:4px; vertical-align: middle;"></i>
                Feriado: ${FERIADOS_2026[dateString]}
            </div>
        `;
    }

    const dayFestas = festas.filter(f => f.data === dateString);

    if (dayFestas.length === 0) {
        container.innerHTML += `
            <div class="empty-day-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 2rem; color: var(--text-secondary); text-align: center;">
                <i data-feather="calendar" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.2;"></i>
                <p>Nenhuma festa agendada para este dia.</p>
            </div>
        `;
        feather.replace();
        return;
    }
    const eventsHtml = dayFestas.map(f => `
            <div class="cal-event-card">
                <h4>${f.nome}</h4>
                <p>${f.hora} • ${f.local || 'Local não definido'}</p>
                <span class="cal-event-status">${f.statusLabel || 'Confirmado'}</span>
            </div>
        `).join('');

    container.innerHTML += `
            <div style="margin-top: 1rem;">
                ${eventsHtml}
            </div>
        `;
    feather.replace();
}

/**
 * --- EXISTING FUNCTIONS ---
 */

// --- FILTERS & SEARCH STATE ---
let currentSearch = '';
let currentFilter = 'proximas';

function setupFilters() {
    const searchInput = document.getElementById('party-search');
    const filterBtns = document.querySelectorAll('.filter-chip');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            renderFestas();
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');

            currentFilter = btn.getAttribute('data-filter');
            renderFestas();
        });
    });
}

// --- HELPERS ---
function maskPhone(phone) {
    if (!phone) return '-';
    // Remove all non-digits
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 2) return phone;
    // Keep first 2 digits, mask the rest
    return clean.substring(0, 2) + '*'.repeat(clean.length - 2);
}

function renderFestas() {
    let festas = Store.getFestas();
    const container = document.getElementById('lista-festas');
    if (!container) return;

    // Sort by date ascending
    festas.sort((a, b) => new Date(a.data) - new Date(b.data));

    // --- FILTER & SEARCH LOGIC ---
    // 1. Filter by Status
    if (currentFilter === 'proximas') {
        // Mostra só festas com data >= hoje (independente do status)
        const hoje = new Date().toISOString().slice(0, 10);
        festas = festas.filter(f => f.data >= hoje);
    } else if (currentFilter === 'confirmada') {
        festas = festas.filter(f => f.status === 'success');
    } else if (currentFilter === 'pendente') {
        festas = festas.filter(f => f.status === 'neutral' || f.status === 'warning');
    } else if (currentFilter === 'realizada') {
        festas = festas.filter(f => f.status === 'dark');
    }
    // 'all' = sem filtro de status

    // 2. Filter by Search (Name or Responsible)
    if (currentSearch) {
        festas = festas.filter(f =>
            f.nome.toLowerCase().includes(currentSearch) ||
            (f.responsavel && f.responsavel.toLowerCase().includes(currentSearch))
        );
    }
    // ----------------------------

    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '0.5rem';

    if (festas.length === 0) {
        const msg = currentFilter === 'proximas'
            ? 'Nenhuma festa futura agendada. 🎉'
            : currentFilter === 'realizada'
            ? 'Nenhuma festa realizada ainda.'
            : (currentSearch || currentFilter !== 'all')
            ? 'Nenhuma festa encontrada para sua busca.'
            : 'Nenhuma festa cadastrada.';
        container.innerHTML = `<div class="card empty-state-card" style="text-align: center;"><p>${msg}</p></div>`;
        return;
    }

    container.innerHTML = festas.map(f => {
        const dateObj = new Date(f.data + 'T12:00:00');
        return `
        <div class="party-row">
            <div class="row-date-box">
                <span class="day">${dateObj.getDate().toString().padStart(2, '0')}</span>
                <span class="month">${dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
            </div>
            
            <div class="row-info-col title-col">
                <h3 class="row-title">${f.nome}</h3>
                <p class="row-subtitle">${f.responsavel || 'Sem responsável'} &mdash; ${f.idade ? f.idade.replace(' anos', '') + ' anos' : 'Evento'}</p>
            </div>

            <div class="row-info-col time-col">
                <div class="stat-item">
                    <i data-feather="clock"></i>
                    <span>${f.hora || '--:--'}</span>
                </div>
                <div class="stat-item phone-desktop">
                    <i data-feather="phone"></i>
                    <span>${maskPhone(f.telefone)}</span>
                </div>
            </div>

            <div class="row-info-col guests-col">
                <div class="stat-item">
                    <i data-feather="users"></i>
                    <span>${f.criancas || '-'} conv.</span>
                </div>
                <span class="row-badge ${f.status || 'neutral'}">${(f.statusLabel || 'PENDENTE').toUpperCase()}</span>
            </div>

            <div class="row-actions">
                <button class="row-btn whatsapp" onclick="sendWhatsapp('${f.id}')" title="WhatsApp">
                    <i data-feather="message-square"></i>
                </button>
                <button class="row-btn map" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.local || '')}', '_blank')" title="Ver Mapa" ${!f.local ? 'style="opacity:0.3;pointer-events:none;"' : ''}>
                    <i data-feather="map"></i>
                </button>
                <button class="row-btn edit" onclick="editarFesta('${f.id}')" title="Editar">
                    <i data-feather="edit-2"></i>
                </button>
                <button class="row-btn delete" onclick="excluirFesta('${f.id}')" title="Excluir">
                    <i data-feather="trash-2"></i>
                </button>
            </div>
        </div>
    `}).join('');
    feather.replace();
}

const DEFAULT_TEMPLATE = `Olá, [responsavel]! ✨
Hoje é um dia muito especial! 🥳🎉

A equipe Anima Art está a caminho para celebrar o aniversário da [nome]! 🦄🎈
Preparamos tudo com muito carinho para levar diversão, animação e momentos inesquecíveis 💖

📍 Local: [local]
⏰ Horário: [hora]

Em breve estaremos aí! Qualquer coisa, é só nos chamar 😊🎶`;

window.sendWhatsapp = function (id) {
    const festa = Store.getFestas().find(f => String(f.id) === String(id));
    if (!festa) return;

    let template = localStorage.getItem('hubfest_template');
    if (!template) template = DEFAULT_TEMPLATE;

    // Replace Placeholders
    const texto = template
        .replace(/\[nome\]/g, festa.nome)
        .replace(/\[responsavel\]/g, festa.responsavel || 'Cliente')
        .replace(/\[local\]/g, festa.local || 'Endereço da Festa')
        .replace(/\[data\]/g, formatDate(festa.data))
        .replace(/\[hora\]/g, festa.hora)
        .replace(/\[idade\]/g, festa.idade || '');

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}


// --- THEME SYSTEM ---
window.setTheme = function (theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }

    localStorage.setItem('hubfest_theme', theme);
    updateThemeButtons(theme);
}

function updateThemeButtons(theme) {
    const btnLight = document.getElementById('btn-theme-light');
    const btnDark = document.getElementById('btn-theme-dark');
    if (!btnLight || !btnDark) return;

    if (theme === 'light') {
        btnLight.classList.add('primary');
        btnDark.classList.remove('primary');
    } else {
        btnDark.classList.add('primary');
        btnLight.classList.remove('primary');
    }
}

// --- CONFIG LOGIC ---
window.savePreferences = function () {
    const template = document.getElementById('config-template').value;
    localStorage.setItem('hubfest_template', template);
}

window.loadPreferences = function () {
    // Load Theme
    let theme = localStorage.getItem('hubfest_theme') || 'dark';
    setTheme(theme);

    // Load Template
    let template = localStorage.getItem('hubfest_template');
    if (!template) template = DEFAULT_TEMPLATE;

    const templateInput = document.getElementById('config-template');
    if (templateInput) templateInput.value = template;
}

window.resetTemplate = function () {
    if (confirm('Restaurar o modelo de mensagem original?')) {
        document.getElementById('config-template').value = DEFAULT_TEMPLATE;
        savePreferences();
    }
}

function renderTarefas() {
    const tarefas = Store.getTarefas();
    const pendentes = tarefas.filter(t => !t.feita);
    const concluidas = tarefas.filter(t => t.feita);

    const elPendentes = document.getElementById('lista-tarefas-pendentes');
    const elConcluidas = document.getElementById('lista-tarefas-feitas');
    const elCountTodo = document.getElementById('count-todo');
    const elCountDone = document.getElementById('count-done');

    if (!elPendentes || !elConcluidas) return;

    if (elCountTodo) elCountTodo.innerText = pendentes.length;
    if (elCountDone) elCountDone.innerText = concluidas.length;

    const renderCard = (t) => `
        <div class="kanban-card ${t.feita ? 'task-done' : ''}" 
             id="task-card-${t.id}" 
             draggable="true" 
             ondragstart="dragTask(event)">
            
            <div class="kanban-card-header">
                <div class="kanban-card-title">${t.titulo}</div>
                <button class="kanban-btn-action done-mark" onclick="toggleTask('${t.id}')" title="${t.feita ? 'Reabrir' : 'Concluir'}">
                    <i data-feather="${t.feita ? 'rotate-ccw' : 'check'}"></i>
                </button>
            </div>
            
            <div class="kanban-card-footer">
                <div class="kanban-meta-group">
                    ${t.festaId ? `<div class="kanban-card-meta"><i data-feather="star"></i> Vinculada</div>` : ''}
                    ${t.prazo ? `<div class="kanban-card-meta"><i data-feather="calendar"></i> ${formatDate(t.prazo)}</div>` : ''}
                </div>
                <div class="kanban-card-actions">
                    <button class="kanban-btn-action mini" onclick="editarTarefa('${t.id}')" title="Editar">
                        <i data-feather="edit-2"></i>
                    </button>
                    <button class="kanban-btn-action delete mini" onclick="deleteTask('${t.id}')" title="Excluir">
                        <i data-feather="trash-2"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    if (pendentes.length === 0) {
        elPendentes.innerHTML = `<div class="kanban-empty">Nenhuma tarefa a fazer. ✨</div>`;
    } else {
        elPendentes.innerHTML = pendentes.map(t => renderCard(t)).join('');
    }

    if (concluidas.length === 0) {
        elConcluidas.innerHTML = `<div class="kanban-empty">Nenhuma tarefa finalizada.</div>`;
    } else {
        elConcluidas.innerHTML = concluidas.map(t => renderCard(t)).join('');
    }

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

window.toggleTask = function (id) {
    Store.toggleTarefa(id);
}

// --- DRAG AND DROP KANBAN ---

window.allowDropTask = function (ev) {
    ev.preventDefault();
}

window.dragTask = function (ev) {
    ev.dataTransfer.setData("taskId", ev.currentTarget.id.replace('task-card-', ''));
}

window.dropTask = function (ev) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData("taskId");
    const containerId = ev.currentTarget.id; // lista-tarefas-pendentes ou lista-tarefas-feitas

    if (!taskId || !containerId) return;

    const tarefas = Store.getTarefas();
    const idx = tarefas.findIndex(t => t.id === taskId);
    if (idx === -1) return;

    // Se soltou na coluna "Concluídas" e a tarefa ainda não está concluída
    if (containerId.includes('feitas') && !tarefas[idx].feita) {
        Store.toggleTarefa(taskId);
    }
    // Se soltou na coluna "A Fazer" e a tarefa estava concluída
    else if (containerId.includes('pendentes') && tarefas[idx].feita) {
        Store.toggleTarefa(taskId);
    }
}

// --- SETTINGS LOGIC ---

window.resetAppData = function () {
    if (confirm('Tem certeza? Isso apagará TODAS as festas e tarefas.\nEsta ação não pode ser desfeita.')) {
        Store.clearAll();
        alert('Dados limpos com sucesso!');
        location.reload();
    }
}

// --- DADOS E BACKUP ---
window.factoryReset = function () {
    if (confirm('Isso apagará os dados atuais e recarregará os exemplos (Julia e Miguel).\nContinuar?')) {
        Store.clearAll();
        // data.js init runs on load if empty, so reload triggers it
        location.reload();
    }
}

window.exportAppData = function () {
    const data = {
        festas: Store.getFestas(),
        tarefas: Store.getTarefas(),
        version: '1.0.0',
        date: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "hubfest_backup_" + new Date().toISOString().slice(0, 10) + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

window.triggerImport = function () {
    document.getElementById('import-file').click();
}

window.importAppData = function (input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            if (confirm(`Restaurar backup de ${data.festas.length} festas e ${data.tarefas.length} tarefas?\nIsso substituirá os dados atuais.`)) {
                localStorage.setItem('festas', JSON.stringify(data.festas));
                localStorage.setItem('tarefas', JSON.stringify(data.tarefas));
                alert('Backup restaurado com sucesso!');
                location.reload();
            }
        } catch (err) {
            alert('Erro ao ler arquivo de backup. Certifique-se que é um arquivo .json válido do HubFest.');
            console.error(err);
        }
    };
    reader.readAsText(file);
}

function updateDashboardCounts() {
    const festas = Store.getFestas();
    const tarefas = Store.getTarefas();
    const hoje = new Date().toISOString().slice(0, 10);

    const proximasList = festas.filter(f => f.data >= hoje);
    const realizadasList = festas.filter(f => f.data < hoje);
    const confirmadas = proximasList.filter(f => f.status === 'success').length;
    const tarefasAtivas = tarefas.filter(t => !t.feita).length;

    if (document.getElementById('dash-proximas')) document.getElementById('dash-proximas').innerText = proximasList.length;
    if (document.getElementById('dash-total')) document.getElementById('dash-total').innerText = festas.length;
    if (document.getElementById('dash-ativas')) document.getElementById('dash-ativas').innerText = tarefasAtivas;
    if (document.getElementById('dash-confirmadas')) document.getElementById('dash-confirmadas').innerText = confirmadas;
    if (document.getElementById('dash-realizadas')) document.getElementById('dash-realizadas').innerText = realizadasList.length;
}


function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
}

// ========== RELATÓRIOS ==========
function gerarRelatorio(tipo) {
    const hoje = new Date().toISOString().slice(0, 10);
    const festas = Store.getFestas();
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    let lista, titulo, subtitulo;
    if (tipo === 'proximas') {
        lista = festas.filter(f => f.data >= hoje).sort((a,b) => new Date(a.data) - new Date(b.data));
        titulo = 'Relatório de Próximas Festas';
        subtitulo = `Festas a partir de ${new Date().toLocaleDateString('pt-BR')}`;
    } else {
        lista = festas.sort((a,b) => new Date(a.data) - new Date(b.data));
        titulo = 'Relatório Geral de Festas';
        subtitulo = `Todas as festas cadastradas na plataforma`;
    }

    const proximasCount = festas.filter(f => f.data >= hoje).length;
    const realizadasCount = festas.filter(f => f.data < hoje).length;
    const confirmadasCount = festas.filter(f => f.data >= hoje && f.status === 'success').length;

    const rows = lista.map((f, i) => {
        const d = new Date(f.data + 'T12:00:00');
        const isPast = f.data < hoje;
        const statusText = isPast ? 'Realizada' : (f.status === 'success' ? 'Confirmada' : 'Pendente');
        const statusColor = isPast ? '#94a3b8' : (f.status === 'success' ? '#10b981' : '#f59e0b');
        const phone = f.telefone ? f.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : '-';
        return `
        <tr style="${isPast ? 'opacity:0.7' : ''}">
            <td style="text-align:center;font-weight:700;color:#64748b">${i+1}</td>
            <td><strong>${f.nome}</strong></td>
            <td>${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}</td>
            <td>${f.hora || '-'}</td>
            <td>${f.responsavel || '-'}</td>
            <td>${phone}</td>
            <td>${f.criancas || '-'}</td>
            <td>${f.local || '-'}</td>
            <td><span style="background:${statusColor}15;color:${statusColor};padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600">${statusText}</span></td>
        </tr>`;
    }).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${titulo} - HubFest</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', system-ui, sans-serif; background: #fff; color: #1e293b; padding: 30px 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #0ea5e9; padding-bottom: 16px; }
            .header h1 { font-size: 20px; color: #0f172a; }
            .header p { font-size: 12px; color: #64748b; margin-top: 4px; }
            .header .date { font-size: 11px; color: #94a3b8; text-align: right; }
            .kpis { display: flex; gap: 12px; margin-bottom: 20px; }
            .kpi { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
            .kpi .num { font-size: 24px; font-weight: 800; color: #0f172a; }
            .kpi .lbl { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; padding: 8px 10px; text-align: left; border-bottom: 2px solid #e2e8f0; }
            td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
            tr:hover { background: #f8fafc; }
            .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
            @media print {
                body { padding: 15px 20px; }
                .no-print { display: none !important; }
            }
        </style>
    </head>
    <body>
        <div class="no-print" style="margin-bottom:16px;text-align:right">
            <button onclick="window.print()" style="background:#0ea5e9;color:#fff;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px">🖨️ Imprimir / Salvar PDF</button>
        </div>
        <div class="header">
            <div>
                <h1>🎉 ${titulo}</h1>
                <p>${subtitulo}</p>
            </div>
            <div class="date">
                <div>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}</div>
                <div style="margin-top:4px;font-weight:600;color:#0f172a">${lista.length} festas listadas</div>
            </div>
        </div>
        <div class="kpis">
            <div class="kpi"><div class="num">${festas.length}</div><div class="lbl">Total</div></div>
            <div class="kpi"><div class="num" style="color:#0ea5e9">${proximasCount}</div><div class="lbl">Próximas</div></div>
            <div class="kpi"><div class="num" style="color:#10b981">${confirmadasCount}</div><div class="lbl">Confirmadas</div></div>
            <div class="kpi"><div class="num" style="color:#94a3b8">${realizadasCount}</div><div class="lbl">Realizadas</div></div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>#</th><th>Aniversariante</th><th>Data</th><th>Hora</th>
                    <th>Responsável</th><th>Telefone</th><th>Crianças</th><th>Local</th><th>Status</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <div class="footer">
            <span>HubFest - Gestão de Eventos</span>
            <span>Página 1</span>
        </div>
    </body>
    </html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
}
