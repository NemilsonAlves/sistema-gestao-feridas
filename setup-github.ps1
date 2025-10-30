# Script para conectar o repositório local ao GitHub
# Execute este script após criar o repositório no GitHub

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUrl
)

Write-Host "🚀 Conectando repositório local ao GitHub..." -ForegroundColor Green
Write-Host "URL do repositório: $GitHubUrl" -ForegroundColor Yellow

# Adicionar o remote origin
Write-Host "📡 Adicionando remote origin..." -ForegroundColor Cyan
git remote add origin $GitHubUrl

# Verificar se o remote foi adicionado
Write-Host "🔍 Verificando remote..." -ForegroundColor Cyan
git remote -v

# Renomear branch para main (padrão do GitHub)
Write-Host "🔄 Renomeando branch para main..." -ForegroundColor Cyan
git branch -M main

# Fazer push do código
Write-Host "⬆️ Fazendo push do código para o GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "✅ Repositório enviado com sucesso para o GitHub!" -ForegroundColor Green
Write-Host "🌐 Acesse: $($GitHubUrl.Replace('.git', ''))" -ForegroundColor Yellow