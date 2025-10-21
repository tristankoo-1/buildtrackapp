#!/bin/bash
# Expo Development Server Startup Script
# This script sets up proper authentication for Expo CLI

# Set Node.js path
export PATH="$PWD/node-v18.20.8-darwin-arm64/bin:$PATH"

# Set Expo authentication variables
export EXPO_TOKEN="exp_temp_dev_token_$(date +%s)"
export CI=1
export EXPO_NO_TELEMETRY=1

# Start the development server
echo "Starting Expo development server with authentication..."
echo "EXPO_TOKEN: $EXPO_TOKEN"
echo "CI Mode: $CI"

# Start web server
npx @expo/cli@latest start --web --clear &
WEB_PID=$!

# Start development client server
npx @expo/cli@latest start --dev-client --offline &
DEV_PID=$!

echo "Web server PID: $WEB_PID"
echo "Dev client server PID: $DEV_PID"
echo "Web server: http://localhost:8081"
echo "Expo Go URL: exp://192.168.86.206:8081"

# Wait for both processes
wait $WEB_PID $DEV_PID
