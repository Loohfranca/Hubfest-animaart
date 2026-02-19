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
    // DESATIVAR E REMOVER SERVICE WORKER PARA LIMPAR CACHE ANTIGO
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
                registration.unregister();
                console.log('SW Antigo Removido!');
            }
        });
    }

    feather.replace();
    setupNavigation();
    renderData();
    setupFilters();
    loadPreferences();
    checkAndUpdatePastFestas();
    initCalendar();

    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            closeModals();
        }
    });

    document.addEventListener('festasUpdated', () => {
        checkAndUpdatePastFestas();
        renderFestas();
        renderCalendar();
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

window.openPartyModal = async function (id = null) {
    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-festa');
    const title = document.getElementById('modal-festa-title');
    const form = document.getElementById('form-festa');

    form.reset();

    if (id) {
        const festas = await Store.getFestas();
        const festa = festas.find(f => f.id === id);
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
        title.innerText = 'Nova Festa';
        document.getElementById('festa-id').value = '';
    }

    modal.classList.add('active');
    document.getElementById('modal-tarefa').style.display = 'none';
    modalContent.style.display = 'flex';
}

window.editarFesta = function (id) {
    openPartyModal(id);
}

window.excluirFesta = async function (id) {
    if (confirm('Tem certeza que deseja excluir esta festa?')) {
        await Store.deleteFesta(id);
    }
}

document.getElementById('form-festa').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('festa-id').value;
    const statusVal = document.getElementById('festa-status').value;
    let statusLabel = 'Pendente';
    if (statusVal === 'warning') statusLabel = 'Planejamento';
    if (statusVal === 'success') statusLabel = 'Confirmada';

    const festaData = {
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
        festaData.id = id;
        await Store.updateFesta(festaData);
    } else {
        await Store.addFesta(festaData);
    }

    closeModals();
});

window.openTaskModal = async function (id = null) {
    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-tarefa');
    const title = document.getElementById('modal-tarefa-title');
    const form = document.getElementById('form-tarefa');

    form.reset();

    if (id) {
        const tarefas = await Store.getTarefas();
        const tarefa = tarefas.find(t => t.id === id);
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

window.excluirTarefa = async function (id) {
    if (confirm('Excluir esta tarefa?')) {
        await Store.deleteTarefa(id);
    }
}

document.getElementById('form-tarefa').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('tarefa-id').value;
    const tarefaData = {
        titulo: document.getElementById('tarefa-titulo').value,
    };

    if (id) {
        tarefaData.id = id;
        await Store.updateTarefa(tarefaData);
    } else {
        await Store.addTarefa(tarefaData);
    }
    closeModals();
});

window.closeModals = function () {
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('active');
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

    const activeBtn = document.querySelectorAll(`.menu-item[data-target="${targetId}"]`);
    activeBtn.forEach(btn => btn.classList.add('active'));

    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('mobile-active');
    }
}

window.toggleMobileMenu = function () {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('mobile-active');
}

async function renderData() {
    await renderFestas();
    await renderTarefas();
    updateDashboardCounts();
    renderDashboardPreview();
}

async function renderDashboardPreview() {
    const container = document.getElementById('dashboard-preview-list');
    if (!container) return;

    let festas = await Store.getFestas();
    if (festas.length === 0) {
        container.innerHTML = '<div class="card" style="opacity:0.7"><p>Nenhuma festa agendada.</p></div>';
        return;
    }

    festas.sort((a, b) => {
        const dateA = new Date(a.data + 'T' + (a.hora || '00:00') + ':00');
        const dateB = new Date(b.data + 'T' + (b.hora || '00:00') + ':00');
        return dateA - dateB;
    });

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const grouped = {};
    festas.forEach(f => {
        const dateObj = new Date(f.data + 'T12:00:00');
        const monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
        if (!grouped[monthKey]) grouped[monthKey] = {
            label: `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`,
            items: []
        };
        grouped[monthKey].items.push(f);
    });

    let html = '<div class="horizontal-months-container">';
    for (const key in grouped) {
        const group = grouped[key];
        html += `
            <div class="preview-month-group">
                <h3 class="month-title">${group.label}</h3>
                <div class="premium-event-grid">
                    ${group.items.map(f => {
            const d = new Date(f.data + 'T12:00:00');
            return `
                        <div class="premium-event-card ${f.status || 'pendente'}" onclick="document.querySelector('.menu-item[data-target=parties]').click()">
                            <div class="event-day">${d.getDate()}</div>
                            <div class="event-main">
                                <span class="event-name">${f.nome} ${f.status === 'dark' ? '<i data-feather="check-circle" class="finished-icon"></i>' : ''}</span>
                                <span class="event-time"><i data-feather="clock"></i> ${f.hora || '--:--'}</span>
                            </div>
                            <div class="event-status-indicator"></div>
                        </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }
    html += '</div>';

    container.innerHTML = html;
    feather.replace();
}

