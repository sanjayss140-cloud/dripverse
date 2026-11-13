@echo off
echo ========================================================
echo        DRIPVERSE - AI Personal Fashion Studio
echo ========================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Dripverse Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo Starting Vite Frontend on http://localhost:5173 ...
start "Dripverse Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo DRIPVERSE is launching! Open your browser at:
echo http://localhost:5173
echo ========================================================
