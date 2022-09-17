@echo off
title = Discord Slash Command Creator
if exist "node_modules" (
    node ./src/index.js
    timeout /t 5 /nobreak
) else (
    echo First run, installing modules...
    npm i
    echo Finished installing modules!
    title = Discord Slash Command Creator
    node ./src/index.js
    timeout /t 5 /nobreak
)