let currentCalDate = new Date();
let selectedDate = new Date();

async function initCalendar() {
    document.getElementById('prev-month').addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('next-month').addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        renderCalendar();
    });

    await renderCalendar();
    await renderDayDetails(selectedDate);
}

async function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('calendar-title');
    const festas = await Store.getFestas();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    title.innerText = `${monthNames[currentCalDate.getMonth()]} ${currentCalDate.getFullYear()}`;

    grid.innerHTML = '';

    const firstDayOfMonth = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    for (let i = 0; i < startingDayOfWeek; i++) {
        const day = document.createElement('div');
        day.classList.add('calendar-day', 'prev-month');
        grid.appendChild(day);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.classList.add('calendar-day');
        day.innerText = i;

        const monthStr = (currentCalDate.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = i.toString().padStart(2, '0');
        const dateString = `${currentCalDate.getFullYear()}-${monthStr}-${dayStr}`;

        const hasEvent = festas.some(f => f.data === dateString);
        if (hasEvent) day.classList.add('has-event');

        if (FERIADOS_2026[dateString]) {
            day.classList.add('is-holiday');
            day.title = FERIADOS_2026[dateString];
        }

        if (selectedDate &&
            selectedDate.getDate() === i &&
            selectedDate.getMonth() === currentCalDate.getMonth() &&
            selectedDate.getFullYear() === currentCalDate.getFullYear()) {
            day.classList.add('selected');
        }

        day.addEventListener('click', () => {
            selectedDate = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth(), i);
            renderCalendar();
            renderDayDetails(selectedDate);
        });

        grid.appendChild(day);
    }
}

async function renderDayDetails(date) {
    const container = document.getElementById('day-details-content');
    if (!container) return;

    const festas = await Store.getFestas();
    const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = date.getDate().toString().padStart(2, '0');
    const dateString = `${date.getFullYear()}-${monthStr}-${dayStr}`;

    container.innerHTML = `<h2 id="selected-date-title" style="font-size: 1.35rem; font-weight: 700; color: #fff; margin-bottom: 1.5rem; text-align: center;">${formatDate(dateString)}</h2>`;

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
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderFestas();
        });
    });
}

function maskPhone(phone) {
    if (!phone) return '-';
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 2) return phone;
    return clean.substring(0, 2) + '*'.repeat(clean.length - 2);
}

