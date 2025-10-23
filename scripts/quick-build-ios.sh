#!/bin/bash

# Quick iOS Build Script
# Builds iOS production binary and submits to EAS

cd /Users/tristan/Desktop/BuildTrack

echo "🚀 Building iOS production binary..."
echo ""

# Upgrade EAS CLI if needed
echo "Checking EAS CLI version..."
npx eas-cli --version

echo ""
echo "📱 Starting iOS build (production profile)..."
echo "This will:"
echo "  - Auto-increment build number"
echo "  - Use remote credentials"
echo "  - Build for production"
echo ""

npx eas-cli build --platform ios --profile production --non-interactive

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build submitted successfully!"
  echo "🔗 View build status: https://expo.dev/accounts/tristankoo/projects/buildtrack/builds"
else
  echo ""
  echo "❌ Build failed. Please check the error messages above."
  exit 1
fi

