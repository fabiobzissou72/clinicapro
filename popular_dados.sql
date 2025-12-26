-- POPULAR BANCO COM DADOS DE EXEMPLO
-- Execute este SQL no Supabase SQL Editor

-- 1. PACIENTES
INSERT INTO pacientes (full_name, cpf, phone, email, birth_date, address) VALUES
('Maria Silva Santos', '111.222.333-44', '(11) 98888-7777', 'maria@email.com', '1985-03-15', 'Rua das Flores, 123 - São Paulo/SP'),
('João Pedro Costa', '222.333.444-55', '(11) 97777-6666', 'joao@email.com', '1990-07-22', 'Av. Paulista, 456 - São Paulo/SP'),
('Ana Paula Lima', '333.444.555-66', '(11) 96666-5555', 'ana@email.com', '1992-11-30', 'Rua das Acácias, 789 - São Paulo/SP'),
('Carlos Eduardo', '444.555.666-77', '(11) 95555-4444', 'carlos@email.com', '1988-05-10', 'Av. Brasil, 321 - São Paulo/SP'),
('Juliana Martins', '555.666.777-88', '(11) 94444-3333', 'juliana@email.com', '1995-09-18', 'Rua Augusta, 654 - São Paulo/SP')
ON CONFLICT DO NOTHING;

-- 2. PROCEDIMENTOS
INSERT INTO procedimentos (name, description, duration_minutes, price, category) VALUES
('Limpeza de Pele Profunda', 'Limpeza facial completa com extração e máscara', 60, 150.00, 'facial'),
('Botox - 3 Áreas', 'Aplicação de toxina botulínica em 3 áreas', 30, 1200.00, 'injetavel'),
('Preenchimento Labial', 'Preenchimento com ácido hialurônico', 45, 950.00, 'injetavel'),
('Bioestimulador de Colágeno', 'Estimulação de colágeno facial', 60, 1800.00, 'injetavel'),
('Depilação a Laser - Axilas', 'Depilação definitiva', 20, 120.00, 'depilacao'),
('Peeling Químico', 'Peeling para renovação celular', 45, 350.00, 'facial'),
('Drenagem Linfática Facial', 'Massagem facial drenante', 50, 180.00, 'corporal'),
('Microagulhamento', 'Tratamento com microagulhas', 60, 450.00, 'facial')
ON CONFLICT DO NOTHING;

-- 3. PROFISSIONAIS
INSERT INTO profissionais (full_name, cpf, phone, email, specialty, commission_percentage) VALUES
('Dra. Juliana Costa', '888.999.000-11', '(11) 91111-2222', 'dra.juliana@clinica.com', 'Dermatologista', 40.00),
('Dr. Ricardo Mendes', '999.000.111-22', '(11) 92222-3333', 'dr.ricardo@clinica.com', 'Cirurgião Plástico', 45.00),
('Esteticista Carla Santos', '000.111.222-33', '(11) 93333-4444', 'carla@clinica.com', 'Esteticista', 30.00)
ON CONFLICT DO NOTHING;

-- 4. AGENDAMENTOS (Próximos dias)
INSERT INTO agendamentos (
    patient_id,
    professional_id,
    procedure_id,
    appointment_date,
    start_time,
    end_time,
    status,
    consultation_type,
    notes
)
SELECT
    p.id as patient_id,
    prof.id as professional_id,
    proc.id as procedure_id,
    CURRENT_DATE + (random() * 7)::int as appointment_date,
    ('09:00:00'::time + (floor(random() * 8) || ' hours')::interval) as start_time,
    ('10:00:00'::time + (floor(random() * 8) || ' hours')::interval) as end_time,
    (ARRAY['scheduled', 'confirmed', 'in_progress'])[floor(random() * 3 + 1)] as status,
    'in_person' as consultation_type,
    'Agendamento de exemplo' as notes
FROM pacientes p
CROSS JOIN profissionais prof
CROSS JOIN procedimentos proc
WHERE random() < 0.3
LIMIT 20
ON CONFLICT DO NOTHING;

-- 5. ANAMNESE de Exemplo
INSERT INTO anamnese (
    patient_id,
    main_complaint,
    allergies,
    medications,
    smoking,
    alcohol,
    skin_type,
    previous_aesthetic_procedures,
    expectations
)
SELECT
    id as patient_id,
    'Deseja melhorar a aparência da pele' as main_complaint,
    'Nenhuma alergia conhecida' as allergies,
    'Nenhum medicamento regular' as medications,
    false as smoking,
    false as alcohol,
    (ARRAY['oleosa', 'seca', 'mista', 'normal'])[floor(random() * 4 + 1)] as skin_type,
    'Nunca realizou procedimentos estéticos' as previous_aesthetic_procedures,
    'Espera rejuvenescer e melhorar autoestima' as expectations
FROM pacientes
ON CONFLICT DO NOTHING;

-- 6. REGRAS DE AUTOMAÇÃO WhatsApp
INSERT INTO automation_rules (
    name,
    trigger_type,
    trigger_time_minutes,
    message_template,
    is_active
) VALUES
('Confirmação de Agendamento', 'appointment_confirmation', 0,
'Olá {{nome}}! 👋

Seu agendamento está confirmado:
📅 Data: {{data}}
🕐 Horário: {{horario}}
💅 Procedimento: {{procedimento}}

Estamos te esperando! ✨', true),

('Lembrete 24h Antes', 'appointment_reminder', 1440,
'Oi {{nome}}! 👋

Lembrete: Você tem um procedimento amanhã!
📅 {{data}} às {{horario}}
💅 {{procedimento}}

Nos vemos lá! 💖', true),

('Follow-up Pós-Procedimento', 'follow_up', 1440,
'Oi {{nome}}! 💕

Como você está se sentindo após o procedimento de {{procedimento}}?

Qualquer dúvida, estou aqui! 😊', true)
ON CONFLICT DO NOTHING;

-- SUCESSO!
SELECT 'Dados populados com sucesso!' as status;