async function renderFestas() {
    let festas = await Store.getFestas();
    const container = document.getElementById('lista-festas');
    if (!container) return;

    festas.sort((a, b) => {
        const dateA = new Date(a.data + 'T' + (a.hora || '00:00'));
        const dateB = new Date(b.data + 'T' + (b.hora || '00:00'));
        return dateA - dateB;
    });

    if (currentFilter !== 'all') {
        if (currentFilter === 'confirmada') {
            festas = festas.filter(f => f.status === 'success');
        } else if (currentFilter === 'pendente') {
            festas = festas.filter(f => f.status === 'neutral' || f.status === 'warning');
        } else if (currentFilter === 'finalizada') {
            festas = festas.filter(f => f.status === 'dark');
        }
    }

    if (currentSearch) {
        festas = festas.filter(f =>
            f.nome.toLowerCase().includes(currentSearch) ||
            (f.responsavel && f.responsavel.toLowerCase().includes(currentSearch))
        );
    }

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
                    <p class="row-subtitle">${f.responsavel || 'Sem responsável'} • ${f.idade || 'Idade -'}</p>
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
                    <button class="row-btn whatsapp" onclick="sendWhatsapp('${f.id}')" title="Mensagem Hoje">
                        <i data-feather="send"></i>
                    </button>
                    <button class="row-btn reminder" onclick="sendReminderWhatsapp('${f.id}')" title="Lembrete 2 dias">
                        <i data-feather="bell"></i>
                    </button>
                    <button class="row-btn" onclick="generatePartyReport('${f.id}')" title="Gerar Relatório">
                        <i data-feather="file-text"></i>
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

const REMINDER_TEMPLATE = `Olá, [responsavel]! ✨
Passando para confirmar os detalhes da festa da [nome] que será daqui a 2 dias! 🥳

📍 Local: [local]
📅 Data: [data]
⏰ Horário: [hora]

Está tudo certo para esse horário? Qualquer dúvida, estamos à disposição! 😊🎈`;

window.sendWhatsapp = async function (id) {
    const festas = await Store.getFestas();
    const festa = festas.find(f => f.id === id);
    if (!festa) return;

    let template = localStorage.getItem('hubfest_template');
    if (!template) template = DEFAULT_TEMPLATE;

    const texto = template
        .replace(/\[nome\]/g, festa.nome)
        .replace(/\[responsavel\]/g, festa.responsavel || 'Cliente')
        .replace(/\[local\]/g, festa.local || 'Endereço da Festa')
        .replace(/\[data\]/g, formatDate(festa.data))
        .replace(/\[hora\]/g, festa.hora)
        .replace(/\[idade\]/g, festa.idade || '');

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}

window.sendReminderWhatsapp = async function (id) {
    const festas = await Store.getFestas();
    const festa = festas.find(f => f.id === id);
    if (!festa) return;

    const texto = REMINDER_TEMPLATE
        .replace(/\[nome\]/g, festa.nome)
        .replace(/\[responsavel\]/g, festa.responsavel || 'Cliente')
        .replace(/\[local\]/g, festa.local || 'Endereço da Festa')
        .replace(/\[data\]/g, formatDate(festa.data))
        .replace(/\[hora\]/g, festa.hora);

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
}

window.generatePartyReport = async function (id) {
    const festas = await Store.getFestas();
    const festa = festas.find(f => f.id === id);
    if (!festa) return;

    const report = `✨ *CARD DO RECREADOR - HUBFEST* ✨
----------------------------
🎈 *Festa:* ${festa.nome}
👤 *Responsável:* ${festa.responsavel || 'Não informado'}
📅 *Data:* ${formatDate(festa.data)}
⏰ *Hora:* ${festa.hora}
🎂 *Idade:* ${festa.idade || '-'}
👶 *Qtd. Crianças:* ${festa.criancas || '-'}
📞 *Telefone:* ${festa.telefone || '-'}
📍 *Local:* ${festa.local || 'Não informado'}
📝 *Obs:* ${festa.obs || 'Nenhuma'}
----------------------------
_Bom trabalho, equipe!_ 🚀`;

    window.open(`https://wa.me/?text=${encodeURIComponent(report)}`, '_blank');
}

window.generateTotalReport = async function () {
    const festas = await Store.getFestas();
    if (festas.length === 0) {
        alert('Nenhuma festa cadastrada para gerar relatório.');
        return;
    }

    festas.sort((a, b) => new Date(a.data) - new Date(b.data));

    let report = `📊 *RELATÓRIO GERAL DE FESTAS* 📊\n`;
    report += `Total de festas: ${festas.length}\n`;
    report += `----------------------------\n\n`;

    festas.forEach((f, index) => {
        report += `${index + 1}. *${f.nome}*\n`;
        report += `📅 ${formatDate(f.data)} às ${f.hora}\n`;
        report += `👶 ${f.criancas || '-'} crianças • 📞 ${f.telefone || '-'}\n`;
        report += `📍 ${f.local || 'Local não definido'}\n`;
        report += `👤 ${f.responsavel || 'Sem resp.'}\n`;
        report += `----------------------------\n`;
    });

    report += `\n_Gerado por HubFest_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(report)}`, '_blank');
}

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

window.savePreferences = function () {
    const template = document.getElementById('config-template').value;
    localStorage.setItem('hubfest_template', template);
}

