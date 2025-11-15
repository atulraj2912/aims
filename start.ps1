# AIMS Quick Start Script

Write-Host "🚀 Starting AIMS Command Dashboard..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Kill any existing process on port 3000
Write-Host "🔧 Cleaning up port 3000..." -ForegroundColor Yellow
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($process) {
    $processId = $process.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Killed process on port 3000" -ForegroundColor Green
}

# Clear build cache
Write-Host "🧹 Clearing build cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "✓ Cache cleared" -ForegroundColor Green

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  AIMS Command Dashboard Starting" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Local:    http://localhost:3000" -ForegroundColor Green
Write-Host "🌐 Network:  Check console for network address" -ForegroundColor Green
Write-Host ""
Write-Host "Features:" -ForegroundColor Yellow
Write-Host "  ✅ Real-time WebSocket updates" -ForegroundColor White
Write-Host "  ✅ Supabase PostgreSQL database" -ForegroundColor White
Write-Host "  ✅ Roboflow Vision AI detection" -ForegroundColor White
Write-Host "  ✅ ML-powered demand forecasting" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Start the development server
npm run dev
