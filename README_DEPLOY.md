# 🚀 Deploy Rápido - Clínica Estética Pro

## 🎯 Escolha sua opção

### OPÇÃO 1: VERCEL (Deploy em 5 minutos)

**Vantagens:**
- ✅ Deploy super rápido
- ✅ Grátis para começar
- ✅ Dashboard e PWA funcionam perfeitamente

**Desvantagens:**
- ❌ API com limitações (timeout 10-60s)
- ❌ Sem telemedicina (WebSocket)
- ❌ Sem tarefas em background

**Como fazer:**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Dashboard
cd "C:\Users\fbzis\Desktop\Dashboard Novo"
vercel

# PWA
cd pwa-cliente
vercel

# API (com limitações)
cd api
vercel
```

---

### OPÇÃO 2: VPS com Docker Swarm (RECOMENDADO!)

**Vantagens:**
- ✅ TODAS as funcionalidades
- ✅ Telemedicina funcionando
- ✅ WhatsApp bot completo
- ✅ IA para prontuários
- ✅ Sem timeouts
- ✅ Alta disponibilidade
- ✅ Controle total

**Desvantagens:**
- 💰 Custo: ~R$30-50/mês (VPS)

**Requisitos VPS:**
- Ubuntu 20.04+
- 4GB RAM mínimo
- 40GB SSD
- Docker instalado

**Como fazer:**

#### 1️⃣ Na sua VPS (SSH):

```bash
# Conectar via SSH
ssh root@SEU_IP_VPS

# Baixar projeto (escolha uma opção):

# Opção A: Se tiver Git
git clone seu-repositorio.git
cd Dashboard\ Novo

# Opção B: Upload manual
# (use FileZilla ou WinSCP para enviar os arquivos)

# Criar arquivo .env
nano .env
# Cole suas credenciais (veja .env.example)
# Salve: Ctrl+O, Enter, Ctrl+X

# Executar script de deploy automático
chmod +x deploy-vps.sh
./deploy-vps.sh
```

Pronto! 🎉

#### 2️⃣ Configurar DNS

No seu provedor de domínio:
```
api.seudominio.com    → IP_DA_VPS
admin.seudominio.com  → IP_DA_VPS
app.seudominio.com    → IP_DA_VPS
```

#### 3️⃣ Configurar SSL (HTTPS)

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d api.seudominio.com -d admin.seudominio.com -d app.seudominio.com
```

---

### OPÇÃO 3: Testar Local (Windows com Docker Desktop)

**Para testar antes de fazer deploy:**

```powershell
# No PowerShell (como Administrador)
cd "C:\Users\fbzis\Desktop\Dashboard Novo"

# Editar .env com suas credenciais
notepad .env

# Executar
.\deploy-local.ps1
```

Acesse:
- API: http://localhost:8000/docs
- Dashboard: http://localhost:3000
- PWA: http://localhost:3001

---

## 📦 Arquivos Criados

### Para Vercel:
- `api/vercel.json` - Config da API
- `api/index.py` - Entry point serverless

### Para VPS Docker:
- `docker-compose.yml` - Stack completa
- `api/Dockerfile` - Imagem da API
- `Dockerfile.dashboard` - Imagem do Dashboard
- `pwa-cliente/Dockerfile` - Imagem do PWA
- `nginx-proxy.conf` - Reverse proxy
- `deploy-vps.sh` - Script automático de deploy
- `deploy-local.ps1` - Script para teste local

### Documentação:
- `GUIA_DEPLOY.md` - Guia completo detalhado
- `.env.example` - Exemplo de variáveis

---

## ⚡ Quick Start

### Jeito mais rápido (Vercel):
```bash
npm i -g vercel
cd "C:\Users\fbzis\Desktop\Dashboard Novo"
vercel
```

### Jeito completo (VPS):
```bash
ssh root@SEU_IP
git clone seu-repo
cd Dashboard\ Novo
nano .env  # Configure
./deploy-vps.sh
```

---

## 🆘 Suporte

Consulte `GUIA_DEPLOY.md` para:
- Troubleshooting
- Comandos úteis
- Configurações avançadas
- Problemas comuns

---

## 📊 Status Atual

✅ API funcionando localmente (http://localhost:8000)
✅ Arquivos Docker criados
✅ Scripts de deploy prontos
⏳ Aguardando escolha de deploy (Vercel ou VPS)

---

## 💡 Recomendação

**Para produção completa**: Use VPS com Docker Swarm

**Para teste rápido**: Use Vercel (Dashboard + PWA) + Railway/Render (API)

**Para desenvolvimento**: Use deploy-local.ps1

Escolha e vamos nessa! 🚀
