# 🚀 Script de Deploy Local - Windows Docker Desktop
# Clínica Estética Pro

Write-Host "🚀 Iniciando deploy local da Clínica Estética Pro..." -ForegroundColor Green

# Verificar Docker
Write-Host "📦 Verificando Docker..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker não encontrado! Instale Docker Desktop primeiro." -ForegroundColor Red
    Write-Host "Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Docker OK" -ForegroundColor Green

# Verificar arquivo .env
Write-Host "🔐 Verificando variáveis de ambiente..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host "Criando a partir do .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  EDITE o arquivo .env com suas credenciais antes de continuar!" -ForegroundColor Yellow
    notepad .env
    exit 1
}
Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green

# Parar containers anteriores
Write-Host "🛑 Parando containers anteriores..." -ForegroundColor Yellow
docker-compose down 2>$null

# Limpar volumes e imagens antigas
Write-Host "🧹 Limpando recursos antigos..." -ForegroundColor Yellow
docker system prune -f

# Build e start
Write-Host "🔨 Building e iniciando containers..." -ForegroundColor Yellow
docker-compose up -d --build

# Aguardar
Write-Host "⏳ Aguardando serviços iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Status
Write-Host "📊 Status dos containers:" -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs de acesso:" -ForegroundColor Yellow
Write-Host "  API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  Dashboard: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  PWA: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Comandos úteis:" -ForegroundColor Yellow
Write-Host "  Ver logs: docker-compose logs -f" -ForegroundColor Cyan
Write-Host "  Parar: docker-compose down" -ForegroundColor Cyan
Write-Host "  Restart: docker-compose restart" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Sistema rodando!" -ForegroundColor Green

# Abrir navegador
Write-Host "🌐 Abrindo documentação da API..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:8000/docs"
