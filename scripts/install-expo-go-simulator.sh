#!/bin/bash

# Install Expo Go on iOS Simulator by Copying from Existing Simulator
# Usage: ./scripts/install-expo-go-simulator.sh "Target Simulator Name"

TARGET_SIMULATOR="$1"

if [ -z "$TARGET_SIMULATOR" ]; then
  echo "❌ Error: Please provide target simulator name"
  echo "Usage: $0 \"iPhone 17 Pro Max\""
  echo ""
  echo "Available simulators:"
  xcrun simctl list devices | grep -E "iPhone|iPad" | grep -v "unavailable"
  exit 1
fi

echo "🔍 Finding Expo Go on existing simulators..."
echo ""

# Find all simulators with Expo Go installed
FOUND_EXPO=false
for sim_id in $(xcrun simctl list devices | grep -oE '\([A-Z0-9-]+\)' | tr -d '()'); do
  EXPO_INFO=$(xcrun simctl listapps "$sim_id" 2>/dev/null | grep -A5 "host.exp.Exponent" | grep "Bundle")
  
  if [ -n "$EXPO_INFO" ]; then
    # Extract the app path
    EXPO_PATH=$(echo "$EXPO_INFO" | sed -E 's/.*"file:\/\/(.*)".*;/\1/' | sed 's/%20/ /g')
    
    if [ -d "$EXPO_PATH" ]; then
      # Get simulator name
      SIM_NAME=$(xcrun simctl list devices | grep "$sim_id" | sed -E 's/^[[:space:]]*([^(]+).*/\1/' | xargs)
      
      # Get Expo Go version
      EXPO_VERSION=$(plutil -p "$EXPO_PATH/Info.plist" 2>/dev/null | grep "CFBundleShortVersionString" | sed -E 's/.*=> "(.*)"/\1/')
      
      echo "✅ Found Expo Go $EXPO_VERSION on: $SIM_NAME"
      echo "   Path: $EXPO_PATH"
      
      # Copy to target simulator
      echo ""
      echo "📦 Installing Expo Go to: $TARGET_SIMULATOR"
      xcrun simctl install "$TARGET_SIMULATOR" "$EXPO_PATH"
      
      if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully installed Expo Go $EXPO_VERSION!"
        echo ""
        echo "🚀 To launch Expo Go:"
        echo "   xcrun simctl launch \"$TARGET_SIMULATOR\" host.exp.Exponent"
        echo ""
        echo "📱 To open your app:"
        echo "   xcrun simctl openurl \"$TARGET_SIMULATOR\" \"exp://127.0.0.1:8081\""
        echo ""
        
        # Launch Expo Go
        read -p "Launch Expo Go now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
          xcrun simctl launch "$TARGET_SIMULATOR" host.exp.Exponent
          sleep 2
          xcrun simctl openurl "$TARGET_SIMULATOR" "exp://127.0.0.1:8081"
          echo "✅ Launched!"
        fi
        
        FOUND_EXPO=true
        break
      else
        echo "❌ Failed to install. Check simulator name."
        exit 1
      fi
    fi
  fi
done

if [ "$FOUND_EXPO" = false ]; then
  echo "❌ No simulators found with Expo Go installed."
  echo ""
  echo "💡 Install Expo Go on another simulator first by running:"
  echo "   npx expo start --ios"
  echo ""
  echo "Or download manually from:"
  echo "   https://expo.dev/go"
  exit 1
fi

