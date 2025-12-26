# 🏗️ Arquitetura do Sistema

## 📋 Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                    USUÁRIOS FINAIS                      │
├──────────────┬──────────────┬──────────────┬───────────┤
│   Paciente   │ Profissional │   Admin/     │ WhatsApp  │
│   (PWA App)  │  (Dashboard) │ Recepção     │   Bot     │
└──────┬───────┴──────┬───────┴──────┬───────┴─────┬─────┘
       │              │               │              │
       ├──────────────┴───────────────┴──────────────┤
       │                                              │
┌──────▼──────────────────────────────────────────────▼────┐
│              API FASTAPI (Backend Central)              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Routers:                                           │ │
│  │ • auth, patients, appointments, procedures        │ │
│  │ • financial, inventory, orders, automation        │ │
│  │ • whatsapp, ai, telemedicine, integrations       │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Services:                                          │ │
│  │ • AIService (Whisper + GPT)                       │ │
│  │ • WhatsAppService (Evolution API)                 │ │
│  │ • PaymentService, NotificationService             │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────┬───────────────────┬────────────────────┘
                 │                   │
        ┌────────▼────────┐ ┌────────▼──────────┐
        │   SUPABASE      │ │  EXTERNAL APIs    │
        │   PostgreSQL    │ │  • OpenAI         │
        │   • Auth        │ │  • Evolution API  │
        │   • Storage     │ │  • MercadoPago    │
        │   • Realtime    │ │  • NFe.io         │
        └─────────────────┘ └───────────────────┘
```

---

## 🎯 Camadas da Aplicação

### 1. **Apresentação (Frontend)**

#### Dashboard Admin (React + TypeScript)
**Responsabilidade:** Interface para equipe da clínica

**Componentes:**
- `Dashboard.tsx` - Visão geral com métricas
- `Appointments.tsx` - Agenda inteligente
- `Patients.tsx` - Gestão de pacientes
- `Financeiro.tsx` - Controle financeiro
- `Sidebar.tsx`, `Header.tsx` - Layout

**Funcionalidades:**
- Gestão completa de agendamentos
- Prontuário eletrônico + áudio
- Controle financeiro
- Telemedicina
- Relatórios

#### PWA Cliente (React + Vite + PWA)
**Responsabilidade:** App mobile para pacientes

**Páginas:**
- `Home.tsx` - Dashboard do paciente
- `NewAppointment.tsx` - Agendamento online
- `Appointments.tsx` - Ver agendamentos
- `Shop.tsx` - Loja virtual
- `Cart.tsx` - Carrinho de compras
- `History.tsx` - Histórico de procedimentos
- `Profile.tsx` - Perfil e pontos

**Características:**
- Instalável (PWA)
- Offline-first
- Push notifications
- Responsivo

---

### 2. **Lógica de Negócio (Backend)**

#### API FastAPI (Python)
**Responsabilidade:** Processamento de regras de negócio

**Estrutura:**
```
api/
├── app/
│   ├── main.py              # Entry point
│   ├── routers/             # Endpoints REST
│   │   ├── auth.py
│   │   ├── patients.py
│   │   ├── appointments.py
│   │   ├── ai.py
│   │   ├── whatsapp.py
│   │   ├── telemedicine.py
│   │   └── ...
│   ├── services/            # Lógica de negócio
│   │   ├── ai_service.py
│   │   ├── whatsapp_service.py
│   │   └── ...
│   ├── core/                # Configurações
│   │   ├── config.py
│   │   └── supabase.py
│   └── utils/               # Utilidades
```

**Serviços Principais:**

##### AIService
```python
- transcribe_audio()        # Whisper
- summarize_medical_record() # GPT-4
- extract_key_info()         # Estruturação
```

##### WhatsAppService
```python
- send_text_message()
- send_audio_message()
- send_appointment_confirmation()
- process_incoming_audio()   # Prontuário
- process_patient_message()  # Bot
```

---

### 3. **Dados (Persistência)**

#### Supabase PostgreSQL
**Responsabilidade:** Armazenamento e gerenciamento de dados

**Tabelas Principais:**

```
profiles              # Usuários (profissionais, admin)
pacientes             # Pacientes/clientes
agendamentos          # Agendamentos
procedimentos         # Catálogo de procedimentos
medical_audio_records # Áudios de prontuário + transcrição
financeiro            # Transações financeiras
estoque               # Produtos
orders                # Pedidos da loja
whatsapp_messages     # Histórico WhatsApp
automation_rules      # Regras de automação
telemedicine_sessions # Sessões de telemedicina
```

**Recursos Utilizados:**
- Row Level Security (RLS)
- Triggers e Functions
- Realtime subscriptions
- Auth integrado
- Storage para arquivos

---

### 4. **Integrações Externas**

#### OpenAI API
```
Whisper (transcrição)  → medical_audio_records.transcription
GPT-4 (resumo)         → medical_audio_records.ai_summary
GPT-4 (chatbot)        → Respostas automáticas WhatsApp
```

#### Evolution API (WhatsApp)
```
Envio de mensagens     → whatsapp_service.send_*
Webhooks (recebimento) → /api/whatsapp/webhook
QR Code (conexão)      → whatsapp_sessions
```

#### MercadoPago / ASAAS
```
Criar pagamento        → financeiro.payment_id
Webhooks              → Atualizar status
Gerar link            → orders.payment_link
```

#### NFe.io
```
Emitir nota           → Após pagamento confirmado
Armazenar XML         → documents
```

---

## 🔄 Fluxos de Dados

### Fluxo 1: Prontuário com IA

```
┌─────────────────────────────────────────────────────────┐
│ PROFISSIONAL                                            │
│ Grava áudio (Dashboard ou WhatsApp)                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  Upload Áudio   │
         │  /api/ai/       │
         │  transcribe     │
         └────────┬────────┘
                  │
                  ▼
      ┌───────────────────────┐
      │ Salvar em             │
      │ medical_audio_records │
      │ status: processing    │
      └───────┬───────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ OpenAI Whisper API  │
    │ Transcreve áudio    │
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Salvar transcrição  │
    │ status: completed   │
    └─────────┬───────────┘
              │
              ▼ (Opcional)
    ┌─────────────────────┐
    │ GPT-4 Resumo        │
    │ Estrutura dados     │
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Salvar ai_summary   │
    │ Extrair info chave  │
    └─────────────────────┘
