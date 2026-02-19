/**
 * HubFest - Gerenciamento de Dados (Supabase)
 */

const Store = {
    // --- FESTAS ---
    getFestas: async function () {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('festas')
            .select('*')
            .eq('user_id', user.id)
            .order('data', { ascending: true });

        if (error) {
            console.error('Erro ao buscar festas:', error);
            return [];
        }
        return data;
    },

    addFesta: async function (festa) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('festas')
            .insert([{ ...festa, user_id: user.id }])
            .select();

        if (error) {
            alert('Erro ao adicionar festa: ' + error.message);
            return null;
        }

        document.dispatchEvent(new Event('festasUpdated'));
        return data[0];
    },

    updateFesta: async function (updatedFesta) {
        const { data, error } = await supabase
            .from('festas')
            .update(updatedFesta)
            .eq('id', updatedFesta.id);

        if (error) {
            alert('Erro ao atualizar festa: ' + error.message);
            return false;
        }

        document.dispatchEvent(new Event('festasUpdated'));
        return true;
    },

    deleteFesta: async function (id) {
        const { error } = await supabase
            .from('festas')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir festa: ' + error.message);
            return;
        }
        document.dispatchEvent(new Event('festasUpdated'));
    },

    // --- TAREFAS ---
    getTarefas: async function () {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('tarefas')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            console.error('Erro ao buscar tarefas:', error);
            return [];
        }
        return data;
    },

    addTarefa: async function (tarefa) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('tarefas')
            .insert([{ ...tarefa, user_id: user.id, feita: tarefa.feita || false }])
            .select();

        if (error) {
            alert('Erro ao adicionar tarefa: ' + error.message);
            return null;
        }

        document.dispatchEvent(new Event('tarefasUpdated'));
        return data[0];
    },

    updateTarefa: async function (updatedTarefa) {
        const { error } = await supabase
            .from('tarefas')
            .update(updatedTarefa)
            .eq('id', updatedTarefa.id);

        if (error) {
            alert('Erro ao atualizar tarefa: ' + error.message);
            return false;
        }

        document.dispatchEvent(new Event('tarefasUpdated'));
        return true;
    },

    deleteTarefa: async function (id) {
        const { error } = await supabase
            .from('tarefas')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir tarefa: ' + error.message);
            return;
        }
        document.dispatchEvent(new Event('tarefasUpdated'));
    },

    toggleTarefa: async function (id, currentStatus) {
        const { error } = await supabase
            .from('tarefas')
            .update({ feita: !currentStatus })
            .eq('id', id);

        if (error) {
            alert('Erro ao alterar tarefa: ' + error.message);
            return false;
        }
        document.dispatchEvent(new Event('tarefasUpdated'));
        return true;
    }
};
