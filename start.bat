@echo off
title Cova Dev Environment
echo ================================================
echo  Cova System — 개발 서버 시작
echo ================================================
echo.
echo [1/2] FastAPI 백엔드 시작 중... (port 8000)
start "Cova FastAPI" cmd /k "cd /d %~dp0 && python -m uvicorn server.main:app --reload --port 8000"
timeout /t 2 /nobreak >nul
echo [2/2] Vite 프론트엔드 시작 중... (port 5173)
start "Cova Vite" cmd /k "cd /d %~dp0 && npm run dev"
echo.
echo ================================================
echo  서버 주소:
echo   프론트엔드:  http://localhost:5173
echo   FastAPI:     http://localhost:8000
echo   Swagger UI:  http://localhost:8000/docs
echo   ReDoc:       http://localhost:8000/redoc
echo ================================================
echo.
echo 창을 닫으면 이 런처가 종료됩니다.
pause
