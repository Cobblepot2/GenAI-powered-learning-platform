@echo off
setlocal
cd /d "%~dp0"
echo LearnLoop classroom prototype
echo Runs with Python 3.7 or newer. No API key or npm install is needed.
echo.
where py >nul 2>nul
if errorlevel 1 goto use_python
py -3 serve.py %*
goto finished

:use_python
where python >nul 2>nul
if errorlevel 1 goto no_python
python serve.py %*
goto finished

:no_python
echo Python was not found. Set up Python before the session.
echo You can still read the PDF and screenshot in the extracted folder.

:finished
echo.
echo If the server stopped, read the message above before closing this window.
pause
