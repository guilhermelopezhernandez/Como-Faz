// Configuração de conexão com o Supabase.
// Pegue esses dois valores em: Painel do Supabase > Project Settings > API
// SUPABASE_URL = "Project URL"
// SUPABASE_ANON_KEY = "anon public" key
// Esses valores NÃO são secretos - são feitos para rodar no navegador.

const SUPABASE_URL = 'https://yrihzkmuqtfovigdtlgi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bL-X4jvZ0TCkbpPQ_anP8w_xYEr4hb6';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
