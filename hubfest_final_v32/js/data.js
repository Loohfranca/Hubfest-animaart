/**
 * HubFest - Gerenciamento de Dados (Supabase + localStorage fallback)
 */

// ========== SUPABASE CONFIG ==========
const SUPABASE_URL = 'https://zkiqvkplcaorvfnxajwg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpraXF2a3BsY2FvcnZmbnhhandnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODQxNTYsImV4cCI6MjA4OTM2MDE1Nn0.zqIsHofss0-YfsZfCRZGIApykDp5xa_xG6L42hchEVE';

// Helper para chamadas REST ao Supabase
const SupabaseAPI = {
    headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    },

    async get(table, query = '') {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
                headers: this.headers
            });
            if (!res.ok) throw new Error(`GET ${table} failed: ${res.status}`);
            return await res.json();
        } catch (e) {
            console.warn(`[Supabase] GET ${table} falhou:`, e.message);
            return null;
        }
    },

    async upsert(table, data) {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                method: 'POST',
                headers: { ...this.headers, 'Prefer': 'return=representation,resolution=merge-duplicates' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`UPSERT ${table} failed: ${res.status}`);
            return await res.json();
        } catch (e) {
            console.warn(`[Supabase] UPSERT ${table} falhou:`, e.message);
            return null;
        }
    },

    async delete(table, id) {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
                method: 'DELETE',
                headers: this.headers
            });
            if (!res.ok) throw new Error(`DELETE ${table} failed: ${res.status}`);
            return true;
        } catch (e) {
            console.warn(`[Supabase] DELETE ${table} falhou:`, e.message);
            return false;
        }
    },

    async update(table, id, data) {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
                method: 'PATCH',
                headers: { ...this.headers, 'Prefer': 'return=representation' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`PATCH ${table} failed: ${res.status}`);
            return await res.json();
        } catch (e) {
            console.warn(`[Supabase] PATCH ${table} falhou:`, e.message);
            return null;
        }
    }
};

