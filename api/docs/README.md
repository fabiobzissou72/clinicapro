# 📚 Documentação da API - Clínica Estética Pro

Bem-vindo à documentação completa da API da Clínica Estética Pro!

## 🚀 Links Rápidos

### Documentação Interativa (Recomendado)
- **Swagger UI**: [https://sua-api.vercel.app/docs](https://sua-api.vercel.app/docs) - Teste os endpoints diretamente no navegador
- **ReDoc**: [https://sua-api.vercel.app/redoc](https://sua-api.vercel.app/redoc) - Documentação alternativa
- **OpenAPI Schema**: [https://sua-api.vercel.app/openapi.json](https://sua-api.vercel.app/openapi.json) - Para importar no Postman/Insomnia

### Desenvolvimento Local
- **Swagger UI Local**: http://localhost:8000/docs
- **ReDoc Local**: http://localhost:8000/redoc

## 📖 Guias

### Para Iniciantes
1. **[Guia de Início Rápido](./GETTING_STARTED.md)** ⭐ COMECE AQUI
   - Acesso à documentação interativa
   - Como fazer autenticação
   - Primeiro request
   - Exemplos práticos

2. **[Guia de Deploy](./DEPLOY.md)**
   - Deploy na Vercel (recomendado)
   - Deploy em VPS/Servidor próprio
   - Docker e Docker Compose
   - Configurações de produção

### Referência Completa

A documentação completa de todos os endpoints está disponível em:
- **Swagger**: https://sua-api.vercel.app/docs (modo interativo)
- **ReDoc**: https://sua-api.vercel.app/redoc (modo leitura)

## 🎯 Principais Endpoints

### Autenticação
```
POST /api/auth/login          - Fazer login
POST /api/auth/register       - Criar conta
GET  /api/auth/me            - Dados do usuário
```

### Pacientes
```
GET    /api/patients         - Listar pacientes
POST   /api/patients         - Criar paciente
GET    /api/patients/{id}    - Buscar paciente
PUT    /api/patients/{id}    - Atualizar paciente
DELETE /api/patients/{id}    - Deletar paciente
```

### Agendamentos
```
GET    /api/appointments             - Listar agendamentos
POST   /api/appointments             - Criar agendamento
GET    /api/appointments/{id}        - Buscar agendamento
PUT    /api/appointments/{id}        - Atualizar agendamento
DELETE /api/appointments/{id}        - Deletar agendamento
POST   /api/appointments/{id}/confirm - Confirmar agendamento
POST   /api/appointments/{id}/cancel  - Cancelar agendamento
```

### Dashboard
```
GET /api/dashboard/stats              - Estatísticas gerais
GET /api/dashboard/revenue            - Faturamento
GET /api/dashboard/appointments-today  - Agendamentos hoje
GET /api/dashboard/top-procedures     - Procedimentos populares
```

### WhatsApp
```
POST /api/whatsapp/send      - Enviar mensagem
POST /api/whatsapp/broadcast - Enviar para múltiplos contatos
GET  /api/whatsapp/templates - Listar templates
```

### IA & Automação
```
POST /api/ai/analyze-image    - Análise de imagem
POST /api/ai/chatbot         - Chatbot inteligente
GET  /api/automation/rules   - Regras de automação
POST /api/automation/test/{id} - Testar regra
```

## 🔐 Autenticação

Todos os endpoints (exceto `/auth/login` e `/auth/register`) requerem autenticação JWT:

```javascript
// 1. Fazer login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'seu@email.com',
    password: 'sua-senha'
  })
});

const { access_token } = await response.json();

// 2. Usar token nas requisições
const data = await fetch('/api/patients', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});
```

## 🛠️ Tecnologias

- **Framework**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Vercel Serverless
- **Docs**: OpenAPI/Swagger
- **Autenticação**: JWT
- **IA**: OpenAI GPT-4
- **Messaging**: WhatsApp Business API

## 📁 Estrutura da API

```
api/
├── app/
│   ├── core/              # Configurações e utilitários
│   ├── routers/           # Endpoints da API
│   │   ├── auth.py       # Autenticação
│   │   ├── patients.py   # Pacientes
│   │   ├── appointments.py # Agendamentos
│   │   ├── procedures.py  # Procedimentos
│   │   ├── financial.py   # Financeiro
│   │   ├── inventory.py   # Estoque
│   │   ├── whatsapp.py    # WhatsApp
│   │   ├── ai.py          # Inteligência Artificial
│   │   ├── automation.py  # Automações
│   │   └── ...
│   ├── services/          # Lógica de negócio
│   └── main.py           # App principal
├── docs/                  # Documentação markdown
├── uploads/              # Arquivos enviados
└── requirements.txt      # Dependências
```

## 🧪 Testando a API

### 1. Swagger UI (Navegador)
Acesse `/docs` e use a interface para testar endpoints interativamente.

### 2. cURL (Terminal)
```bash
curl -X POST https://sua-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"senha"}'
```

### 3. Postman/Insomnia
Importe o schema OpenAPI de `/openapi.json`

### 4. JavaScript
```javascript
const response = await fetch('https://sua-api.vercel.app/api/patients', {
  headers: {
    'Authorization': 'Bearer SEU_TOKEN'
  }
});
```

## ⚡ Quick Start

```bash
# 1. Clonar repositório
git clone https://github.com/seu-repo/clinica-api.git
cd clinica-api/api

# 2. Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar .env
cp .env.example .env
# Edite o .env com suas credenciais

# 5. Rodar servidor
python -m uvicorn app.main:app --reload
```

Acesse: http://localhost:8000/docs

## 🐛 Reportar Problemas

Encontrou um bug? Abra uma issue:
- **GitHub**: [Criar issue](https://github.com/seu-repo/issues)
- **Email**: suporte@fbzsistemas.com.br

## 📄 Licença

Propriedade de **FBZ Sistemas IA** - Todos os direitos reservados.

## 🤝 Contribuindo

Este é um projeto privado. Para contribuir, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ por FBZ Sistemas IA**
