-- ============================================
-- CRIAR POLÍTICAS RLS PERMISSIVAS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. PACIENTES - Permitir tudo temporariamente
DROP POLICY IF EXISTS "Permitir tudo em pacientes" ON pacientes;
CREATE POLICY "Permitir tudo em pacientes"
ON pacientes
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. PROCEDIMENTOS - Permitir tudo
DROP POLICY IF EXISTS "Permitir tudo em procedimentos" ON procedimentos;
CREATE POLICY "Permitir tudo em procedimentos"
ON procedimentos
FOR ALL
USING (true)
WITH CHECK (true);

-- 3. PROFISSIONAIS - Permitir tudo
DROP POLICY IF EXISTS "Permitir tudo em profissionais" ON profissionais;
CREATE POLICY "Permitir tudo em profissionais"
ON profissionais
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. AGENDAMENTOS - Permitir tudo
DROP POLICY IF EXISTS "Permitir tudo em agendamentos" ON agendamentos;
CREATE POLICY "Permitir tudo em agendamentos"
ON agendamentos
FOR ALL
USING (true)
WITH CHECK (true);

-- 5. ANAMNESE - Permitir tudo (se existir)
DROP POLICY IF EXISTS "Permitir tudo em anamnese" ON anamnese;
CREATE POLICY "Permitir tudo em anamnese"
ON anamnese
FOR ALL
USING (true)
WITH CHECK (true);

-- 6. AUTOMATION_RULES - Permitir tudo (se existir)
DROP POLICY IF EXISTS "Permitir tudo em automation_rules" ON automation_rules;
CREATE POLICY "Permitir tudo em automation_rules"
ON automation_rules
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFICAR SE DEU CERTO
-- ============================================
SELECT
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
