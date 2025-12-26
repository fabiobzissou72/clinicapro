# 🏥 Clínica Estética Pro - API

API completa para gestão de clínica estética com IA, automação WhatsApp e integração Supabase.

## 📚 Documentação Interativa

A API possui documentação automática gerada pelo FastAPI:

- **Swagger UI**: [https://sua-api.vercel.app/docs](https://sua-api.vercel.app/docs)
- **ReDoc**: [https://sua-api.vercel.app/redoc](https://sua-api.vercel.app/redoc)
- **OpenAPI Schema**: [https://sua-api.vercel.app/openapi.json](https://sua-api.vercel.app/openapi.json)

## 🚀 Deploy na Vercel

### 1. Configurar Variáveis de Ambiente

No dashboard da Vercel, adicione as seguintes variáveis:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
OPENAI_API_KEY=sk-...
API_SECRET_KEY=sua-chave-secreta-qualquer
CORS_ORIGINS=https://seu-frontend.vercel.app,http://localhost:3000
```

### 2. Deploy

```bash
# Na pasta /api
vercel --prod
```

Ou conecte o repositório GitHub na Vercel e ela fará deploy automático.

## 🛠️ Desenvolvimento Local

### Instalar Dependências

```bash
cd api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configurar .env

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

### Rodar Localmente

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Acesse:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📋 Endpoints Principais

### 🔐 Autenticação (`/api/auth`)
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário logado

### 👥 Pacientes (`/api/patients`)
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Criar paciente
- `GET /api/patients/{id}` - Buscar paciente
- `PUT /api/patients/{id}` - Atualizar paciente
- `DELETE /api/patients/{id}` - Deletar paciente

### 📅 Agendamentos (`/api/appointments`)
- `GET /api/appointments` - Listar agendamentos
- `POST /api/appointments` - Criar agendamento
- `GET /api/appointments/{id}` - Buscar agendamento
- `PUT /api/appointments/{id}` - Atualizar agendamento
- `DELETE /api/appointments/{id}` - Deletar agendamento
- `POST /api/appointments/{id}/confirm` - Confirmar agendamento
- `POST /api/appointments/{id}/cancel` - Cancelar agendamento

### ✨ Procedimentos (`/api/procedures`)
- `GET /api/procedures` - Listar procedimentos
- `POST /api/procedures` - Criar procedimento
- `GET /api/procedures/{id}` - Buscar procedimento
- `PUT /api/procedures/{id}` - Atualizar procedimento
- `DELETE /api/procedures/{id}` - Deletar procedimento

### 💰 Financeiro (`/api/financial`)
- `GET /api/financial/transactions` - Listar transações
- `POST /api/financial/transactions` - Criar transação
- `GET /api/financial/summary` - Resumo financeiro
- `GET /api/financial/reports` - Relatórios

### 📦 Estoque (`/api/inventory`)
- `GET /api/inventory` - Listar produtos
- `POST /api/inventory` - Adicionar produto
- `PUT /api/inventory/{id}` - Atualizar produto
- `POST /api/inventory/{id}/adjust` - Ajustar estoque

### 💬 WhatsApp (`/api/whatsapp`)
- `POST /api/whatsapp/send` - Enviar mensagem
- `POST /api/whatsapp/webhook` - Webhook para receber mensagens
- `GET /api/whatsapp/templates` - Listar templates
- `POST /api/whatsapp/broadcast` - Enviar broadcast

### 🤖 IA & Automação (`/api/ai`)
- `POST /api/ai/analyze-image` - Análise de imagem com IA
- `POST /api/ai/generate-report` - Gerar relatório com IA
- `POST /api/ai/chatbot` - Chatbot inteligente

### 🔄 Automações (`/api/automation`)
- `GET /api/automation/rules` - Listar regras de automação
- `POST /api/automation/rules` - Criar regra
- `POST /api/automation/test/{rule_id}` - Testar regra
- `PUT /api/automation/rules/{id}` - Atualizar regra
- `DELETE /api/automation/rules/{id}` - Deletar regra

### 🎥 Telemedicina (`/api/telemedicine`)
- `POST /api/telemedicine/sessions` - Criar sessão
- `GET /api/telemedicine/sessions/{id}` - Buscar sessão
- `POST /api/telemedicine/sessions/{id}/start` - Iniciar sessão
- `POST /api/telemedicine/sessions/{id}/end` - Finalizar sessão

### 📊 Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/revenue` - Dados de faturamento
- `GET /api/dashboard/appointments-today` - Agendamentos do dia
- `GET /api/dashboard/top-procedures` - Procedimentos mais realizados

### 🔗 Integrações (`/api/integrations`)
- `GET /api/integrations` - Listar integrações disponíveis
- `POST /api/integrations/{service}/connect` - Conectar serviço
- `DELETE /api/integrations/{service}/disconnect` - Desconectar serviço

## 🔒 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação:

```bash
# 1. Fazer login
POST /api/auth/login
{
  "email": "admin@clinica.com",
  "password": "sua-senha"
}

# 2. Usar o token nas requisições
Authorization: Bearer {seu-token-jwt}
```

## 📝 Exemplo de Uso

```javascript
// Buscar pacientes
const response = await fetch('https://sua-api.vercel.app/api/patients', {
  headers: {
    'Authorization': 'Bearer SEU_TOKEN_AQUI',
    'Content-Type': 'application/json'
  }
});

const pacientes = await response.json();
console.log(pacientes);
```

## 🏗️ Estrutura do Projeto

```
api/
├── app/
│   ├── core/
│   │   ├── config.py          # Configurações
│   │   └── supabase.py        # Cliente Supabase
│   ├── routers/               # Endpoints da API
│   │   ├── auth.py
│   │   ├── patients.py
│   │   ├── appointments.py
│   │   ├── procedures.py
│   │   ├── financial.py
│   │   ├── inventory.py
│   │   ├── whatsapp.py
│   │   ├── ai.py
│   │   ├── automation.py
│   │   ├── telemedicine.py
│   │   ├── orders.py
│   │   ├── integrations.py
│   │   └── dashboard.py
│   ├── services/              # Lógica de negócio
│   │   ├── ai_service.py
│   │   └── whatsapp_service.py
│   └── main.py               # App FastAPI
├── uploads/                  # Arquivos enviados
├── .env.example             # Exemplo de variáveis
├── requirements.txt         # Dependências Python
├── vercel.json             # Configuração Vercel
└── index.py               # Entry point Vercel
```

## 🧪 Testes

```bash
# Rodar testes
pytest

# Com cobertura
pytest --cov=app
```

## 📞 Suporte

Para dúvidas ou problemas:
- **Email**: suporte@fbzsistemas.com.br
- **GitHub Issues**: [Criar issue](https://github.com/seu-usuario/seu-repo/issues)

## 📄 Licença

Propriedade de FBZ Sistemas IA - Todos os direitos reservados.
