# 🏥 Clínica Estética Pro - Sistema Completo

Sistema completo de gestão para clínicas estéticas com **Dashboard Admin**, **API FastAPI**, **WhatsApp Bot**, **PWA Cliente** e **IA integrada**.

## 🚀 Funcionalidades

### 📊 Dashboard Admin (React + TypeScript)
- ✅ Dashboard com gráficos e indicadores
- ✅ Gestão de agendamentos (agenda inteligente)
- ✅ Cadastro de pacientes completo
- ✅ Gestão de procedimentos
- ✅ Controle financeiro (receitas/despesas)
- ✅ Gestão de estoque e produtos
- ✅ Telemedicina (videochamada)
- ✅ Prontuário eletrônico com áudio
- ✅ Relatórios gerenciais

### 🤖 API Backend (FastAPI + Python)
- ✅ **IA Integrada** (Whisper + GPT-4)
  - Transcrição de áudio de prontuários
  - Resumo automático de consultas
  - Extração de informações estruturadas
- ✅ **WhatsApp Integration**
  - Bot para pacientes (agendamento)
  - Bot para profissionais (prontuários por áudio)
  - Notificações automáticas
  - Follow-ups programados
- ✅ **Webhooks Configuráveis**
  - Lembretes de consulta
  - Confirmações
  - Feedbacks automatizados
- ✅ **Telemedicina** (WebRTC)
- ✅ **E-commerce** (Loja virtual)
- ✅ **Pagamentos** (MercadoPago/ASAAS)

### 📱 PWA Cliente (React + Vite)
- ✅ Agendamento online
- ✅ Ver histórico de procedimentos
- ✅ Loja virtual de produtos
- ✅ Carrinho de compras
- ✅ Programa de fidelidade
- ✅ Perfil do paciente
- ✅ Notificações push

### 💬 WhatsApp (Evolution API)
**Fluxo Paciente:**
- Agendar consultas
- Confirmar/cancelar agendamentos
- Ver horários disponíveis
- Receber lembretes
- Comprar produtos

**Fluxo Profissional:**
- Enviar áudios de prontuário
- Receber notificações
- Ver agenda do dia

## 🛠️ Tecnologias

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- Lucide Icons
- React Router
- Recharts

### Backend
- FastAPI (Python)
- Supabase (PostgreSQL)
- OpenAI (Whisper + GPT-4)
- Redis (Cache/Queue)
- WebSockets (Telemedicina)

### Integrações
- Evolution API (WhatsApp)
- MercadoPago / ASAAS (Pagamentos)
- NFe.io (Nota Fiscal)
- Google Calendar (Sincronização)

## 📦 Instalação

### 1. Database (Supabase)

```bash
# Execute o schema SQL no Supabase
psql -h your-project.supabase.co -U postgres -d postgres -f supabase_schema_complete.sql
```

### 2. API Backend

```bash
cd api

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Edite o .env com suas credenciais

# Rodar API
python -m uvicorn app.main:app --reload
```

API rodando em: `http://localhost:8000`
Documentação: `http://localhost:8000/docs`

### 3. Dashboard Admin (Frontend Principal)

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Edite o .env com as URLs da API e Supabase

# Rodar em desenvolvimento
npm run dev
```

Dashboard rodando em: `http://localhost:5173`

### 4. PWA Cliente

```bash
cd pwa-cliente

# Instalar dependências
npm install

# Criar .env
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Rodar
npm run dev
```

PWA rodando em: `http://localhost:5174`

### 5. WhatsApp (Evolution API)

```bash
# Docker Compose
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=your-api-key \
  atendai/evolution-api:latest
```

## 🔑 Variáveis de Ambiente

### API (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

OPENAI_API_KEY=sk-your-key
CLAUDE_API_KEY=your-claude-key

EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-evolution-key

MERCADOPAGO_ACCESS_TOKEN=your-token
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000/api
```

## 📖 Como Usar

### Prontuário com IA

1. **Via Dashboard:**
   - Ir para o atendimento do paciente
   - Clicar em "Gravar Prontuário"
   - Falar sobre a consulta
   - Sistema transcreve automaticamente
   - Opção de gerar resumo com IA

2. **Via WhatsApp (Profissional):**
   - Enviar áudio para o WhatsApp da clínica
   - Sistema identifica profissional
   - Pergunta sobre qual paciente
   - Transcreve e salva automaticamente

### Agendamento Online

1. **Via PWA:**
   - Paciente acessa o app
   - Escolhe procedimento
   - Seleciona data e horário
   - Confirma agendamento
   - Recebe confirmação por WhatsApp

2. **Via WhatsApp:**
   - Paciente manda "agendar"
   - Bot mostra procedimentos
   - Mostra horários disponíveis
   - Confirma agendamento

### Automações

Configure na tela de **Configurações > Automação**:

- **Lembrete 24h antes:** Envia WhatsApp/SMS
- **Confirmação:** Após agendamento
- **Feedback 24h:** Após consulta
- **Follow-up 15 dias:** Verificar satisfação
- **Reagendamento:** Lembretes de retorno

## 🎯 Endpoints Principais da API

```
POST   /api/auth/login                    # Login
POST   /api/auth/signup                   # Cadastro

GET    /api/patients                      # Listar pacientes
POST   /api/patients                      # Criar paciente

GET    /api/appointments                  # Listar agendamentos
POST   /api/appointments                  # Criar agendamento
GET    /api/appointments/available-slots  # Horários disponíveis

POST   /api/ai/transcribe                 # Transcrever áudio
POST   /api/ai/summarize/{id}             # Resumir prontuário

POST   /api/whatsapp/send/message         # Enviar WhatsApp
POST   /api/whatsapp/webhook              # Webhook WhatsApp

GET    /api/dashboard/stats               # Estatísticas
GET    /api/dashboard/revenue-chart       # Gráfico faturamento

POST   /api/telemedicine/sessions         # Criar sessão
WS     /api/telemedicine/ws/{room_id}     # WebSocket videochamada
```

## 📱 Fluxos Principais

### 1. Atendimento Completo
```
Agendamento (Dashboard/PWA/WhatsApp)
  → Confirmação automática (WhatsApp)
  → Lembrete 24h antes
  → Check-in no dia
  → Atendimento + Prontuário por áudio
  → IA transcreve e resume
  → Finalização
  → Feedback automático
```

### 2. Compra de Produtos (PWA)
```
Cliente navega na loja
  → Adiciona ao carrinho
  → Checkout
  → Pagamento online
  → Confirmação
  → Envio
```

## 🔒 Segurança

- ✅ Row Level Security (RLS) no Supabase
- ✅ Autenticação JWT
- ✅ HTTPS obrigatório em produção
- ✅ Sanitização de inputs
- ✅ Rate limiting
- ✅ Logs de auditoria (LGPD)
- ✅ Criptografia de credenciais

## 📊 Dashboard

Métricas disponíveis:
- Agendamentos do dia/mês
- Faturamento (gráficos)
- Novos pacientes
- Taxa de ocupação
- Procedimentos populares
- Comissionamento
- Estoque baixo
- Contas a receber/pagar

## 🤝 Suporte

Sistema desenvolvido por **FBZ Sistemas IA**

Para dúvidas ou suporte:
- 📧 Email: suporte@fbzsistemas.com
- 💬 WhatsApp: (XX) XXXXX-XXXX

## 📝 Licença

Copyright © 2025 FBZ Sistemas

---

**Desenvolvido com ❤️ usando IA (Claude Sonnet 4.5) + FastAPI + React + Supabase**
