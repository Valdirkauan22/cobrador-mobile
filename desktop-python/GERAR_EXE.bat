@echo off
title Gerar Cobrador Desktop 8.2.1
cd /d "%~dp0"
py -m pip install --upgrade pip
py -m pip install -r requirements.txt
py -m PyInstaller --noconfirm --clean --onefile --windowed --name Cobrador_Associacao_8.2.1 --collect-all pystray --collect-all keyring Cobrancas_Associacao_v8_2_1.py
echo.
echo EXE gerado em: dist\Cobrador_Associacao_8.2.1.exe
pause
