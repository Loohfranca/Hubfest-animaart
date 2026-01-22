/**
 * HubFest - Gerenciamento de Dados (LocalStorage)
 */

const Store = {
    // Chaves para o LocalStorage
    KEYS: {
        FESTAS: 'hubfest_festas',
        TAREFAS: 'hubfest_tarefas'
    },

    // --- FESTAS ---

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
        return festa;
    },

    updateFesta: function (updatedFesta) {
        const festas = this.getFestas();
        const index = festas.findIndex(f => f.id === updatedFesta.id);
        if (index !== -1) {
            festas[index] = updatedFesta;
            localStorage.setItem(this.KEYS.FESTAS, JSON.stringify(festas));
            document.dispatchEvent(new Event('festasUpdated'));
            return true;
        }
        return false;
    },

    deleteFesta: function (id) {
        let festas = this.getFestas();
        festas = festas.filter(f => f.id !== id);
        localStorage.setItem(this.KEYS.FESTAS, JSON.stringify(festas));
        document.dispatchEvent(new Event('festasUpdated'));
    },

    // --- TAREFAS ---

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
        return tarefa;
    },

    updateTarefa: function (updatedTarefa) {
        const tarefas = this.getTarefas();
        const index = tarefas.findIndex(t => t.id === updatedTarefa.id);
        if (index !== -1) {
            tarefas[index] = updatedTarefa;
            localStorage.setItem(this.KEYS.TAREFAS, JSON.stringify(tarefas));
            document.dispatchEvent(new Event('tarefasUpdated'));
            return true;
        }
        return false;
    },

    deleteTarefa: function (id) {
        let tarefas = this.getTarefas();
        tarefas = tarefas.filter(t => t.id !== id);
        localStorage.setItem(this.KEYS.TAREFAS, JSON.stringify(tarefas));
        document.dispatchEvent(new Event('tarefasUpdated'));
    },

    toggleTarefa: function (id) {
        const tarefas = this.getTarefas();
        const index = tarefas.findIndex(t => t.id === id);

        if (index !== -1) {
            tarefas[index].feita = !tarefas[index].feita;
            localStorage.setItem(this.KEYS.TAREFAS, JSON.stringify(tarefas));
            document.dispatchEvent(new Event('tarefasUpdated'));
            return true;
        }
        return false;
    },

    clearAll: function () {
        localStorage.removeItem(this.KEYS.FESTAS);
        localStorage.removeItem(this.KEYS.TAREFAS);
        console.log('Dados do HubFest limpos.');
    }
};

// Inicializa com dados de exemplo se estiver vazio
(function initMockData() {
    if (Store.getFestas().length === 0) {
        console.log('Inicializando dados de exemplo...');
        // Mock solicitado: Julia
        Store.addFesta({
            id: '1',
            nome: 'Julia',
            responsavel: 'Thais',
            data: '2026-03-14',
            hora: '14:00', // hora opcional, deixando padrão
            telefone: '21969754979',
            idade: '3 anos',
            criancas: '20',
            status: 'success',
            statusLabel: 'Confirmada'
        });
        // Outro exemplo
        Store.addFesta({
            id: '2',
            nome: 'Miguel',
            responsavel: 'Carlos',
            data: '2026-11-15',
            hora: '14:00',
            telefone: '21999998888',
            idade: '5 anos',
            criancas: '15',
            status: 'warning',
            statusLabel: 'Planejamento'
        });
    }

    if (Store.getTarefas().length === 0) {
        Store.addTarefa({ id: '101', titulo: 'Contratar Animação', festaId: '1', feita: true });
        Store.addTarefa({ id: '102', titulo: 'Verificar Decoração', festaId: '1', feita: false });
    }
})();
