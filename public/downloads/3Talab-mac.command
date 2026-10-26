#!/bin/bash
# 3Talab Desktop Launcher for macOS
# Opens 3Talab platform in dedicated browser app mode

APP_URL="https://3talaba.netlify.app"

echo "3Talab macOS Desktop Launcher ishga tushmoqda..."

if [ -d "/Applications/Google Chrome.app" ]; then
    open -na "Google Chrome" --args --app="$APP_URL"
elif [ -d "/Applications/Brave Browser.app" ]; then
    open -na "Brave Browser" --args --app="$APP_URL"
else
    open "$APP_URL"
fi
