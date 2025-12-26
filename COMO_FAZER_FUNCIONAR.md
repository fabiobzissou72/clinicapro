# 🚀 COMO FAZER O DASHBOARD FUNCIONAR - PASSO A PASSO

## PROBLEMA ATUAL:
- ✅ Tabelas JÁ EXISTEM no Supabase
- ❌ Políticas RLS estão BLOQUEANDO acesso (401 Unauthorized)
- ❌ Schemas das tabelas são DIFERENTES do esperado

---

## PASSO 1: CRIAR POLÍTICAS RLS

1. Acesse: https://supabase.com/dashboard
2. Entre no projeto: `djymykdwcxnsyzkdduub`
3. Vá em **SQL Editor** (barra lateral esquerda)
4. Clique em **New Query**
5. Copie TODO o conteúdo do arquivo: `criar_politicas_rls.sql`
6. Cole no editor
7. Clique em **RUN** (ou Ctrl+Enter)

**Resultado esperado:** Verá uma tabela com as políticas criadas

---

## PASSO 2: VERIFICAR SCHEMA DAS TABELAS

1. No mesmo **SQL Editor**
2. Clique em **New Query**
3. Copie TODO o conteúdo do arquivo: `verificar_schema.sql`
4. Cole no editor
5. Clique em **RUN**

**Resultado esperado:** Verá as colunas de cada tabela

---

## PASSO 3: COPIAR O RESULTADO AQUI

Me envie o resultado do PASSO 2 para eu ajustar o código corretamente!

---

## O QUE VAI ACONTECER DEPOIS:

1. Vou ajustar o `Appointments.tsx` para usar as colunas corretas
2. Vou criar dados de exemplo que funcionem
3. O calendário vai FUNCIONAR DE VERDADE!

---

## ERROS COMUNS:

### ❌ "Could not find the 'medical_notes' column"
**Solução:** Já removido do código

### ❌ "401 Unauthorized"
**Solução:** Execute o PASSO 1

### ❌ "duration_minutes does not exist"
**Solução:** Execute o PASSO 2 e me envie o resultado

---

**FAÇA O PASSO 1 AGORA! É O MAIS IMPORTANTE!**
