# 🚀 DEPLOY NO VERCEL - GUIA COMPLETO

## 📋 PASSO 1: CONFIGURAR VARIÁVEIS DE AMBIENTE

No painel do Vercel, adicione estas variáveis em **Settings** → **Environment Variables**:

```env
VITE_SUPABASE_URL=https://djymykdwcxnsyzkdduub.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqeW15a2R3Y3huc3l6a2RkdXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxNTc3MjksImV4cCI6MjA0OTczMzcyOX0.uLpxKU7SX-YLiY3vUasBhDojz5TFBL1IkjRTYYiR-YA
```

---

## 📋 PASSO 2: CRIAR ARQUIVO .env.local (PARA TESTES LOCAIS)

Crie o arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://djymykdwcxnsyzkdduub.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqeW15a2R3Y3huc3l6a2RkdXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxNTc3MjksImV4cCI6MjA0OTczMzcyOX0.uLpxKU7SX-YLiY3vUasBhDojz5TFBL1IkjRTYYiR-YA
```

---

## 📋 PASSO 3: VERIFICAR src/lib/supabase.ts

Certifique-se que o arquivo está assim:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 📋 PASSO 4: FAZER DEPLOY NO VERCEL

### Opção A: Via GitHub (RECOMENDADO)

1. Acesse: https://vercel.com
2. Clique em **Add New** → **Project**
3. Importe o repositório: `fabiobzissou72/clinicapro`
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Adicione as **Environment Variables** do PASSO 1
6. Clique **Deploy**

### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel
```

---

## 📋 PASSO 5: APÓS O DEPLOY

1. Copie a URL do deploy (ex: `https://clinicapro.vercel.app`)
2. Vá no Supabase: https://supabase.com/dashboard/project/djymykdwcxnsyzkdduub/auth/url-configuration
3. Adicione a URL em **Site URL**
4. Adicione em **Redirect URLs**:
   - `https://clinicapro.vercel.app/**`

---

## ✅ VERIFICAR SE FUNCIONOU

1. Abra a URL do Vercel
2. Vá em **Agendamentos**
3. Veja se o calendário carrega
4. Teste criar um novo agendamento

---

## 🔥 COMANDOS ÚTEIS

```bash
# Rodar localmente
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Deploy no Vercel
vercel --prod
```

---

## 🆘 PROBLEMAS COMUNS

### Erro: "Supabase client not initialized"
→ Verifique se as variáveis de ambiente estão corretas

### Erro 401 Unauthorized
→ Execute o SQL `SQL_FUNCIONAL_AGORA.sql` no Supabase

### Página em branco
→ Veja o console do navegador (F12)

### Build falhou
→ Rode `npm run build` localmente para ver o erro

---

## 📌 IMPORTANTE

- ✅ O arquivo `.env.local` NÃO deve ir pro GitHub (já está no .gitignore)
- ✅ As variáveis de ambiente no Vercel são seguras
- ✅ A ANON_KEY pode ser pública (ela já está no código do cliente)
- ❌ NUNCA exponha a SERVICE_ROLE_KEY

---

**PRONTO! SEU APP ESTARÁ NO AR! 🚀**