window.loadPreferences = function () {
    let theme = localStorage.getItem('hubfest_theme') || 'dark';
    setTheme(theme);

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

async function renderTarefas() {
    const tarefas = await Store.getTarefas();
    const container = document.getElementById('lista-tarefas');
    if (!container) return;

    const aFazer = tarefas.filter(t => !t.feita && !t.emProgresso);
    const emProgresso = tarefas.filter(t => t.emProgresso && !t.feita);
    const concluidas = tarefas.filter(t => t.feita);

    if (tarefas.length === 0) {
        container.innerHTML = '<div class="card empty-state-card"><p>Nenhuma tarefa pendente.</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="kanban-board">
            <div class="kanban-column">
                <div class="kanban-header">
                    <h3>📋 A Fazer</h3>
                    <span class="task-count">${aFazer.length}</span>
                </div>
                <div class="kanban-tasks">
                    ${aFazer.length > 0 ? aFazer.map(t => renderTaskCard(t)).join('') : '<p class="empty-column">Nenhuma tarefa</p>'}
                </div>
            </div>
            
            <div class="kanban-column progress">
                <div class="kanban-header">
                    <h3>🚀 Em Progresso</h3>
                    <span class="task-count">${emProgresso.length}</span>
                </div>
                <div class="kanban-tasks">
                    ${emProgresso.length > 0 ? emProgresso.map(t => renderTaskCard(t)).join('') : '<p class="empty-column">Nenhuma tarefa</p>'}
                </div>
            </div>
            
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
    setTimeout(() => setupDropZones(), 100);
}

function renderTaskCard(t) {
    return `
        <div class="kanban-card ${t.feita ? 'completed' : ''}" 
             draggable="true" 
             ondragstart="handleDragStart(event, '${t.id}')">
            <div class="task-card-content">
                <div class="task-check" onclick="Store.toggleTarefa('${t.id}', ${t.feita})">
                    <i data-feather="${t.feita ? 'check-circle' : 'circle'}"></i>
                </div>
                <span class="task-title">${t.titulo}</span>
            </div>
            <div class="task-actions">
                <button class="task-btn edit" onclick="editarTarefa('${t.id}')">
                    <i data-feather="edit-2"></i>
                </button>
                <button class="task-btn delete" onclick="excluirTarefa('${t.id}')">
                    <i data-feather="trash-2"></i>
                </button>
            </div>
        </div>
    `;
}

// --- DASHBOARD HELPERS ---

async function updateDashboardCounts() {
    const festas = await Store.getFestas();
    const tarefas = await Store.getTarefas();

    const finalizadasCount = festas.filter(f => f.status === 'dark').length;
    const ativasCount = tarefas.filter(t => !t.feita).length;
    const confirmadasCount = festas.filter(f => f.status === 'success').length;

    const elFinalizadas = document.getElementById('count-festas-finalizadas');
    const elAtivas = document.getElementById('count-tarefas-ativas');
    const elConfirmadas = document.getElementById('count-festas-confirmadas');

    if (elFinalizadas) elFinalizadas.innerText = finalizadasCount;
    if (elAtivas) elAtivas.innerText = ativasCount;
    if (elConfirmadas) elConfirmadas.innerText = confirmadasCount;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

async function checkAndUpdatePastFestas() {
    const festas = await Store.getFestas();
    const todayStr = new Date().toISOString().split('T')[0];

    for (const f of festas) {
        if (f.data < todayStr && f.status !== 'dark') {
            await Store.updateFesta({ ...f, status: 'dark', statusLabel: 'Finalizada' });
        }
    }
}

// --- KANBAN DRAG & DROP ---

let draggedTaskId = null;

window.handleDragStart = function (e, id) {
    draggedTaskId = id;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => e.target.classList.add('dragging'), 0);
}

function setupDropZones() {
    const columns = document.querySelectorAll('.kanban-column');

    columns.forEach(col => {
        col.addEventListener('dragover', (e) => e.preventDefault());
        col.addEventListener('dragenter', (e) => {
            e.preventDefault();
            col.classList.add('drag-over');
        });
        col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
        col.addEventListener('drop', async (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');

            if (!draggedTaskId) return;

            const isDone = col.classList.contains('done');
            const isProgress = col.classList.contains('progress');

            await Store.updateTarefa({
                id: draggedTaskId,
                feita: isDone,
                emProgresso: isProgress && !isDone
            });

            draggedTaskId = null;
        });
    });
}
