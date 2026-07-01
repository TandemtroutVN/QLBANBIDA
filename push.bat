@echo off
set msg=%*
if "%msg%"=="" set msg=update %date%

git add .
git commit -m "%msg%"
git push
if %errorlevel% equ 0 echo Da push len GitHub thanh cong!
pause
