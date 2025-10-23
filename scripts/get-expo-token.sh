#!/bin/bash

# Get Expo Token Script
# This script helps you get your Expo token for GitHub Secrets

echo "🔑 Getting Your Expo Token for GitHub Secrets"
echo "=============================================="
echo ""

# Check if logged in
echo "Checking EAS login status..."
if ! npx eas whoami > /dev/null 2>&1; then
  echo "❌ Not logged in to EAS"
  echo ""
  echo "Please login first:"
  echo "  npx eas login"
  echo ""
  exit 1
fi

LOGGED_IN_USER=$(npx eas whoami 2>/dev/null)
echo "✅ Logged in as: $LOGGED_IN_USER"
echo ""

# Get token from environment or prompt
if [ -n "$EXPO_TOKEN" ]; then
  echo "✅ Found EXPO_TOKEN in environment"
  TOKEN="$EXPO_TOKEN"
else
  echo "📝 To get your Expo token:"
  echo "1. Go to: https://expo.dev/accounts/tristankoo/settings/access-tokens"
  echo "2. Click 'Create Token'"
  echo "3. Give it a name like 'GitHub Actions'"
  echo "4. Copy the token"
  echo ""
  read -p "Enter your Expo token: " TOKEN
fi

if [ -z "$TOKEN" ]; then
  echo "❌ No token provided"
  exit 1
fi

echo ""
echo "🔧 Next Steps:"
echo "=============="
echo ""
echo "1. Go to your GitHub repository:"
echo "   https://github.com/tristankoo-1/buildtrackapp"
echo ""
echo "2. Click Settings → Secrets and variables → Actions"
echo ""
echo "3. Click 'New repository secret'"
echo ""
echo "4. Name: EXPO_TOKEN"
echo "   Value: $TOKEN"
echo ""
echo "5. Click 'Add secret'"
echo ""
echo "6. Push your code to main branch to trigger automatic updates!"
echo ""
echo "✅ Setup complete! Your GitHub Actions will now automatically"
echo "   publish updates to EAS when you push to the main branch."
