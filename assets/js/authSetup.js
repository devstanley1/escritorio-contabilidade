// ==========================================
// SUPABASE AUTH - SCRIPT DE CRIAÇÃO DOS USUÁRIOS BASE
// ==========================================
// Este script serve APENAS para os desenvolvedores/administradores rodarem
// 1 única vez para popular as contas iniciais no Supabase Auth e na Tabela `profiles`.
// 
// COMO USAR:
// 1. Abra o index.html no navegador
// 2. Abra o Console do DevTools (F12)
// 3. Digite e execute: await window.criarContasPadrao()

async function criarContasPadrao() {
    console.log("Iniciando a criação de contas padrão...");

    const contas = [
        { email: 'admin@contabilidade.com', password: 'password123', nome: 'Administrador Chefe', role: 'admin' },
        { email: 'atendimento@contabilidade.com', password: 'password123', nome: 'Juliana Recepção', role: 'atendimento' },
        { email: 'contador@contabilidade.com', password: 'password123', nome: 'Carlos Mendes', role: 'contador' },
        { email: 'cliente@contabilidade.com', password: 'password123', nome: 'Tech Nova Diretor', role: 'cliente' },
    ];

    for (const conta of contas) {
        // Passo 1: Cria o usuário no Supabase Auth (Sistema nativo de Login)
        const { data: authData, error: authError } = await window.db.supabase.auth.signUp({
            email: conta.email,
            password: conta.password,
        });

        if (authError) {
            console.error(`Erro ao criar conta Auth para ${conta.email}:`, authError.message);
            continue; // Pula para a próxima se essa já existir ou der erro
        }

        const userId = authData.user.id;
        console.log(`✅ Usuário Auth gerado: ${conta.email} (ID: ${userId})`);

        // Passo 2: Insere o Perfil público na nossa tabela Customizada (Roles)
        const { data: profileData, error: profileError } = await window.db.supabase
            .from('profiles')
            .upsert([
                { id: userId, nome: conta.nome, role: conta.role }
            ]);

        if (profileError) {
            console.error(`❌ Erro ao criar Perfil para ${conta.email}:`, profileError.message);
        } else {
            console.log(`✅ Perfil vinculado! Role: ${conta.role}`);
        }
    }

    console.log("🎉 Processo finalizado! As 4 contas iniciais estão criadas no Supabase.");
    console.log("Agora você pode logar com as credenciais (ex: admin@contabilidade.com / password123)");
}

// Expõe para janela global (para poder chamar no console)
window.criarContasPadrao = criarContasPadrao;
