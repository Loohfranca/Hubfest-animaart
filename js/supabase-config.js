/**
 * HubFest - Configuração Supabase
 */

const SUPABASE_CONFIG = {
    URL: "https://pyyqzrvlydabzxsyyief.supabase.co",
    // Chave anon/public para acesso do cliente
    KEY: "sb_publishable_wU2cKaTf99lqb8fYt7cBQw_dDqb9FPW"
};

// Inicialização do cliente Supabase
const supabase = supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.KEY);
