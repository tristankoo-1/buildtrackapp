#!/bin/bash

# BuildTrack EAS Build & Submit Script
# Make sure you're logged in first: npx eas-cli login

cd /Users/tristan/Desktop/BuildTrack

echo "🚀 Starting EAS Build for BuildTrack..."
echo ""

# Check if logged in
echo "Checking EAS login status..."
if ! npx eas-cli whoami > /dev/null 2>&1; then
  echo "❌ Not logged in to EAS"
  echo "Please run: npx eas-cli login"
  exit 1
fi

LOGGED_IN_USER=$(npx eas-cli whoami 2>/dev/null)
echo "✅ Logged in as: $LOGGED_IN_USER"
echo ""

# Ask which platform to build
echo "Which platform do you want to build?"
echo "1) iOS only"
echo "2) Android only"
echo "3) Both iOS and Android"
read -p "Enter choice (1-3): " PLATFORM_CHOICE

case $PLATFORM_CHOICE in
  1)
    echo ""
    echo "📱 Building iOS (production)..."
    npx eas-cli build --platform ios --profile production
    ;;
  2)
    echo ""
    echo "🤖 Building Android (production)..."
    npx eas-cli build --platform android --profile production
    ;;
  3)
    echo ""
    echo "📱🤖 Building iOS and Android (production)..."
    npx eas-cli build --platform all --profile production
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "✅ Build submitted to EAS!"
echo "🔗 Check status at: https://expo.dev/accounts/tristankoo/projects/buildtrack/builds"

