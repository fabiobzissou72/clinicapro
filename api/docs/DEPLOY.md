# 🚀 Guia de Deploy - Clínica Estética Pro API

## Deploy na Vercel (Recomendado)

### Pré-requisitos
- Conta na Vercel
- Conta no Supabase configurada
- Repositório Git (GitHub, GitLab ou Bitbucket)

### Passo 1: Configurar Variáveis de Ambiente

No dashboard da Vercel, vá em **Settings > Environment Variables** e adicione:

```bash
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anonima-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-secreta

# OpenAI (se usar IA)
OPENAI_API_KEY=sk-...

# Segurança
API_SECRET_KEY=qualquer-string-secreta-aqui-min-32-chars

# CORS (URLs do frontend)
CORS_ORIGINS=https://seu-frontend.vercel.app,http://localhost:3000

# WhatsApp (opcional)
WHATSAPP_API_TOKEN=seu-token-whatsapp
WHATSAPP_PHONE_NUMBER_ID=id-do-numero
```

### Passo 2: Deploy via GitHub

1. **Conecte o repositório** na Vercel
2. **Configure o Root Directory**: Aponte para `/api`
3. **Framework Preset**: Other
4. **Build Command**: (deixe vazio)
5. **Output Directory**: (deixe vazio)

### Passo 3: Deploy Manual via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Ir para pasta da API
cd api

# Deploy de produção
vercel --prod
```

### Verificar Deploy

Após o deploy, verifique:

- ✅ **Health Check**: `https://sua-api.vercel.app/health`
- ✅ **Docs**: `https://sua-api.vercel.app/docs`
- ✅ **Root**: `https://sua-api.vercel.app/`

## Deploy Local para Desenvolvimento

### Setup Inicial

```bash
# 1. Clonar repositório
git clone https://github.com/seu-repo/clinica-api.git
cd clinica-api/api

# 2. Criar ambiente virtual
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Copiar .env
cp .env.example .env

# 5. Editar .env com suas credenciais
# Use um editor de texto para editar o .env
```

### Rodar Servidor Local

```bash
# Modo desenvolvimento (com hot reload)
python -m uvicorn app.main:app --reload --port 8000

# Ou com o script Python
python app/main.py
```

Acesse: http://localhost:8000/docs

## Deploy em VPS/Servidor Próprio

### Opção 1: Docker (Recomendado)

```bash
# 1. Build da imagem
cd api
docker build -t clinica-api .

# 2. Rodar container
docker run -d \
  --name clinica-api \
  -p 8000:8000 \
  --env-file .env \
  clinica-api

# 3. Verificar logs
docker logs -f clinica-api
```

### Opção 2: Systemd Service (Ubuntu/Debian)

```bash
# 1. Instalar dependências do sistema
sudo apt update
sudo apt install python3.11 python3.11-venv nginx

# 2. Criar usuário para a API
sudo useradd -m -s /bin/bash apiuser

# 3. Clonar repositório
cd /opt
sudo git clone https://github.com/seu-repo/clinica-api.git
sudo chown -R apiuser:apiuser /opt/clinica-api

# 4. Setup Python
cd /opt/clinica-api/api
sudo -u apiuser python3.11 -m venv venv
sudo -u apiuser venv/bin/pip install -r requirements.txt

# 5. Criar arquivo .env
sudo -u apiuser nano .env
# (Cole suas variáveis de ambiente aqui)

# 6. Criar service do systemd
sudo nano /etc/systemd/system/clinica-api.service
```

**Conteúdo do `/etc/systemd/system/clinica-api.service`:**

```ini
[Unit]
Description=Clinica Estetica Pro API
After=network.target

[Service]
Type=simple
User=apiuser
WorkingDirectory=/opt/clinica-api/api
Environment="PATH=/opt/clinica-api/api/venv/bin"
ExecStart=/opt/clinica-api/api/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 7. Habilitar e iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable clinica-api
sudo systemctl start clinica-api

# 8. Verificar status
sudo systemctl status clinica-api
```

### Configurar Nginx como Reverse Proxy

```bash
# Criar configuração nginx
sudo nano /etc/nginx/sites-available/clinica-api
```

**Conteúdo:**

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/clinica-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Instalar SSL com Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.seudominio.com
```

## Deploy com Docker Compose

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  api:
    build: ./api
    container_name: clinica-api
    restart: always
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - API_SECRET_KEY=${API_SECRET_KEY}
      - CORS_ORIGINS=${CORS_ORIGINS}
    volumes:
      - ./api/uploads:/app/uploads
    networks:
      - clinica-network

  nginx:
    image: nginx:alpine
    container_name: clinica-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - clinica-network

networks:
  clinica-network:
    driver: bridge
```

```bash
# Rodar com docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar
docker-compose down
```

## Configurações de Produção

### 1. Configurar CORS Correto

No `.env` de produção:

```bash
CORS_ORIGINS=https://seu-frontend.vercel.app,https://www.seusite.com
```

### 2. Rate Limiting

Adicione ao `main.py`:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/endpoint")
@limiter.limit("10/minute")
async def endpoint(request: Request):
    return {"message": "ok"}
```

### 3. Logging em Produção

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/clinica-api/app.log'),
        logging.StreamHandler()
    ]
)
```

### 4. Monitoramento

Use ferramentas como:
- **Sentry** para tracking de erros
- **New Relic** para APM
- **Prometheus + Grafana** para métricas

## Troubleshooting

### Erro: "Module not found"
```bash
# Reinstalar dependências
pip install -r requirements.txt --upgrade
```

### Erro: "Port already in use"
```bash
# Encontrar processo usando a porta 8000
lsof -i :8000

# Matar processo
kill -9 PID
```

### Logs da Vercel
```bash
# Ver logs em tempo real
vercel logs
```

### Verificar Saúde da API
```bash
# Health check
curl https://sua-api.vercel.app/health

# Deve retornar: {"status": "healthy"}
```

## Rollback de Deploy

### Na Vercel

1. Acesse o dashboard da Vercel
2. Vá em "Deployments"
3. Encontre o deploy anterior estável
4. Clique em "..." > "Promote to Production"

### Via CLI
```bash
vercel rollback
```

## Backups

### Backup do Banco (Supabase)

O Supabase faz backup automático. Para backup manual:

```bash
# Usando pg_dump (se tiver acesso direto)
pg_dump -h seu-host.supabase.co -U postgres -d postgres > backup.sql
```

### Backup de Uploads

```bash
# Fazer backup da pasta uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

## Performance

### Otimização para Produção

```python
# Use Gunicorn com workers
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120
```

### Cache com Redis (opcional)

```bash
# Adicionar Redis no docker-compose.yml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
```

## Checklist Final

- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] SSL/HTTPS ativo
- [ ] Logs configurados
- [ ] Backups automatizados
- [ ] Monitoramento ativo
- [ ] Rate limiting configurado
- [ ] Documentação acessível em /docs
- [ ] Health check funcionando
- [ ] Testes passando

## 📞 Suporte

Problemas no deploy? Entre em contato:
- Email: suporte@fbzsistemas.com.br
- GitHub Issues: [Criar issue](https://github.com/seu-repo/issues)
