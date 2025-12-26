-- ============================================
-- POPULAR BANCO COM DADOS SIMPLES
-- Use este SQL DEPOIS de criar as políticas RLS
-- ============================================

-- 1. PACIENTES (usando apenas campos básicos)
INSERT INTO pacientes (full_name, cpf, phone, email, birth_date) VALUES
('Maria Silva Santos', '111.222.333-44', '(11) 98888-7777', 'maria@email.com', '1985-03-15'),
('João Pedro Costa', '222.333.444-55', '(11) 97777-6666', 'joao@email.com', '1990-07-22'),
('Ana Paula Lima', '333.444.555-66', '(11) 96666-5555', 'ana@email.com', '1992-11-30'),
('Carlos Eduardo', '444.555.666-77', '(11) 95555-4444', 'carlos@email.com', '1988-05-10'),
('Juliana Martins', '555.666.777-88', '(11) 94444-3333', 'juliana@email.com', '1995-09-18')
ON CONFLICT (cpf) DO NOTHING;

-- 2. PROCEDIMENTOS (usando apenas campos básicos - name e price)
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

-- 3. PROFISSIONAIS (usando apenas campos básicos)
INSERT INTO profissionais (full_name, phone, email) VALUES
('Dra. Juliana Costa', '(11) 91111-2222', 'dra.juliana@clinica.com'),
('Dr. Ricardo Mendes', '(11) 92222-3333', 'dr.ricardo@clinica.com'),
('Esteticista Carla Santos', '(11) 93333-4444', 'carla@clinica.com')
ON CONFLICT DO NOTHING;

-- 4. AGENDAMENTOS (versão simples)
-- Primeiro vamos pegar os IDs para usar
DO $$
DECLARE
    paciente1_id UUID;
    paciente2_id UUID;
    prof1_id UUID;
    proc1_id UUID;
BEGIN
    -- Pegar IDs
    SELECT id INTO paciente1_id FROM pacientes WHERE email = 'maria@email.com' LIMIT 1;
    SELECT id INTO prof1_id FROM profissionais WHERE email = 'dra.juliana@clinica.com' LIMIT 1;
    SELECT id INTO proc1_id FROM procedimentos WHERE name = 'Limpeza de Pele Profunda' LIMIT 1;

    -- Inserir alguns agendamentos
    INSERT INTO agendamentos (patient_id, professional_id, procedure_id, appointment_date, start_time, end_time, status)
    VALUES
    (paciente1_id, prof1_id, proc1_id, CURRENT_DATE + 1, '09:00', '10:00', 'scheduled'),
    (paciente1_id, prof1_id, proc1_id, CURRENT_DATE + 2, '14:00', '15:00', 'confirmed'),
    (paciente1_id, prof1_id, proc1_id, CURRENT_DATE + 3, '10:30', '11:30', 'scheduled')
    ON CONFLICT DO NOTHING;
END $$;

-- VERIFICAR SE DEU CERTO
SELECT 'Dados criados com sucesso!' as status;
SELECT COUNT(*) as total_pacientes FROM pacientes;
SELECT COUNT(*) as total_procedimentos FROM procedimentos;
SELECT COUNT(*) as total_profissionais FROM profissionais;
SELECT COUNT(*) as total_agendamentos FROM agendamentos;
