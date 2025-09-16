@echo off
cd /d D:\github_proj\med\medicare
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose -f docker-compose.yml -f docker-compose.override.yml up -d --build
echo Docker services started. Checking status...
timeout /t 5 /nobreak >nul
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" ps