// ========== STORE (compatível com código existente) ==========
const Store = {
    KEYS: {
        FESTAS: 'hubfest_festas',
        TAREFAS: 'hubfest_tarefas'
    },

    _supabaseReady: false,
    _syncInProgress: false,

    // --- FESTAS (leitura do cache local, sync com Supabase em background) ---

    getFestas: function () {
        const data = localStorage.getItem(this.KEYS.FESTAS);
        return data ? JSON.parse(data) : [];
    },

    addFesta: function (festa) {
        const festas = this.getFestas();
        if (!festa.id) {
            festa.id = Date.now().toString();
        }
        festas.push(festa);
        localStorage.setItem(this.KEYS.FESTAS, JSON.stringify(festas));
        document.dispatchEvent(new Event('festasUpdated'));

        // Sync com Supabase
        this._syncFestaToSupabase(festa);
        return festa;
    },

    updateFesta: function (updatedFesta) {
        const festas = this.getFestas();
        const index = festas.findIndex(f => String(f.id) === String(updatedFesta.id));
        if (index !== -1) {
            festas[index] = updatedFesta;
            localStorage.setItem(this.KEYS.FESTAS, JSON.stringify(festas));
            document.dispatchEvent(new Event('festasUpdated'));

            // Sync com Supabase
            this._syncFestaToSupabase(updatedFesta);
            return true;
        }
        return false;
    },

    deleteFesta: function (id) {
        let festas = this.getFestas();
        festas = festas.filter(f => String(f.id) !== String(id));
        localStorage.setItem(this.KEYS.FESTAS, JSON.stringify(festas));
        document.dispatchEvent(new Event('festasUpdated'));

        // Delete do Supabase
        SupabaseAPI.delete('festas', id);
    },

    // --- TAREFAS (sincronizadas com Supabase) ---

    getTarefas: function () {
        const data = localStorage.getItem(this.KEYS.TAREFAS);
        return data ? JSON.parse(data) : [];
    },

    addTarefa: function (tarefa) {
        const tarefas = this.getTarefas();
        if (!tarefa.id) {
            tarefa.id = Date.now().toString();
        }
        if (typeof tarefa.feita === 'undefined') {
            tarefa.feita = false;
        }
        tarefas.push(tarefa);
        localStorage.setItem(this.KEYS.TAREFAS, JSON.stringify(tarefas));
        document.dispatchEvent(new Event('tarefasUpdated'));

        // Sync com Supabase
        this._syncTarefaToSupabase(tarefa);
        return tarefa;
    },

    updateTarefa: function (updatedTarefa) {
        const tarefas = this.getTarefas();
        const index = tarefas.findIndex(t => String(t.id) === String(updatedTarefa.id));
        if (index !== -1) {
            tarefas[index] = updatedTarefa;
            localStorage.setItem(this.KEYS.TAREFAS, JSON.stringify(tarefas));
            document.dispatchEvent(new Event('tarefasUpdated'));

            // Sync com Supabase
            this._syncTarefaToSupabase(updatedTarefa);
            return true;
        }
        return false;
    },

    deleteTarefa: function (id) {
        let tarefas = this.getTarefas();
        tarefas = tarefas.filter(t => String(t.id) !== String(id));
        localStorage.setItem(this.KEYS.TAREFAS, JSON.stringify(tarefas));
        document.dispatchEvent(new Event('tarefasUpdated'));

        // Delete do Supabase
        SupabaseAPI.delete('tarefas', id);
    },

    toggleTarefa: function (id) {
        const tarefas = this.getTarefas();
        const index = tarefas.findIndex(t => String(t.id) === String(id));
        if (index !== -1) {
            tarefas[index].feita = !tarefas[index].feita;
            localStorage.setItem(this.KEYS.TAREFAS, JSON.stringify(tarefas));
            document.dispatchEvent(new Event('tarefasUpdated'));

            // Sync com Supabase (só atualiza feita)
            SupabaseAPI.update('tarefas', id, { feita: tarefas[index].feita });
            return true;
        }
        return false;
    },

    clearAll: function () {
        localStorage.removeItem(this.KEYS.FESTAS);
        localStorage.removeItem(this.KEYS.TAREFAS);
        console.log('Dados do HubFest limpos.');
    },

    // ========== SUPABASE SYNC ==========

    _festaToSupabaseRow: function (f) {
        return {
            id: f.id,
            nome: f.nome || '',
            responsavel: f.responsavel || '',
            data: f.data || null,
            hora: f.hora || '',
            telefone: f.telefone || '',
            criancas: f.criancas || '',
            local: f.local || '',
            obs: f.obs || '',
            status: f.status || 'neutral',
            status_label: f.statusLabel || f.status_label || 'Pendente'
        };
    },

    _supabaseRowToFesta: function (row) {
        return {
            id: row.id,
            nome: row.nome || '',
            responsavel: row.responsavel || '',
            data: row.data || '',
            hora: row.hora || '',
            telefone: row.telefone || '',
            criancas: row.criancas || '',
            local: row.local || '',
            obs: row.obs || '',
            status: row.status || 'neutral',
            statusLabel: row.status_label || 'Pendente'
        };
    },

    _syncFestaToSupabase: async function (festa) {
        const row = this._festaToSupabaseRow(festa);
        await SupabaseAPI.upsert('festas', row);
    },

    _tarefaToSupabaseRow: function (t) {
        return {
            id: t.id,
            titulo: t.titulo || '',
            festa_id: t.festaId || '',
            feita: !!t.feita,
            prazo: t.prazo || null
        };
    },

    _supabaseRowToTarefa: function (row) {
        return {
            id: row.id,
            titulo: row.titulo || '',
            festaId: row.festa_id || '',
            feita: !!row.feita,
            prazo: row.prazo || ''
        };
    },

    _syncTarefaToSupabase: async function (tarefa) {
        const row = this._tarefaToSupabaseRow(tarefa);
        await SupabaseAPI.upsert('tarefas', row);
    },

    // Carrega festas E tarefas do Supabase → localStorage
    syncFromSupabase: async function () {
        if (this._syncInProgress) return;
        this._syncInProgress = true;

        console.log('[HubFest] Sincronizando Festas e Tarefas com Supabase...');
        
        // Buscar Festas
        const rowsFestas = await SupabaseAPI.get('festas', 'order=data.asc');
        if (rowsFestas && Array.isArray(rowsFestas)) {
            const festas = rowsFestas.map(r => this._supabaseRowToFesta(r));
            localStorage.setItem(this.KEYS.FESTAS, JSON.stringify(festas));
            this._supabaseReady = true;
            console.log(`[HubFest] ✅ ${festas.length} festas sincronizadas!`);
            document.dispatchEvent(new Event('festasUpdated'));
        }

        // Buscar Tarefas
        const rowsTarefas = await SupabaseAPI.get('tarefas', '');
        if (rowsTarefas && Array.isArray(rowsTarefas)) {
            const tarefas = rowsTarefas.map(r => this._supabaseRowToTarefa(r));
            localStorage.setItem(this.KEYS.TAREFAS, JSON.stringify(tarefas));
            console.log(`[HubFest] ✅ ${tarefas.length} tarefas sincronizadas!`);
            document.dispatchEvent(new Event('tarefasUpdated'));
        }

        this._syncInProgress = false;
    },

    // Envia TODAS as festas do localStorage → Supabase
    pushAllToSupabase: async function () {
        const festas = this.getFestas();
        if (festas.length === 0) {
            console.log('[HubFest] Nenhuma festa para enviar');
            return;
        }
        const rows = festas.map(f => this._festaToSupabaseRow(f));
        const result = await SupabaseAPI.upsert('festas', rows);
        if (result) {
            console.log(`[HubFest] ✅ ${rows.length} festas enviadas ao Supabase!`);
        } else {
            console.log('[HubFest] ❌ Falha ao enviar festas ao Supabase');
        }
        return result;
    }
};

