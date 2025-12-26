-- ============================================
-- SQL COMPLETO - CRIAR TUDO QUE ESTÁ FALTANDO
-- Execute este SQL de UMA VEZ SÓ
-- ============================================

-- PASSO 1: CRIAR TABELA PROFISSIONAIS (que está faltando!)
CREATE TABLE IF NOT EXISTS profissionais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    cpf TEXT,
    phone TEXT,
    email TEXT,
    specialty TEXT,
    commission_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 2: HABILITAR RLS
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- PASSO 3: CRIAR POLÍTICAS PERMISSIVAS
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

-- PASSO 4: POPULAR DADOS DE EXEMPLO

-- 4.1. PACIENTES
INSERT INTO pacientes (full_name, cpf, phone, email, birth_date, address) VALUES
('Maria Silva Santos', '111.222.333-44', '(11) 98888-7777', 'maria@email.com', '1985-03-15', 'Rua das Flores, 123 - São Paulo/SP'),
('João Pedro Costa', '222.333.444-55', '(11) 97777-6666', 'joao@email.com', '1990-07-22', 'Av. Paulista, 456 - São Paulo/SP'),
('Ana Paula Lima', '333.444.555-66', '(11) 96666-5555', 'ana@email.com', '1992-11-30', 'Rua das Acácias, 789 - São Paulo/SP'),
('Carlos Eduardo', '444.555.666-77', '(11) 95555-4444', 'carlos@email.com', '1988-05-10', 'Av. Brasil, 321 - São Paulo/SP'),
('Juliana Martins', '555.666.777-88', '(11) 94444-3333', 'juliana@email.com', '1995-09-18', 'Rua Augusta, 654 - São Paulo/SP')
ON CONFLICT (cpf) DO NOTHING;

-- 4.2. PROFISSIONAIS (AGORA VAI FUNCIONAR!)
INSERT INTO profissionais (full_name, cpf, phone, email, specialty, commission_percentage) VALUES
('Dra. Juliana Costa', '888.999.000-11', '(11) 91111-2222', 'dra.juliana@clinica.com', 'Dermatologista', 40.00),
('Dr. Ricardo Mendes', '999.000.111-22', '(11) 92222-3333', 'dr.ricardo@clinica.com', 'Cirurgião Plástico', 45.00),
('Esteticista Carla Santos', '000.111.222-33', '(11) 93333-4444', 'carla@clinica.com', 'Esteticista', 30.00)
ON CONFLICT DO NOTHING;

-- 4.3. PROCEDIMENTOS
INSERT INTO procedimentos (name, price) VALUES
('Limpeza de Pele Profunda', 150.00),
('Botox - 3 Áreas', 1200.00),
('Preenchimento Labial', 950.00),
('Bioestimulador de Colágeno', 1800.00),
('Depilação a Laser - Axilas', 120.00),
('Peeling Químico', 350.00),
('Drenagem Linfática Facial', 180.00),
('Microagulhamento', 450.00)
ON CONFLICT DO NOTHING;

-- 4.4. AGENDAMENTOS (usando IDs reais)
DO $$
DECLARE
    paciente1_id UUID;
    paciente2_id UUID;
    paciente3_id UUID;
    prof1_id UUID;
    prof2_id UUID;
    proc1_id UUID;
    proc2_id UUID;
    proc3_id UUID;
BEGIN
    -- Pegar IDs dos pacientes
    SELECT id INTO paciente1_id FROM pacientes WHERE email = 'maria@email.com' LIMIT 1;
    SELECT id INTO paciente2_id FROM pacientes WHERE email = 'joao@email.com' LIMIT 1;
    SELECT id INTO paciente3_id FROM pacientes WHERE email = 'ana@email.com' LIMIT 1;

    -- Pegar IDs dos profissionais
    SELECT id INTO prof1_id FROM profissionais WHERE email = 'dra.juliana@clinica.com' LIMIT 1;
    SELECT id INTO prof2_id FROM profissionais WHERE email = 'dr.ricardo@clinica.com' LIMIT 1;

    -- Pegar IDs dos procedimentos
    SELECT id INTO proc1_id FROM procedimentos WHERE name = 'Limpeza de Pele Profunda' LIMIT 1;
    SELECT id INTO proc2_id FROM procedimentos WHERE name = 'Botox - 3 Áreas' LIMIT 1;
    SELECT id INTO proc3_id FROM procedimentos WHERE name = 'Preenchimento Labial' LIMIT 1;

    -- Inserir agendamentos para os próximos dias
    INSERT INTO agendamentos (patient_id, professional_id, procedure_id, appointment_date, start_time, end_time, status, consultation_type)
    VALUES
    -- Hoje
    (paciente1_id, prof1_id, proc1_id, CURRENT_DATE, '09:00', '10:00', 'scheduled', 'in_person'),
    (paciente2_id, prof1_id, proc2_id, CURRENT_DATE, '14:00', '14:30', 'confirmed', 'in_person'),

    -- Amanhã
    (paciente3_id, prof2_id, proc3_id, CURRENT_DATE + 1, '10:00', '10:45', 'confirmed', 'in_person'),
    (paciente1_id, prof2_id, proc1_id, CURRENT_DATE + 1, '15:30', '16:30', 'scheduled', 'in_person'),

    -- Daqui 2 dias
    (paciente2_id, prof1_id, proc3_id, CURRENT_DATE + 2, '09:30', '10:15', 'scheduled', 'telemedicine'),
    (paciente3_id, prof1_id, proc2_id, CURRENT_DATE + 2, '11:00', '11:30', 'confirmed', 'in_person'),

    -- Daqui 3 dias
    (paciente1_id, prof2_id, proc2_id, CURRENT_DATE + 3, '14:00', '14:30', 'scheduled', 'in_person'),

    -- Daqui 4 dias
    (paciente2_id, prof1_id, proc1_id, CURRENT_DATE + 4, '10:00', '11:00', 'scheduled', 'in_person'),
    (paciente3_id, prof2_id, proc3_id, CURRENT_DATE + 4, '16:00', '16:45', 'confirmed', 'in_person')

    ON CONFLICT DO NOTHING;
END $$;

-- PASSO 5: VERIFICAR SE DEU TUDO CERTO
SELECT '✅ TABELAS CRIADAS!' as status;
SELECT COUNT(*) as total_pacientes FROM pacientes;
SELECT COUNT(*) as total_profissionais FROM profissionais;
SELECT COUNT(*) as total_procedimentos FROM procedimentos;
SELECT COUNT(*) as total_agendamentos FROM agendamentos;
