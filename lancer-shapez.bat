@echo off
setlocal

title shapez.io - Lancement...
cd /d "%~dp0"

echo Verification de Yarn...
where yarn >nul 2>nul
if errorlevel 1 (
    echo.
    echo Erreur: Yarn n'est pas installe ou n'est pas dans le PATH.
    echo Installez Node.js + Yarn puis relancez ce script.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo.
    echo Dependances manquantes, installation en cours...
    call yarn install
    if errorlevel 1 (
        echo.
        echo Echec de l'installation des dependances.
        pause
        exit /b 1
    )
)

echo.
echo Demarrage de shapez.io (mode developpement)...
call yarn dev

if errorlevel 1 (
    echo.
    echo Le lancement a echoue. Voir les messages ci-dessus.
)

pause
