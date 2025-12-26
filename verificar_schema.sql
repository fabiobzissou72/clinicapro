-- ============================================
-- VERIFICAR SCHEMA DAS TABELAS
-- Execute este SQL para ver quais colunas existem
-- ============================================

-- 1. PACIENTES
SELECT
    'pacientes' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'pacientes'
ORDER BY ordinal_position;

-- 2. PROCEDIMENTOS
SELECT
    'procedimentos' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'procedimentos'
ORDER BY ordinal_position;

-- 3. PROFISSIONAIS
SELECT
    'profissionais' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profissionais'
ORDER BY ordinal_position;

-- 4. AGENDAMENTOS
SELECT
    'agendamentos' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'agendamentos'
ORDER BY ordinal_position;

-- 5. TODAS AS TABELAS EXISTENTES
SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
