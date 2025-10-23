#!/bin/bash

# Publish BuildTrack to EAS Update (for Expo Go)
# This publishes your latest code changes so they're accessible via Expo Go

cd /Users/tristan/Desktop/BuildTrack

echo "📱 Publishing BuildTrack to EAS Update for Expo Go..."
echo ""

# Load EXPO_TOKEN from .env if it exists
if [ -f .env ]; then
  export $(grep "^EXPO_TOKEN=" .env | xargs)
fi

# Check if logged in or if token is available
if [ -n "$EXPO_TOKEN" ]; then
  echo "✅ Using EXPO_TOKEN from .env"
else
  echo "Checking EAS login status..."
  if ! npx eas-cli whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to EAS and no EXPO_TOKEN found"
    echo ""
    echo "Please login first:"
    echo "  npx eas-cli login"
    echo ""
    exit 1
  fi
  LOGGED_IN_USER=$(npx eas-cli whoami 2>/dev/null | tail -1)
  echo "✅ Logged in as: $LOGGED_IN_USER"
fi
echo ""

# Get commit message or use default
if [ -z "$1" ]; then
  MESSAGE="Update: $(date '+%Y-%m-%d %H:%M:%S')"
else
  MESSAGE="$1"
fi

echo "📦 Publishing update to main branch..."
echo "Message: $MESSAGE"
echo ""

# Publish the update
npx eas-cli update --branch main --message "$MESSAGE"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Successfully published to EAS Update!"
  echo ""
  echo "🎯 Your update is now available in Expo Go"
  echo "🔗 View updates: https://expo.dev/accounts/tristankoo/projects/buildtrack/updates"
  echo ""
  echo "📱 To test in Expo Go:"
  echo "   1. Open Expo Go app"
  echo "   2. Scan the QR code or enter: exp://192.168.x.x:8081"
  echo "   3. Pull down to refresh and get the latest update"
else
  echo ""
  echo "❌ Publish failed. Please check the error messages above."
  exit 1
fi

