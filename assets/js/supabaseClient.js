// ==========================================
// CONFIGURAÇÃO DO SUPABASE CLIENT
// ==========================================
// ATENÇÃO: Substitua as chaves abaixo pelas suas credenciais reais do projeto Supabase.
// Você encontra isso em: Settings > API no painel do Supabase.

const SUPABASE_URL = 'https://hcxdrsxiajijzzeizbsh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeGRyc3hpYWppanp6ZWl6YnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODUxOTcsImV4cCI6MjA4ODQ2MTE5N30.tATTr1ERwbEXqIHQmxWubm0j9V2HoXv6Zi5TSzqRs7U';

// Inicializa o cliente do Supabase (A biblioteca deve ser importada no HTML via CDN)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// FUNÇÕES DE CRUD (Create, Read, Update, Delete)
// ==========================================

// --- 1. SOLICITAÇÕES (CHAMADOS) ---

/**
 * SELECT: Busca todas as solicitações de uma empresa específica (Para o Dashboard do Cliente)
 */
async function getSolicitacoes(empresaId) {
    const { data, error } = await supabaseClient
        .from('solicitacoes')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar solicitações:', error);
        return null;
    }
    return data;
}

/**
 * SELECT GLOBAL (ATENDIMENTO): Busca TODAS as solicitações
 */
async function getTodasSolicitacoes() {
    const { data, error } = await supabaseClient
        .from('solicitacoes')
        .select(`
            *,
            empresa:empresas(razao_social)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar as solicitações globais:', error);
        return null;
    }
    return data;
}

/**
 * INSERT: Cria uma nova solicitação no banco
 */
async function criarSolicitacao(empresaId, solicitanteId, tipoServico, urgencia, detalhes) {
    const { data, error } = await supabaseClient
        .from('solicitacoes')
        .insert([
            {
                empresa_id: empresaId,
                solicitante_id: solicitanteId,
                tipo_servico: tipoServico,
                urgencia: urgencia,
                detalhes: detalhes,
                status: 'Pendente' // Padrão inicial
            }
        ])
        .select();

    if (error) {
        console.error('Erro ao criar solicitação:', error);
        return null;
    }
    console.log('Solicitação criada com sucesso:', data);
    return data;
}

/**
 * UPDATE: Atualiza o status de uma solicitação (Para o Dashboard do Atendimento/Contador)
 */
async function atualizarStatusSolicitacao(solicitacaoId, novoStatus) {
    const { data, error } = await supabaseClient
        .from('solicitacoes')
        .update({ status: novoStatus, updated_at: new Date() })
        .eq('id', solicitacaoId)
        .select();

    if (error) {
        console.error('Erro ao atualizar status:', error);
        return null;
    }
    console.log('Status atualizado:', data);
    return data;
}

/**
 * DELETE: Exclui uma solicitação por engano
 */
async function deletarSolicitacao(solicitacaoId) {
    const { data, error } = await supabaseClient
        .from('solicitacoes')
        .delete()
        .eq('id', solicitacaoId);

    if (error) {
        console.error('Erro ao excluir solicitação:', error);
        return false;
    }
    console.log('Solicitação excluída com sucesso!');
    return true;
}

// --- 2. CLIENTES (EMPRESAS) ---

/**
 * SELECT: Busca todos os clientes usando JOIN (Para Dashboard do Admin/Contador)
 * Traz as empresas e também os dados do cliente dono e do contador responsável.
 */
async function getAllEmpresas() {
    const { data, error } = await supabaseClient
        .from('empresas')
        .select(`
            *,
            cliente:profiles!empresas_cliente_id_fkey(nome),
            contador:profiles!empresas_contador_id_fkey(nome)
        `);

    if (error) {
        console.error('Erro ao buscar empresas:', error);
        return null;
    }
    return data;
}

/**
 * INSERT: Cadastra uma nova empresa
 */
async function cadastrarEmpresa(razaoSocial, cnpj, regime) {
    const { data, error } = await supabaseClient
        .from('empresas')
        .insert([
            {
                razao_social: razaoSocial,
                cnpj: cnpj,
                regime_tributario: regime
            }
        ])
        .select();

    if (error) {
        console.error('Erro ao cadastrar empresa:', error);
        return null;
    }
    return data;
}

// --- 3. DOCUMENTOS ---

/**
 * SELECT: Busca os documentos pertencentes a uma empresa
 */
async function getDocumentos(empresaId) {
    const { data, error } = await supabaseClient
        .from('documentos')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar documentos:', error);
        return null;
    }
    return data;
}

// --- 5. OBRIGAÇÕES FISCAIS (CONTADOR) ---

async function getObrigacoesContador(contadorId) {
    const { data, error } = await supabaseClient
        .from('obrigacoes')
        .select(`
            *,
            empresa:empresas(razao_social)
        `)
        .eq('contador_id', contadorId)
        .order('data_vencimento', { ascending: true });

    if (error) {
        console.error('Erro ao buscar obrigações:', error);
        return null;
    }
    return data;
}

async function getEmpresasDoContador(contadorId) {
    const { data, error } = await supabaseClient
        .from('empresas')
        .select('*')
        .eq('contador_id', contadorId);

    if (error) {
        console.error('Erro ao buscar empresas do contador:', error);
        return null;
    }
    return data;
}

// --- 4. ADMIN (MÉTRICAS GLOBAIS) ---

/**
 * SELECT COMPLETO: Busca estatísticas para o Dashboard do Administrador
 */
async function getAdminMetrics() {
    // Busca total de empresas
    const { count: countEmpresas } = await supabaseClient
        .from('empresas')
        .select('*', { count: 'exact', head: true });

    // Busca total de chamados em andamento/pendentes
    const { count: countAndamento } = await supabaseClient
        .from('solicitacoes')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Pendente', 'Em Andamento', 'Aguardando Cliente']);

    // Busca total de chamados concluídos globalmente
    const { count: countConcluidos } = await supabaseClient
        .from('solicitacoes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Concluído');

    return {
        totalClientes: countEmpresas || 0,
        chamadosAbertos: countAndamento || 0,
        tarefasConcluidas: countConcluidos || 0,
        faturamento: "R$ 42.500" // Fixo para demonstração visual
    };
}


// Exporta as funções para serem usadas globalmente (se em módulo) ou
// simplesmente podem ser chamadas em outros arquivos JS carregados depois deste.
window.db = {
    supabase: supabaseClient,
    getSolicitacoes,
    getTodasSolicitacoes,
    criarSolicitacao,
    atualizarStatusSolicitacao,
    deletarSolicitacao,
    getAllEmpresas,
    cadastrarEmpresa,
    getDocumentos,
    getObrigacoesContador,
    getEmpresasDoContador,
    getAdminMetrics
};
