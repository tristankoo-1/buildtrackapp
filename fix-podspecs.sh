#!/bin/bash

# Script to remove visionos references from all podspec files
echo "Fixing podspec files to remove visionos references..."

# List of podspec files that need fixing
podspec_files=(
    "node_modules/react-native-reanimated/RNReanimated.podspec"
    "node_modules/react-native/sdks/hermes-engine/hermes-engine.podspec"
    "node_modules/react-native/React/CoreModules/React-CoreModules.podspec"
    "node_modules/react-native-webview/react-native-webview.podspec"
    "node_modules/@react-native-clipboard/clipboard/RNCClipboard.podspec"
    "node_modules/@react-native-community/slider/react-native-slider.podspec"
    "node_modules/@react-native-community/netinfo/react-native-netinfo.podspec"
    "node_modules/@react-native-community/datetimepicker/RNDateTimePicker.podspec"
    "node_modules/react-native-worklets/RNWorklets.podspec"
    "node_modules/@react-native-menu/menu/react-native-menu.podspec"
    "node_modules/@react-native-segmented-control/segmented-control/react-native-segmented-control.podspec"
    "node_modules/react-native-pager-view/react-native-pager-view.podspec"
    "node_modules/react-native-screens/RNScreens.podspec"
    "node_modules/react-native-svg/RNSVG.podspec"
    "node_modules/react-native-gesture-handler/RNGestureHandler.podspec"
    "node_modules/@react-native-async-storage/async-storage/RNCAsyncStorage.podspec"
)

for file in "${podspec_files[@]}"; do
    if [ -f "$file" ]; then
        echo "Fixing $file..."
        # Remove lines containing visionos
        sed -i '' '/visionos/d' "$file"
    else
        echo "File not found: $file"
    fi
done

echo "All podspec files have been fixed!"

