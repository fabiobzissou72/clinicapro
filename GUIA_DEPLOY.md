# 🚀 Guia Completo de Deploy

## 📋 Sumário

1. [Deploy na Vercel (Opção 1)](#opção-1-vercel)
2. [Deploy VPS com Docker Swarm (Opção 2 - RECOMENDADO)](#opção-2-vps-docker-swarm)

---

## OPÇÃO 1: VERCEL

### ⚠️ Limitações da Vercel para FastAPI

- **Timeout**: 10 segundos (hobby) ou 60 segundos (pro)
- **Não suporta WebSockets** (telemedicina não funcionará)
- **Celery não funciona** (tarefas em background limitadas)
- **Uploads grandes** podem ter problemas

### ✅ O que funciona na Vercel

- Dashboard Admin (React)
- PWA Cliente (React)
- API básica (sem features de longa duração)

### 📦 Deploy na Vercel

#### 1. Dashboard Admin

```bash
# Entre na pasta raiz
cd "C:\Users\fbzis\Desktop\Dashboard Novo"

# Instale Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configure:
# - Project Name: clinica-dashboard
# - Framework: Vite
# - Build Command: npm run build
# - Output Directory: dist
```

#### 2. PWA Cliente

```bash
# Entre na pasta PWA
cd pwa-cliente

# Deploy
vercel

# Configure:
# - Project Name: clinica-pwa
# - Framework: Vite
# - Build Command: npm run build
# - Output Directory: dist
```

#### 3. API (com limitações)

```bash
# Entre na pasta API
cd api

# Deploy
vercel

# Configure variáveis de ambiente no dashboard da Vercel:
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add API_SECRET_KEY
```

### 🔧 Configurar variáveis de ambiente

No dashboard da Vercel (vercel.com):

1. Vá em Settings > Environment Variables
2. Adicione cada variável do arquivo `.env`

---

## OPÇÃO 2: VPS DOCKER SWARM (RECOMENDADO!)

### ✅ Vantagens

- **Sem timeouts** - aplicação roda continuamente
- **WebSockets funcionam** - telemedicina OK
- **Celery funciona** - tarefas em background OK
- **Uploads ilimitados** - só depende do espaço em disco
- **Controle total** - você é o dono
- **Alta disponibilidade** - Docker Swarm com réplicas

### 📋 Requisitos VPS

- Ubuntu 20.04+ ou Debian 11+
- Mínimo: 2 CPU, 4GB RAM, 40GB SSD
- Recomendado: 4 CPU, 8GB RAM, 80GB SSD
- Docker e Docker Compose instalados

### 🛠️ Passo a Passo Completo

#### 1. Preparar VPS

```bash
# SSH na VPS
ssh root@seu-ip-vps

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Habilitar Docker Swarm
docker swarm init

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 2. Enviar arquivos para VPS

```bash
# No seu PC Windows (PowerShell):
cd "C:\Users\fbzis\Desktop\Dashboard Novo"

# Compactar projeto
tar -czf clinica.tar.gz .

# Enviar para VPS (substitua SEU_IP)
scp clinica.tar.gz root@SEU_IP:/root/

# Na VPS:
cd /root
tar -xzf clinica.tar.gz
cd Dashboard\ Novo
```

#### 3. Configurar variáveis de ambiente

```bash
# Criar arquivo .env
nano .env

# Cole suas credenciais:
SUPABASE_URL=https://djymykdwcxnsyzkdduub.supabase.co
SUPABASE_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-sua-chave
API_SECRET_KEY=sua-chave-secreta-aleatoria
EVOLUTION_API_URL=https://sua-evolution.com
EVOLUTION_API_KEY=sua-chave

# Salvar: Ctrl+O, Enter, Ctrl+X
```

#### 4. Configurar domínios (opcional)

```bash
# Editar nginx-proxy.conf
nano nginx-proxy.conf

# Substituir:
# api.seudominio.com → api.clinica.com.br
# admin.seudominio.com → admin.clinica.com.br
# app.seudominio.com → app.clinica.com.br
```

#### 5. Deploy com Docker Swarm

```bash
# Deploy da stack completa
docker stack deploy -c docker-compose.yml clinica

# Verificar serviços
docker service ls

# Ver logs
docker service logs clinica_api
docker service logs clinica_dashboard
docker service logs clinica_pwa
```

#### 6. Configurar DNS

No seu provedor de domínio (Registro.br, GoDaddy, etc):

```
Tipo A:
api.clinica.com.br    → SEU_IP_VPS
admin.clinica.com.br  → SEU_IP_VPS
app.clinica.com.br    → SEU_IP_VPS

ou

Tipo A:
clinica.com.br        → SEU_IP_VPS

Tipo CNAME:
api                   → clinica.com.br
admin                 → clinica.com.br
app                   → clinica.com.br
```

#### 7. Configurar SSL (HTTPS) - IMPORTANTE!

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Gerar certificados SSL
certbot --nginx -d api.clinica.com.br -d admin.clinica.com.br -d app.clinica.com.br

# Renovação automática (já configurado)
certbot renew --dry-run
```

#### 8. Firewall e Segurança

```bash
# Configurar UFW
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Fail2ban (proteção contra ataques)
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban
```

### 🔄 Comandos úteis Docker Swarm

```bash
# Ver status dos serviços
docker service ls

# Escalar serviços
docker service scale clinica_api=4

# Ver logs em tempo real
docker service logs -f clinica_api

# Atualizar serviço após mudanças
docker service update --image nova-imagem clinica_api

# Parar tudo
docker stack rm clinica

# Reiniciar tudo
docker stack deploy -c docker-compose.yml clinica
```

### 📊 Monitoramento

```bash
# Ver uso de recursos
docker stats

# Ver serviços rodando
docker service ps clinica_api

# Health check
curl http://localhost/health
```

### 🔧 Atualizar aplicação

```bash
# Método 1: Rebuild completo
docker stack rm clinica
docker system prune -af
git pull  # ou envie novos arquivos
docker stack deploy -c docker-compose.yml clinica

# Método 2: Atualização gradual (zero downtime)
docker build -t clinica-api:v2 ./api
docker service update --image clinica-api:v2 clinica_api
```

---

## 🌐 URLs Finais

### Vercel (se escolher)
- Dashboard: https://clinica-dashboard.vercel.app
- PWA: https://clinica-pwa.vercel.app
- API: https://clinica-api.vercel.app

### VPS Docker (se escolher)
- Dashboard: https://admin.clinica.com.br
- PWA: https://app.clinica.com.br
- API: https://api.clinica.com.br
- Docs: https://api.clinica.com.br/docs

---

## 💡 Recomendação Final

**Use VPS com Docker Swarm se:**
- ✅ Quer todas as funcionalidades (WhatsApp, IA, Telemedicina)
- ✅ Precisa de tarefas em background
- ✅ Quer controle total
- ✅ Tem orçamento para VPS (~R$30-50/mês)

**Use Vercel se:**
- ⚠️ Quer deploy MUITO rápido
- ⚠️ Não precisa de telemedicina
- ⚠️ Não precisa de tarefas pesadas
- ⚠️ Quer começar grátis (com limitações)

---

## 🆘 Problemas Comuns

### Docker: "Cannot connect to Docker daemon"
```bash
systemctl start docker
systemctl enable docker
```

### Porta 80 ocupada
```bash
# Ver o que está usando
lsof -i :80

# Parar nginx nativo
systemctl stop nginx
systemctl disable nginx
```

### Memória insuficiente
```bash
# Criar swap
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### SSL não funciona
```bash
# Verificar DNS primeiro
nslookup api.clinica.com.br

# Testar certbot
certbot --nginx --dry-run
```

---

## 📞 Próximos Passos

1. Escolha: Vercel ou VPS?
2. Configure domínios
3. Deploy!
4. Configure WhatsApp (Evolution API)
5. Teste completo
6. Treinamento da equipe

**Dica**: Comece na Vercel para testar, depois migre para VPS quando quiser as funcionalidades completas!
