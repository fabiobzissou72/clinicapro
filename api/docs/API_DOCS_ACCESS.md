# 📚 Como Acessar a Documentação da API (/docs)

## 🚀 Acessando o Swagger UI

A API possui documentação interativa automática gerada pelo FastAPI.

### Em Produção (Vercel):

```
https://sua-api.vercel.app/docs
```

### Localmente:

```
http://localhost:8000/docs
```

## ⚠️ Por que o /docs não abre?

Se o `/docs` não está funcionando, pode ser por:

### 1. API Não Está Rodando

Verifique se a API está no ar:

```bash
# Testar endpoint de health
curl https://sua-api.vercel.app/health

# Deve retornar: {"status": "healthy"}
```

### 2. Faltam Dependências

```bash
cd api
pip install fastapi uvicorn python-dotenv supabase openai pydantic python-multipart
```

### 3. Erro na Importação de Módulos

Se aparecer erro tipo `ModuleNotFoundError`:

```bash
# Instalar todas as dependências
cd api
pip install -r requirements.txt
```

### 4. Problema no Deploy da Vercel

Na Vercel, verifique:
- ✅ `vercel.json` está correto
- ✅ Variáveis de ambiente configuradas
- ✅ Build foi bem-sucedido

## 🔧 Como Rodar a API Localmente

### Passo 1: Instalar Dependências

```bash
cd api

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### Passo 2: Configurar .env

```bash
# Copiar exemplo
cp .env.example .env

# Editar .env com suas credenciais
```

Conteúdo do `.env`:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
OPENAI_API_KEY=sk-...
API_SECRET_KEY=qualquer-string-secreta
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Passo 3: Rodar Servidor

```bash
# Modo desenvolvimento (com hot reload)
python -m uvicorn app.main:app --reload --port 8000
```

### Passo 4: Acessar Docs

Abra no navegador:

```
http://localhost:8000/docs
```

Você verá a interface Swagger UI completa! 🎉

## 📖 Alternativas ao /docs

### 1. ReDoc (Outra Interface)

```
https://sua-api.vercel.app/redoc
```

Interface alternativa, mais limpa para leitura.

### 2. OpenAPI JSON

```
https://sua-api.vercel.app/openapi.json
```

Schema no formato JSON para importar no Postman/Insomnia.

### 3. Importar no Postman

1. Abra o Postman
2. File > Import
3. Cole a URL: `https://sua-api.vercel.app/openapi.json`
4. Todos os endpoints serão importados automaticamente

### 4. Importar no Insomnia

1. Abra o Insomnia
2. Application > Preferences > Data > Import Data
3. Cole a URL: `https://sua-api.vercel.app/openapi.json`

## 🧪 Testar Endpoints Sem /docs

### Via cURL

```bash
# Health check
curl https://sua-api.vercel.app/health

# Login
curl -X POST https://sua-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"senha"}'

# Listar pacientes
curl https://sua-api.vercel.app/api/patients \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Via JavaScript

```javascript
// Health check
const health = await fetch('https://sua-api.vercel.app/health');
console.log(await health.json());

// Login
const login = await fetch('https://sua-api.vercel.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@clinica.com',
    password: 'senha'
  })
});

const { access_token } = await login.json();

// Listar pacientes
const patients = await fetch('https://sua-api.vercel.app/api/patients', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});

console.log(await patients.json());
```

## 🔍 Verificar Logs de Erro

### Localmente:

Os erros aparecem no terminal onde você rodou o `uvicorn`.

### Na Vercel:

```bash
# Ver logs em tempo real
vercel logs

# Ou no dashboard da Vercel
# https://vercel.com/seu-usuario/seu-projeto/deployments
```

## 📋 Checklist de Troubleshooting

- [ ] API está rodando (teste `/health`)
- [ ] Porta 8000 está livre
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] `.env` configurado corretamente
- [ ] Variáveis de ambiente na Vercel configuradas
- [ ] Build da Vercel foi bem-sucedido
- [ ] `vercel.json` aponta para `index.py`

## 🆘 Ainda com Problemas?

1. **Delete e reinstale tudo:**

```bash
cd api
rm -rf venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

2. **Verifique o arquivo main.py:**

```python
from fastapi import FastAPI

app = FastAPI(
    title="Clínica Estética Pro API",
    description="API completa para gestão de clínica estética",
    version="1.0.0",
    docs_url="/docs",    # ← Certifique-se de que isso está presente
    redoc_url="/redoc"   # ← E isso também
)
```

3. **Teste endpoint root:**

```bash
curl http://localhost:8000/
# Deve retornar JSON com informações da API
```

## 📞 Suporte

Se ainda não funcionar:
- Email: suporte@fbzsistemas.com.br
- GitHub Issues: [Criar issue](https://github.com/seu-repo/issues)
