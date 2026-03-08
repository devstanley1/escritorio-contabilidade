-- ==========================================
-- SUPABASE SCHEMA - ESCRITÓRIO DE CONTABILIDADE
-- ==========================================
-- Habilita extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ==========================================
-- 1. TABELA DE PERFIS (PROFILES)
-- Extensão da Tabela de Usuários Nativos do Supabase (auth.users)
-- ==========================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (
        role IN ('cliente', 'contador', 'atendimento', 'admin')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Comentário: Armazena o cargo (role) e o nome do usuário associado ao Login seguro do Supabase.
-- ==========================================
-- 2. TABELA DE EMPRESAS (CLIENTES)
-- ==========================================
CREATE TABLE public.empresas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    regime_tributario VARCHAR(50) CHECK (
        regime_tributario IN (
            'Simples Nacional',
            'Lucro Presumido',
            'Lucro Real'
        )
    ),
    cliente_id UUID REFERENCES public.profiles(id) ON DELETE
    SET NULL,
        -- Usuário dono (Role: cliente)
        contador_id UUID REFERENCES public.profiles(id) ON DELETE
    SET NULL,
        -- Contador responsável (Role: contador)
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Comentário: Base de clientes contábeis. Relaciona a empresa ao cliente logado e ao contador dela.
-- ==========================================
-- 3. TABELA DE SOLICITAÇÕES (CHAMADOS/TICKETS)
-- ==========================================
CREATE TABLE public.solicitacoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    solicitante_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tipo_servico VARCHAR(100) NOT NULL,
    urgencia VARCHAR(50) DEFAULT 'Normal' CHECK (urgencia IN ('Normal', 'Alta')),
    detalhes TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente' CHECK (
        status IN (
            'Pendente',
            'Em Andamento',
            'Aguardando Cliente',
            'Concluído'
        )
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Comentário: Reflete a tela "Nova Solicitação" e os tickets do dashboard do Cliente e Atendimento.
-- ==========================================
-- 4. TABELA DE DOCUMENTOS (ARQUIVOS)
-- ==========================================
CREATE TABLE public.documentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE
    SET NULL,
        nome_arquivo VARCHAR(255) NOT NULL,
        tipo_documento VARCHAR(50) NOT NULL,
        -- Ex: 'Contrato Social', 'Balanço 2025', 'Guia DAS'
        storage_path TEXT NOT NULL,
        -- Caminho do arquivo dentro do Supabase Storage Buckets
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Comentário: Metadados para popular a aba "Meus Documentos".
-- ==========================================
-- 5. TABELA DE OBRIGAÇÕES FISCAIS (PRAZOS E TAREFAS)
-- ==========================================
CREATE TABLE public.obrigacoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    contador_id UUID REFERENCES public.profiles(id) ON DELETE
    SET NULL,
        descricao VARCHAR(255) NOT NULL,
        -- Ex: 'Fechamento do DAS', 'SPED Fiscal'
        data_vencimento DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Pendente' CHECK (
            status IN ('Pendente', 'Transmitido', 'Em Atraso')
        ),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Comentário: Relacionado com "Tarefas Fiscais" e Obrigações do Dashboard do Contador.
-- ==========================================
-- 6. TABELA DE CONFIGURAÇÕES GLOBAIS (ADMIN)
-- ==========================================
CREATE TABLE public.configuracoes (
    id SERIAL PRIMARY KEY,
    nome_escritorio VARCHAR(255) NOT NULL DEFAULT 'Contabilidade Pro',
    dias_uteis_sla INTEGER DEFAULT 3,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Insere os valores iniciais de configuração do Dashboard do Admin
INSERT INTO public.configuracoes (nome_escritorio, dias_uteis_sla)
VALUES ('Contabilidade Pro Digital', 3);
-- ==========================================
-- FUNCIONALIDADES DE SEGURANÇA (RLS - ROW LEVEL SECURITY)
-- ==========================================
-- Ativando RLS nas tabelas para que os clientes não vejam dados de outros clientes
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obrigacoes ENABLE ROW LEVEL SECURITY;
-- POLÍTICA DO LOGIN: "Usuários podem ler o próprio perfil para saber o seu Cargo"
CREATE POLICY "Ler próprio Perfil" ON public.profiles FOR
SELECT USING (auth.uid() = id);
-- EXEMPLO DE POLÍTICA: "Clientes só veem suas próprias Empresas"
CREATE POLICY "Visualizar próprias Empresas" ON public.empresas FOR
SELECT USING (auth.uid() = cliente_id);
-- EXEMPLO DE POLÍTICA: "Admin e Contadores veem todas as Empresas"
CREATE POLICY "Contador e Admin veem tudo" ON public.empresas FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'contador', 'atendimento')
    )
);
-- Nota: Você pode expandir as políticas de RLS no painel visual do Supabase de acordo com as permissões da operação de cada Cargo.