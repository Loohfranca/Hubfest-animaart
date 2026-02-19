/**
 * HubFest - Configuração Supabase
 */

const SUPABASE_CONFIG = {
    URL: "https://pyyqzrvlydabzxsyyief.supabase.co",
    // Chave anon/public para acesso do cliente
    KEY: "sb_publishable_wU2cKaTf99lqb8fYt7cBQw_dDqb9FPW"
};

// Inicialização do cliente Supabase
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.KEY);

// Tornar global para os outros scripts
window.supabase = _supabase;
