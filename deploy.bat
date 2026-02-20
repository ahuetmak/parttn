@echo off
set GIT=C:\Users\ahuet\OneDrive\news\PortableGit\bin\git.exe
cd /d C:\Users\ahuet\OneDrive\partth
%GIT% add .github\workflows\deploy.yml deploy.bat
%GIT% commit -m "ci: fix deploy pipeline y batch helper"
%GIT% push origin main
echo.
echo === PUSH COMPLETO ===
