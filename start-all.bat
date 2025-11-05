@echo off
echo Starting movie app...

start cmd /k "cd movie-server && node server.js"
start cmd /k "cd movie-client && npm run dev"

echo Both servers are launching. You can close this window.
pause 
