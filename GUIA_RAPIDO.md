# 🚀 Guia Rápido de Instalação

## ⚡ Setup em 5 Minutos

### 1️⃣ Supabase (30 segundos)

1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Vá em SQL Editor
4. Cole o conteúdo de `supabase_schema_complete.sql`
5. Execute
6. Copie as credenciais (Settings > API)

### 2️⃣ API Backend (2 minutos)

```bash
cd api
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt

# Copiar e editar .env
cp .env.example .env
# Colar credenciais do Supabase + OpenAI API Key

# Rodar
python -m uvicorn app.main:app --reload
```

✅ API rodando em `http://localhost:8000`

### 3️⃣ Dashboard (1 minuto)

```bash
npm install
npm run dev
```

✅ Dashboard rodando em `http://localhost:5173`

### 4️⃣ PWA Cliente (1 minuto)

```bash
cd pwa-cliente
npm install
echo "VITE_API_URL=http://localhost:8000/api" > .env
npm run dev
```

✅ PWA rodando em `http://localhost:5174`

### 5️⃣ WhatsApp (30 segundos) - OPCIONAL

```bash
docker run -d --name evolution-api -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua-chave-aqui \
  atendai/evolution-api:latest
```

✅ Evolution API rodando em `http://localhost:8080`

---

## 🎯 Credenciais Necessárias

### Obrigatórias:
- ✅ **Supabase** (grátis) - [supabase.com](https://supabase.com)
- ✅ **OpenAI API** (pago) - [platform.openai.com](https://platform.openai.com)

### Opcionais:
- 📱 **WhatsApp** - Evolution API (self-hosted grátis)
- 💳 **MercadoPago** - Gateway de pagamento
- 📝 **NFe.io** - Emissão de notas

---

## 🔧 Configuração Mínima (.env da API)

```env
# Supabase (OBRIGATÓRIO)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-key

# OpenAI para IA (OBRIGATÓRIO para prontuários)
OPENAI_API_KEY=sk-sua-chave

# API Config
API_SECRET_KEY=qualquer-string-aleatoria-segura
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# WhatsApp (OPCIONAL)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-chave

# Redis (OPCIONAL - para filas)
REDIS_URL=redis://localhost:6379/0
```

---

## 📱 Primeiro Acesso

### Dashboard Admin
1. Acesse `http://localhost:5173/login`
2. Use modo demo: localStorage `sb-demo-session = true`
3. Ou crie usuário no Supabase Auth

### PWA Cliente
1. Acesse `http://localhost:5174`
2. Clique em "Cadastre-se"
3. Preencha dados
4. Faça login

---

## 🧪 Testar Funcionalidades

### 1. Prontuário com IA
```bash
# Via API diretamente
curl -X POST http://localhost:8000/api/ai/transcribe \
  -F "audio=@audio.mp3" \
  -F "paciente_id=uuid-do-paciente" \
  -F "professional_id=uuid-do-profissional"
```

### 2. WhatsApp Bot
1. Configure Evolution API
2. Escaneie QR Code
3. Envie mensagem: "agendar"

### 3. Agendamento Online (PWA)
1. Acesse PWA
2. Clique em "Agendar"
3. Escolha procedimento
4. Selecione data/hora
5. Confirme

---

## 🐛 Problemas Comuns

### API não inicia
```bash
# Verificar se porta 8000 está livre
lsof -i :8000
# Verificar .env
cat api/.env
```

### Erro de CORS
```bash
# Adicionar origem ao .env
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Supabase connection error
- Verifique URL e keys no .env
- Confirme que RLS está configurado
- Execute o SQL schema completo

### WhatsApp não conecta
```bash
# Verificar se Evolution API está rodando
curl http://localhost:8080
# Ver logs
docker logs evolution-api
```

---

## 📊 Dados de Teste

Crie via Dashboard ou SQL:

```sql
-- Paciente de teste
INSERT INTO pacientes (full_name, email, phone, whatsapp_number)
VALUES ('Maria Silva', 'maria@teste.com', '11999999999', '5511999999999');

-- Procedimento de teste
INSERT INTO procedimentos (name, description, duration, price)
VALUES ('Limpeza de Pele', 'Limpeza facial profunda', 60, 150.00);

-- Profissional de teste
INSERT INTO profiles (full_name, role, specialty)
VALUES ('Dra. Ana Costa', 'professional', 'Estética Facial');
```

---

## 🚀 Deploy Produção

### API (Railway/Render)
```bash
# Procfile
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy pasta dist/
```

### Supabase
- Já está em produção!
- Configure RLS policies
- Habilite email confirmation

---

## 📞 Próximos Passos

1. ✅ Adicionar procedimentos reais
2. ✅ Configurar horários de atendimento
3. ✅ Conectar WhatsApp
4. ✅ Testar fluxo completo
5. ✅ Configurar automações
6. ✅ Integrar pagamentos
7. ✅ Deploy em produção

---

**Dúvidas?** Leia o `README.md` completo!