// ========== INICIALIZAÇÃO ==========
(function initData() {
    // Dados mock se estiver totalmente vazio
    if (Store.getFestas().length === 0) {
        console.log('Inicializando dados de exemplo...');
        Store.addFesta({
            id: '1',
            nome: 'Julia',
            responsavel: 'Thais',
            data: '2026-03-14',
            hora: '14:00',
            telefone: '21969754979',
            idade: '3 anos',
            criancas: '20',
            status: 'success',
            statusLabel: 'Confirmada'
        });
    }

    if (Store.getTarefas().length === 0) {
        Store.addTarefa({ id: '101', titulo: 'Contratar Animação', festaId: '1', feita: true });
        Store.addTarefa({ id: '102', titulo: 'Verificar Decoração', festaId: '1', feita: false });
    }

    // Sync com Supabase ao abrir (carrega do banco → atualiza localStorage)
    setTimeout(() => {
        Store.syncFromSupabase();
    }, 500);
})();

// ========== AUTHENTICATION API ==========
// Utilizamos o SDK nativo que já gerencia a sessão no localStorage pra gente
window.AuthAPI = {
    client: null,
    
    init: function() {
        if (!this.client && window.supabase) {
            this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    },

    checkSession: async function() {
        this.init();
        if (!this.client) return false;
        const { data, error } = await this.client.auth.getSession();
        if (data && data.session) {
            // Renderiza email no menu
            const el = document.getElementById('auth-user-name');
            if (el) el.innerText = data.session.user.email.split('@')[0];
            return true;
        }
        return false;
    },

    logout: async function() {
        this.init();
        if (this.client) {
            await this.client.auth.signOut();
        }
        Store.clearAll(); // Limpa os dados locais para o próximo usuário
        window.location.href = 'login.html';
    }
};
