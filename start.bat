@echo off
chcp 65001 > nul

echo Получение IP-адресов компьютера...

:: Получение вывода команды ipconfig и сохранение его во временный файл
ipconfig > ipconfig_output.txt

:: Парсинг временного файла для извлечения IP-адресов
setlocal enabledelayedexpansion
set count=0
(for /f "tokens=2 delims=:" %%a in ('type ipconfig_output.txt ^| find "IPv4"') do (
    set /a count+=1
    set ip[!count!]=%%a
    echo !count!. %%a
))

:: Пользовательский выбор IP-адреса
set /p choice=Введите номер выбранного IP-адреса:

:: Вывод выбранного IP-адреса
echo Вы выбрали IP-адрес: !ip[%choice%]!

:: Запуск сервера на выбранном IP-адресе
:: Переход в каталог backend
cd "backend"

:: Проверка наличия строки SERVER_IP в .env и обновление её
if exist .env (
    findstr /v /r "^SERVER_IP=" .env > .env.tmp
    echo SERVER_IP=!ip[%choice%]!>>.env.tmp
    move /y .env.tmp .env
) else (
    echo SERVER_IP=!ip[%choice%]! > .env
)

:: Запуск команды npm run dev
npm run dev

:: Удаление временного файла
del ..\ipconfig_output.txt

:: Чтобы оставить окно консоли открытым после выполнения скрипта
pause
