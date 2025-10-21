#!/bin/bash
# Expo Development Server with Proper Authentication
# Follow the instructions at: https://docs.expo.dev/accounts/programmatic-access/

echo "🚀 Expo Development Server Setup"
echo "================================"
echo ""
echo "To use this script, you need to create a Personal Access Token:"
echo "1. Go to: https://expo.dev/settings/access-tokens"
echo "2. Click 'Create' to generate a new token"
echo "3. Copy the token and run: export EXPO_TOKEN='your_token_here'"
echo ""

# Check if EXPO_TOKEN is set
if [ -z "$EXPO_TOKEN" ]; then
    echo "❌ EXPO_TOKEN environment variable is not set!"
    echo ""
    echo "Please set it by running:"
    echo "export EXPO_TOKEN='your_token_from_expo_dashboard'"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ EXPO_TOKEN is set"
echo "Token: ${EXPO_TOKEN:0:10}..." # Show first 10 chars for verification
echo ""

# Set Node.js path
export PATH="$PWD/node-v18.20.8-darwin-arm64/bin:$PATH"

# Set additional environment variables
export CI=1
export EXPO_NO_TELEMETRY=1

echo "🔧 Starting Expo development servers..."
echo ""

# Start web server
echo "📱 Starting web server..."
npx @expo/cli@latest start --web --clear &
WEB_PID=$!

# Wait a moment for web server to start
sleep 5

# Start development client server
echo "📱 Starting development client server..."
npx @expo/cli@latest start --dev-client --offline &
DEV_PID=$!

echo ""
echo "✅ Servers started successfully!"
echo "Web server PID: $WEB_PID"
echo "Dev client server PID: $DEV_PID"
echo ""
echo "🌐 Web server: http://localhost:8081"
echo "📱 Expo Go URL: exp://192.168.86.206:8081"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $WEB_PID $DEV_PID