```

### Fluxo 2: Agendamento via WhatsApp

```
┌─────────────────────────────────────────────────────┐
│ PACIENTE                                            │
│ Manda "agendar" no WhatsApp                        │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
       ┌─────────────────┐
       │ Evolution API   │
       │ Webhook         │
       └────────┬────────┘
                │
                ▼
    ┌───────────────────────┐
    │ /api/whatsapp/webhook │
    │ Identifica paciente   │
    └───────┬───────────────┘
            │
            ▼
  ┌─────────────────────┐
  │ Bot: Lista          │
  │ procedimentos       │
  └─────────┬───────────┘
            │
            ▼
  ┌─────────────────────┐
  │ Paciente escolhe    │
  │ Procedimento        │
  └─────────┬───────────┘
            │
            ▼
  ┌─────────────────────────────┐
  │ Bot: Mostra horários        │
  │ /api/appointments/          │
  │ available-slots             │
  └─────────┬───────────────────┘
            │
            ▼
  ┌─────────────────────┐
  │ Paciente escolhe    │
  │ Horário             │
  └─────────┬───────────┘
            │
            ▼
  ┌─────────────────────────┐
  │ Criar agendamento       │
  │ POST /api/appointments  │
  └─────────┬───────────────┘
            │
            ▼
  ┌─────────────────────────┐
  │ Enviar confirmação      │
  │ WhatsApp                │
  └─────────────────────────┘
```

### Fluxo 3: Automações (Webhooks)

```
┌──────────────────────────────────────────┐
│ EVENTO TRIGGER                           │
│ (Agendamento criado, 24h antes, etc)     │
└───────────────┬──────────────────────────┘
                │
                ▼
     ┌──────────────────────┐
     │ Celery Task /        │
     │ Cron Job             │
     └──────────┬───────────┘
                │
                ▼
   ┌────────────────────────┐
   │ Buscar automation_rules│
   │ que matcham trigger    │
   └────────┬───────────────┘
            │
            ▼
  ┌─────────────────────────┐
  │ Processar template      │
  │ Substituir variáveis    │
  │ {nome_cliente}, etc     │
  └─────────┬───────────────┘
            │
            ▼
  ┌─────────────────────────┐
  │ Enviar por canal        │
  │ (whatsapp/sms/email)    │
  └─────────┬───────────────┘
            │
            ▼
  ┌─────────────────────────┐
  │ Salvar em               │
  │ automation_logs         │
  └─────────────────────────┘
```

---

## 🔐 Segurança

### Autenticação
- Supabase Auth (JWT)
- Row Level Security (RLS)
- Roles: admin, professional, receptionist, client

### Autorização
```python
# Exemplo de policy RLS
CREATE POLICY "Users can only see their own data"
ON pacientes FOR SELECT
USING (auth.uid() = profile_id);
```

### Proteções
- Rate limiting
- Input sanitization
- CORS configurado
- HTTPS obrigatório (produção)
- Audit logs (LGPD)

---

## 📊 Performance

### Caching
- Redis para sessions
- Browser cache (PWA)
- Supabase cache automático

### Otimizações
- Indexes no banco
- Lazy loading (frontend)
- Pagination
- Background tasks (Celery)
- WebSockets (telemedicina)

---

## 🚀 Escalabilidade

### Horizontal
- API stateless (pode escalar)
- Load balancer
- Multiple instances

### Vertical
- Supabase auto-scaling
- CDN para assets
- File storage separado

---

## 🛠️ DevOps

### Desenvolvimento
```
Docker Compose (opcional)
- API
- Redis
- Evolution API
```

### Staging
```
Railway/Render (API)
Vercel (Frontend)
Supabase (Production DB)
```

### Produção
```
+ Monitoring (Sentry)
+ Logs (CloudWatch/LogTail)
+ Backups automáticos
+ CI/CD (GitHub Actions)
```

---

**Arquitetura projetada para:**
- ✅ Alta disponibilidade
- ✅ Fácil manutenção
- ✅ Extensibilidade
- ✅ Segurança
- ✅ Performance
