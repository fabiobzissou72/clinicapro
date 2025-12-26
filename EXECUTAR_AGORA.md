# 🔥 EXECUTAR AGORA - 3 PASSOS SIMPLES

## ✅ O QUE JÁ ESTÁ PRONTO:
- Código do Appointments.tsx AJUSTADO
- SQL de políticas RLS criado
- SQL de dados de exemplo criado

---

## 📋 PASSO 1: CRIAR POLÍTICAS RLS (OBRIGATÓRIO)

**Isso vai resolver os erros 401 Unauthorized**

1. Abra: https://supabase.com/dashboard
2. Projeto: `djymykdwcxnsyzkdduub`
3. Clique em **SQL Editor** (barra lateral)
4. Clique em **New Query**
5. Copie TODO o arquivo: **`criar_politicas_rls.sql`**
6. Cole e clique **RUN**

**✅ Sucesso:** Verá uma tabela com as políticas criadas

---

## 📋 PASSO 2: POPULAR DADOS DE EXEMPLO (OPCIONAL MAS RECOMENDADO)

**Isso vai colocar pacientes, procedimentos e agendamentos no banco**

1. No mesmo **SQL Editor**
2. Clique em **New Query**
3. Copie TODO o arquivo: **`popular_dados_simples.sql`**
4. Cole e clique **RUN**

**✅ Sucesso:** Verá:
- Dados criados com sucesso!
- total_pacientes: 5
- total_procedimentos: 8
- total_profissionais: 3
- total_agendamentos: 3

---

## 📋 PASSO 3: TESTAR O DASHBOARD

1. Abra o terminal
2. Execute: `npm run dev`
3. Abra: http://localhost:5173
4. Clique em **Agendamentos**

**✅ Você vai ver:**
- ✅ Calendário funcionando (Dia | Semana | Mês)
- ✅ 3 agendamentos nos próximos dias
- ✅ Botão "Novo Agendamento" funcional
- ✅ Busca de pacientes por nome, telefone, CPF
- ✅ Criar novo paciente direto do modal

---

## 🎯 TESTANDO CRIAR NOVO AGENDAMENTO:

1. Clique em **Novo Agendamento**
2. Busque "Maria" → Selecione "Maria Silva Santos"
3. Escolha um procedimento (ex: Limpeza de Pele)
4. Escolha data e horário
5. Clique **Criar**

**✅ O agendamento aparece no calendário!**

---

## 🆘 SE DER ERRO:

### Erro 401 Unauthorized
→ Execute o PASSO 1 novamente

### Erro 404 Not Found
→ Tabela não existe. Me avise qual tabela.

### Erro de coluna não existe
→ Código JÁ ESTÁ AJUSTADO para ser robusto

### Calendário vazio
→ Execute o PASSO 2 para ter dados

---

## 🚀 PRÓXIMOS PASSOS (DEPOIS QUE FUNCIONAR):

1. ✅ Integração WhatsApp para criar agendamentos
2. ✅ App mobile para criar agendamentos
3. ✅ Notificações automáticas
4. ✅ Dashboard com métricas

---

**COMECE PELO PASSO 1 AGORA!**

É só copiar e colar o SQL no Supabase. Leva 30 segundos! 🚀
