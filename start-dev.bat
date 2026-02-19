@echo off
echo Reiniciando Gasera Dev Server...
echo Conectando a la base de datos...
call pnpm db:push
if %ERRORLEVEL% NEQ 0 (
    echo Error conectando a la base de datos via db:push
    pause
    exit /b %ERRORLEVEL%
)

echo Iniciando app...
call pnpm dev
pause
