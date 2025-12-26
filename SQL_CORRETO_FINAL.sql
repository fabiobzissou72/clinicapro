-- ============================================
-- SQL CORRETO - USA OS SCHEMAS REAIS DO SUPABASE
-- ============================================

-- PASSO 1: CRIAR POLÍTICAS RLS (isso resolve os erros 401)
DROP POLICY IF EXISTS "Permitir tudo em pacientes" ON pacientes;
CREATE POLICY "Permitir tudo em pacientes" ON pacientes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir tudo em procedimentos" ON procedimentos;
CREATE POLICY "Permitir tudo em procedimentos" ON procedimentos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir tudo em agendamentos" ON agendamentos;
CREATE POLICY "Permitir tudo em agendamentos" ON agendamentos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir tudo em profiles" ON profiles;
CREATE POLICY "Permitir tudo em profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- PASSO 2: HABILITAR RLS
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- PASSO 3: POPULAR PACIENTES
INSERT INTO pacientes (full_name, cpf, phone, email, birth_date, address) VALUES
('Maria Silva Santos', '111.222.333-44', '(11) 98888-7777', 'maria@email.com', '1985-03-15', 'Rua das Flores, 123 - São Paulo/SP'),
('João Pedro Costa', '222.333.444-55', '(11) 97777-6666', 'joao@email.com', '1990-07-22', 'Av. Paulista, 456 - São Paulo/SP'),
('Ana Paula Lima', '333.444.555-66', '(11) 96666-5555', 'ana@email.com', '1992-11-30', 'Rua das Acácias, 789 - São Paulo/SP'),
('Carlos Eduardo', '444.555.666-77', '(11) 95555-4444', 'carlos@email.com', '1988-05-10', 'Av. Brasil, 321 - São Paulo/SP'),
('Juliana Martins', '555.666.777-88', '(11) 94444-3333', 'juliana@email.com', '1995-09-18', 'Rua Augusta, 654 - São Paulo/SP')
ON CONFLICT (cpf) DO NOTHING;

-- PASSO 4: POPULAR PROCEDIMENTOS
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

-- PASSO 5: CRIAR PROFISSIONAIS EM PROFILES (se não existirem)
-- Nota: profiles pode ter outras colunas, adapte conforme necessário
INSERT INTO profiles (id, full_name, email) VALUES
(gen_random_uuid(), 'Dra. Juliana Costa', 'dra.juliana@clinica.com'),
(gen_random_uuid(), 'Dr. Ricardo Mendes', 'dr.ricardo@clinica.com'),
(gen_random_uuid(), 'Esteticista Carla Santos', 'carla@clinica.com')
ON CONFLICT DO NOTHING;

-- PASSO 6: CRIAR AGENDAMENTOS (com TIMESTAMP correto!)
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
    -- Pegar IDs
    SELECT id INTO paciente1_id FROM pacientes WHERE email = 'maria@email.com' LIMIT 1;
    SELECT id INTO paciente2_id FROM pacientes WHERE email = 'joao@email.com' LIMIT 1;
    SELECT id INTO paciente3_id FROM pacientes WHERE email = 'ana@email.com' LIMIT 1;

    SELECT id INTO prof1_id FROM profiles WHERE email = 'dra.juliana@clinica.com' LIMIT 1;
    SELECT id INTO prof2_id FROM profiles WHERE email = 'dr.ricardo@clinica.com' LIMIT 1;

    SELECT id INTO proc1_id FROM procedimentos WHERE name = 'Limpeza de Pele Profunda' LIMIT 1;
    SELECT id INTO proc2_id FROM procedimentos WHERE name = 'Botox - 3 Áreas' LIMIT 1;
    SELECT id INTO proc3_id FROM procedimentos WHERE name = 'Preenchimento Labial' LIMIT 1;

    -- Inserir agendamentos com TIMESTAMP (não DATE + TIME separados!)
    INSERT INTO agendamentos (paciente_id, procedimento_id, professional_id, start_time, end_time, status, source)
    VALUES
    -- HOJE
    (paciente1_id, proc1_id, prof1_id,
     CURRENT_DATE + INTERVAL '9 hours',
     CURRENT_DATE + INTERVAL '10 hours',
     'pending', 'manual'),

    (paciente2_id, proc2_id, prof1_id,
     CURRENT_DATE + INTERVAL '14 hours',
     CURRENT_DATE + INTERVAL '14 hours 30 minutes',
     'confirmed', 'manual'),

    -- AMANHÃ
    (paciente3_id, proc3_id, prof2_id,
     CURRENT_DATE + INTERVAL '1 day 10 hours',
     CURRENT_DATE + INTERVAL '1 day 10 hours 45 minutes',
     'confirmed', 'manual'),

    (paciente1_id, proc1_id, prof2_id,
     CURRENT_DATE + INTERVAL '1 day 15 hours 30 minutes',
     CURRENT_DATE + INTERVAL '1 day 16 hours 30 minutes',
     'pending', 'manual'),

    -- DAQUI 2 DIAS
    (paciente2_id, proc3_id, prof1_id,
     CURRENT_DATE + INTERVAL '2 days 9 hours 30 minutes',
     CURRENT_DATE + INTERVAL '2 days 10 hours 15 minutes',
     'pending', 'manual'),

    (paciente3_id, proc2_id, prof1_id,
     CURRENT_DATE + INTERVAL '2 days 11 hours',
     CURRENT_DATE + INTERVAL '2 days 11 hours 30 minutes',
     'confirmed', 'manual'),

    -- DAQUI 3 DIAS
    (paciente1_id, proc2_id, prof2_id,
     CURRENT_DATE + INTERVAL '3 days 14 hours',
     CURRENT_DATE + INTERVAL '3 days 14 hours 30 minutes',
     'pending', 'manual'),

    -- DAQUI 4 DIAS
    (paciente2_id, proc1_id, prof1_id,
     CURRENT_DATE + INTERVAL '4 days 10 hours',
     CURRENT_DATE + INTERVAL '4 days 11 hours',
     'pending', 'manual'),

    (paciente3_id, proc3_id, prof2_id,
     CURRENT_DATE + INTERVAL '4 days 16 hours',
     CURRENT_DATE + INTERVAL '4 days 16 hours 45 minutes',
     'confirmed', 'manual')

    ON CONFLICT DO NOTHING;
END $$;

-- VERIFICAR
SELECT '✅ SQL EXECUTADO COM SUCESSO!' as status;
SELECT COUNT(*) as total_pacientes FROM pacientes;
SELECT COUNT(*) as total_procedimentos FROM procedimentos;
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT COUNT(*) as total_agendamentos FROM agendamentos;
