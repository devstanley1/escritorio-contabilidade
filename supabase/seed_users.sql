-- Habilitar a extensão de criptografia (necessária para gerar as senhas)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- ==========================================
-- 1. USUÁRIO ADMIN
-- ==========================================
WITH admin_user AS (
    INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin
        )
    VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@contabilidade.com',
            crypt('password123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            false
        )
    RETURNING id
)
INSERT INTO public.profiles (id, nome, role)
SELECT id,
    'Administrador Chefe',
    'admin'
FROM admin_user;
-- ==========================================
-- 2. USUÁRIO CONTADOR
-- ==========================================
WITH contador_user AS (
    INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin
        )
    VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'contador@contabilidade.com',
            crypt('password123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            false
        )
    RETURNING id
)
INSERT INTO public.profiles (id, nome, role)
SELECT id,
    'Carlos Mendes',
    'contador'
FROM contador_user;
-- ==========================================
-- 3. USUÁRIO ATENDIMENTO
-- ==========================================
WITH atendimento_user AS (
    INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin
        )
    VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'atendimento@contabilidade.com',
            crypt('password123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            false
        )
    RETURNING id
)
INSERT INTO public.profiles (id, nome, role)
SELECT id,
    'Juliana Recepção',
    'atendimento'
FROM atendimento_user;
-- ==========================================
-- 4. USUÁRIO CLIENTE
-- ==========================================
WITH cliente_user AS (
    INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin
        )
    VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'cliente@contabilidade.com',
            crypt('password123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            false
        )
    RETURNING id
)
INSERT INTO public.profiles (id, nome, role)
SELECT id,
    'Tech Nova Diretor',
    'cliente'
FROM cliente_user;