@echo off
cd /d %~dp0
start "vibe-showcase-server" cmd /c "node server.js"
timeout /t 1 >nul
start http://localhost:4820
echo 展示页已在浏览器打开（http://localhost:4820）。关闭本窗口不会停掉服务，要停服务请关弹出的 server 窗口。
