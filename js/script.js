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
        const festa = Store.getFestas().find(f => f.id === id);
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
        const tarefa = Store.getTarefas().find(t => t.id === id);
        if (!tarefa) return;
        title.innerText = 'Editar Tarefa';
        document.getElementById('tarefa-id').value = tarefa.id;
        document.getElementById('tarefa-titulo').value = tarefa.titulo;
    } else {
        title.innerText = 'Nova Tarefa';
        document.getElementById('tarefa-id').value = '';
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
        // Preserves 'feita' status if updating, or defaults to false in Store if new
    };

    if (id) {
        const existing = Store.getTarefas().find(t => t.id === id);
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
    const container = document.getElementById('dashboard-preview-list');
    if (!container) return;

    let festas = Store.getFestas();
    if (festas.length === 0) {
        container.innerHTML = '<div class="card" style="opacity:0.7"><p>Nenhuma festa agendada.</p></div>';
        return;
    }

    // Sort by Date (Nearest first)
    festas.sort((a, b) => new Date(a.data) - new Date(b.data));

    // Filter only future/today parties? Actually, user likely wants next ones. 
    // For now, take top 3.
    const nextFestas = festas.slice(0, 3);
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

    container.innerHTML = `<div class="preview-list">` + nextFestas.map(f => {
        const dateObj = new Date(f.data + 'T12:00:00'); // Use T12:00:00 to avoid timezone issues
        const day = dateObj.getDate();
        const month = months[dateObj.getMonth()];

        return `
        <div class="preview-item" style="cursor: pointer;" onclick="document.querySelector('.menu-item[data-target=parties]').click()">
            <div class="date-badge">
                <span class="date-day">${day}</span>
                <span class="date-month">${month}</span>
            </div>
            <div class="preview-info">
                <h4>${f.nome}</h4>
                <span><i data-feather="clock" style="width:12px;height:12px;"></i> ${f.hora || '--:--'}</span>
            </div>
            <div class="preview-status ${f.status || 'pendente'}">
                ${f.statusLabel || 'Pendente'}
            </div>
        </div>
    `}).join('') + `</div>`;

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
let currentFilter = 'all';

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

    // --- FILTER & SEARCH LOGIC ---
    // 1. Filter by Status
    if (currentFilter !== 'all') {
        if (currentFilter === 'confirmada') {
            festas = festas.filter(f => f.status === 'success');
        } else if (currentFilter === 'pendente') {
            festas = festas.filter(f => f.status === 'neutral' || f.status === 'warning');
        } else if (currentFilter === 'finalizada') {
            festas = festas.filter(f => f.status === 'dark');
        }
    }

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
        const msg = (currentSearch || currentFilter !== 'all')
            ? 'Nenhuma festa encontrada para sua busca.'
            : 'Nenhuma festa cadastrada.';
        container.innerHTML = `<div class="card empty-state-card" style="text-align: center;"><p>${msg}</p></div>`;
        return;
    }

    container.innerHTML = festas.map(f => `
        <div class="party-row">
            <div class="row-main-info">
                <div class="row-date">
                    <span class="day">${new Date(f.data + 'T12:00:00').getDate()}</span>
                    <span class="month">${new Date(f.data + 'T12:00:00').toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                </div>
                <div class="row-details">
                    <h3 class="row-title">${f.nome}</h3>
                    <p class="row-subtitle">${f.responsavel || 'Sem responsável'} • ${f.idade ? f.idade + ' anos' : 'Idade -'}</p>
                </div>
            </div>

            <div class="row-stats">
                <div class="stat-item">
                    <i data-feather="clock"></i>
                    <span>${f.hora}</span>
                </div>
                <div class="stat-item phone-desktop">
                    <i data-feather="phone"></i>
                    <span>${maskPhone(f.telefone)}</span>
                </div>
                <div class="stat-item">
                    <i data-feather="users"></i>
                    <span>${f.criancas || '-'} crian.</span>
                </div>
            </div>

            <div class="row-status-actions">
                <span class="row-badge ${f.status || 'neutral'}">${f.statusLabel || 'Geral'}</span>
                <div class="row-actions">
                    <button class="row-btn whatsapp" onclick="sendWhatsapp('${f.id}')" title="WhatsApp">
                        <i data-feather="message-circle"></i>
                    </button>
                    ${f.local ? `
                    <button class="row-btn" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.local)}', '_blank')" title="Ver Mapa">
                        <i data-feather="map-pin"></i>
                    </button>
                    ` : ''}
                    <button class="row-btn primary" onclick="editarFesta('${f.id}')" title="Editar">
                        <i data-feather="edit-2"></i>
                    </button>
                    <button class="row-btn delete" onclick="excluirFesta('${f.id}')" title="Excluir">
                        <i data-feather="trash-2"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
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
    const festa = Store.getFestas().find(f => f.id === id);
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
    const container = document.getElementById('lista-tarefas');
    if (!container) return;

    // Organizar tarefas por status
    const aFazer = tarefas.filter(t => !t.feita && !t.emProgresso);
    const emProgresso = tarefas.filter(t => t.emProgresso && !t.feita);
    const concluidas = tarefas.filter(t => t.feita);

    if (tarefas.length === 0) {
        container.innerHTML = '<div class="card empty-state-card"><p>Nenhuma tarefa pendente.</p></div>';
        return;
    }

    // Renderizar Kanban Board
    container.innerHTML = `
        <div class="kanban-board">
            <!-- Coluna: A Fazer -->
            <div class="kanban-column">
                <div class="kanban-header">
                    <h3>📋 A Fazer</h3>
                    <span class="task-count">${aFazer.length}</span>
                </div>
                <div class="kanban-tasks">
                    ${aFazer.length > 0 ? aFazer.map(t => renderTaskCard(t)).join('') : '<p class="empty-column">Nenhuma tarefa</p>'}
                </div>
            </div>
            
            <!-- Coluna: Em Progresso -->
            <div class="kanban-column progress">
                <div class="kanban-header">
                    <h3>🚀 Em Progresso</h3>
                    <span class="task-count">${emProgresso.length}</span>
                </div>
                <div class="kanban-tasks">
                    ${emProgresso.length > 0 ? emProgresso.map(t => renderTaskCard(t)).join('') : '<p class="empty-column">Nenhuma tarefa</p>'}
                </div>
            </div>
            
            <!-- Coluna: Concluídas -->
            <div class="kanban-column done">
                <div class="kanban-header">
                    <h3>✅ Concluídas</h3>
                    <span class="task-count">${concluidas.length}</span>
                </div>
                <div class="kanban-tasks">
                    ${concluidas.length > 0 ? concluidas.map(t => renderTaskCard(t)).join('') : '<p class="empty-column">Nenhuma tarefa</p>'}
                </div>
            </div>
        </div>
    `;
    feather.replace();

    // Ativar drag and drop
    setTimeout(() => setupDropZones(), 100);
}

function renderTaskCard(t) {
    return `
        <div class="kanban-card ${t.feita ? 'completed' : ''}" 
             draggable="true" 
             data-task-id="${t.id}"
             ondragstart="handleDragStart(event)"
             ondragend="handleDragEnd(event)">
            <div class="task-content">
                <h4>${t.titulo}</h4>
            </div>
            <div class="task-actions">
                ${!t.feita && !t.emProgresso ? `<button class="task-btn progress" onclick="event.stopPropagation(); moveToProgress('${t.id}')" title="Mover para Em Progresso"><i data-feather="arrow-right" style="width:14px"></i></button>` : ''}
                ${t.emProgresso && !t.feita ? `<button class="task-btn done" onclick="event.stopPropagation(); markAsDone('${t.id}')" title="Marcar como Concluída"><i data-feather="check" style="width:14px"></i></button>` : ''}
                ${t.emProgresso ? `<button class="task-btn" onclick="event.stopPropagation(); moveToTodo('${t.id}')" title="Voltar para A Fazer"><i data-feather="arrow-left" style="width:14px"></i></button>` : ''}
                ${t.feita ? `<button class="task-btn" onclick="event.stopPropagation(); reopenTask('${t.id}')" title="Reabrir"><i data-feather="rotate-ccw" style="width:14px"></i></button>` : ''}
                <button class="task-btn edit" onclick="event.stopPropagation(); editarTarefa('${t.id}')" title="Editar"><i data-feather="edit-2" style="width:14px"></i></button>
                <button class="task-btn delete" onclick="event.stopPropagation(); excluirTarefa('${t.id}')" title="Excluir"><i data-feather="trash-2" style="width:14px"></i></button>
            </div>
        </div>
    `;
}

// === DRAG AND DROP FUNCTIONALITY ===
let draggedTaskId = null;

window.handleDragStart = function (e) {
    draggedTaskId = e.currentTarget.getAttribute('data-task-id');
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);

    // Adicionar feedback visual nas zonas de drop
    setTimeout(() => {
        document.querySelectorAll('.kanban-tasks').forEach(zone => {
            zone.classList.add('drag-active');
        });
    }, 0);
}

window.handleDragEnd = function (e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.kanban-tasks').forEach(zone => {
        zone.classList.remove('drag-active', 'drag-over');
    });
}

// Configurar zonas de drop após renderizar
function setupDropZones() {
    const dropZones = document.querySelectorAll('.kanban-tasks');

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', function (e) {
            this.classList.remove('drag-over');
        });

        zone.addEventListener('drop', function (e) {
            e.preventDefault();
            this.classList.remove('drag-over', 'drag-active');

            if (!draggedTaskId) return;

            const column = this.closest('.kanban-column');
            const tarefa = Store.getTarefas().find(t => t.id === draggedTaskId);

            if (!tarefa) return;

            // Determinar novo status baseado na coluna
            if (column.classList.contains('progress')) {
                tarefa.emProgresso = true;
                tarefa.feita = false;
            } else if (column.classList.contains('done')) {
                tarefa.feita = true;
                tarefa.emProgresso = false;
            } else {
                tarefa.emProgresso = false;
                tarefa.feita = false;
            }

            Store.updateTarefa(tarefa);
            draggedTaskId = null;
        });
    });
}


// Funções de movimentação Kanban
window.moveToProgress = function (id) {
    const tarefa = Store.getTarefas().find(t => t.id === id);
    if (tarefa) {
        tarefa.emProgresso = true;
        Store.updateTarefa(tarefa);
    }
}

window.moveToTodo = function (id) {
    const tarefa = Store.getTarefas().find(t => t.id === id);
    if (tarefa) {
        tarefa.emProgresso = false;
        tarefa.feita = false;
        Store.updateTarefa(tarefa);
    }
}

window.markAsDone = function (id) {
    const tarefa = Store.getTarefas().find(t => t.id === id);
    if (tarefa) {
        tarefa.feita = true;
        tarefa.emProgresso = false;
        Store.updateTarefa(tarefa);
    }
}

window.reopenTask = function (id) {
    const tarefa = Store.getTarefas().find(t => t.id === id);
    if (tarefa) {
        tarefa.feita = false;
        tarefa.emProgresso = false;
        Store.updateTarefa(tarefa);
    }
}


window.toggleTask = function (id) {
    Store.toggleTarefa(id);
}

// --- SETTINGS LOGIC ---

window.resetAppData = function () {
    if (confirm('Tem certeza? Isso apagará TODAS as festas e tarefas.\nEsta ação não pode ser desfeita.')) {
        Store.clearAll();
        alert('Dados limpos com sucesso!');
        location.reload();
    }
}

window.reloadDemoData = function () {
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
    const pendentes = festas.filter(f => f.status === 'warning' || f.status === 'neutral').length;
    const confirmadas = festas.filter(f => f.status === 'success').length;
    const tarefasAtivas = tarefas.filter(t => !t.feita).length;

    if (document.getElementById('dash-pendentes')) document.getElementById('dash-pendentes').innerText = pendentes;
    if (document.getElementById('dash-ativas')) document.getElementById('dash-ativas').innerText = tarefasAtivas;
    if (document.getElementById('dash-confirmadas')) document.getElementById('dash-confirmadas').innerText = confirmadas;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
}
