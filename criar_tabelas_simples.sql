-- CRIAR TABELAS BÁSICAS QUE FUNCIONAM
-- Execute este SQL no Supabase SQL Editor

-- 1. PACIENTES (SIMPLES)
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    cpf TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    birth_date DATE,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROCEDIMENTOS
CREATE TABLE IF NOT EXISTS procedimentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    price DECIMAL(10,2) DEFAULT 0,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFISSIONAIS
CREATE TABLE IF NOT EXISTS profissionais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    cpf TEXT,
    phone TEXT,
    email TEXT,
    specialty TEXT,
    commission_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AGENDAMENTOS
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL,
    procedure_id UUID REFERENCES procedimentos(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled',
    consultation_type TEXT DEFAULT 'in_person',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HABILITAR RLS (Row Level Security)
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE ACESSO (PERMITIR TUDO POR ENQUANTO)
-- Pacientes
DROP POLICY IF EXISTS "Permitir tudo em pacientes" ON pacientes;
CREATE POLICY "Permitir tudo em pacientes" ON pacientes FOR ALL USING (true) WITH CHECK (true);

-- Procedimentos
DROP POLICY IF EXISTS "Permitir tudo em procedimentos" ON procedimentos;
CREATE POLICY "Permitir tudo em procedimentos" ON procedimentos FOR ALL USING (true) WITH CHECK (true);

-- Profissionais
DROP POLICY IF EXISTS "Permitir tudo em profissionais" ON profissionais;
CREATE POLICY "Permitir tudo em profissionais" ON profissionais FOR ALL USING (true) WITH CHECK (true);

-- Agendamentos
DROP POLICY IF EXISTS "Permitir tudo em agendamentos" ON agendamentos;
CREATE POLICY "Permitir tudo em agendamentos" ON agendamentos FOR ALL USING (true) WITH CHECK (true);

-- PRONTO!
SELECT 'Tabelas criadas com sucesso!' as status;
