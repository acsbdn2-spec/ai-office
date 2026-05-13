@echo off
echo.
echo  Office AI - First-time Setup
echo  =============================
echo.
echo Enter your Groq API key (from console.groq.com):
set /p GROQ_KEY="  GROQ_API_KEY: "

echo.
echo Enter your Gemini API key (optional, press Enter to skip):
set /p GEMINI_KEY="  GEMINI_API_KEY: "

:: Write .env file
(
echo GROQ_API_KEY=%GROQ_KEY%
echo GEMINI_API_KEY=%GEMINI_KEY%
echo GROQ_MODEL=llama-3.3-70b-versatile
echo APP_NAME=Office AI
) > .env

echo.
echo  .env file created successfully!
echo.
echo  Now run: start.bat
echo.
pause
