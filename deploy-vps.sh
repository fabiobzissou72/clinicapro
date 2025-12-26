#!/bin/bash

# 🚀 Script de Deploy Automático - VPS Docker Swarm
# Clínica Estética Pro

set -e

echo "🚀 Iniciando deploy da Clínica Estética Pro..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Verificar Docker
echo -e "${YELLOW}📦 Verificando Docker...${NC}"
if ! command_exists docker; then
    echo -e "${RED}❌ Docker não encontrado. Instalando...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}✅ Docker instalado!${NC}"
else
    echo -e "${GREEN}✅ Docker OK${NC}"
fi

# 2. Verificar Docker Swarm
echo -e "${YELLOW}🐝 Verificando Docker Swarm...${NC}"
if ! docker info | grep -q "Swarm: active"; then
    echo -e "${YELLOW}Inicializando Docker Swarm...${NC}"
    docker swarm init
    echo -e "${GREEN}✅ Docker Swarm inicializado!${NC}"
else
    echo -e "${GREEN}✅ Docker Swarm ativo${NC}"
fi

# 3. Verificar arquivo .env
echo -e "${YELLOW}🔐 Verificando variáveis de ambiente...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}Criando .env.example como referência...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  EDITE o arquivo .env com suas credenciais antes de continuar!${NC}"
    echo -e "${YELLOW}Execute: nano .env${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
fi

# 4. Parar stack anterior (se existir)
echo -e "${YELLOW}🛑 Parando stack anterior (se existir)...${NC}"
docker stack rm clinica 2>/dev/null || true
sleep 5

# 5. Limpar recursos não utilizados
echo -e "${YELLOW}🧹 Limpando recursos não utilizados...${NC}"
docker system prune -af --volumes || true

# 6. Build das imagens
echo -e "${YELLOW}🔨 Building imagens...${NC}"

echo "Building API..."
docker build -t clinica-api:latest ./api

echo "Building Dashboard..."
docker build -t clinica-dashboard:latest -f Dockerfile.dashboard .

echo "Building PWA..."
docker build -t clinica-pwa:latest ./pwa-cliente

echo -e "${GREEN}✅ Imagens criadas!${NC}"

# 7. Deploy da stack
echo -e "${YELLOW}🚀 Deploying stack...${NC}"
docker stack deploy -c docker-compose.yml clinica

# 8. Aguardar serviços subirem
echo -e "${YELLOW}⏳ Aguardando serviços iniciarem...${NC}"
sleep 10

# 9. Verificar status
echo -e "${YELLOW}📊 Status dos serviços:${NC}"
docker service ls

echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo -e "${YELLOW}📍 URLs de acesso:${NC}"
echo "  API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "  Dashboard: http://localhost:3000"
echo "  PWA: http://localhost:3001"
echo ""
echo -e "${YELLOW}📝 Comandos úteis:${NC}"
echo "  Ver logs API: docker service logs -f clinica_api"
echo "  Ver logs Dashboard: docker service logs -f clinica_dashboard"
echo "  Ver logs PWA: docker service logs -f clinica_pwa"
echo "  Ver status: docker service ls"
echo "  Parar tudo: docker stack rm clinica"
echo ""
echo -e "${GREEN}🎉 Sistema rodando!${NC}"

# 10. Health check
echo -e "${YELLOW}🏥 Testando health check...${NC}"
sleep 5
curl -s http://localhost/health || echo "Health check aguardando..."
