@echo off
echo Starting Red Alert 2 Settings Modifier...
echo.

REM Check if Git Bash is available in common locations
if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" ra2_modifier.sh
) else if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
    "C:\Program Files (x86)\Git\bin\bash.exe" ra2_modifier.sh
) else if exist "%USERPROFILE%\AppData\Local\Programs\Git\bin\bash.exe" (
    "%USERPROFILE%\AppData\Local\Programs\Git\bin\bash.exe" ra2_modifier.sh
) else (
    echo.
    echo Git Bash not found in common locations.
    echo Please install Git for Windows or run the script manually with:
    echo   bash ra2_modifier.sh
    echo.
    echo You can download Git for Windows from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

pause 