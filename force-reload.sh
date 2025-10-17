#!/bin/bash
# Force reload script - More aggressive approach

echo "🔄 FORCE RELOAD INITIATED"
echo "========================="

# Step 1: Add timestamp comments to force file changes
TIMESTAMP=$(date +%s)
echo "// Force reload: $TIMESTAMP" >> src/screens/DashboardScreen.tsx
echo "// Force reload: $TIMESTAMP" >> src/screens/TasksScreen.tsx
echo "// Force reload: $TIMESTAMP" >> App.tsx

echo "✅ Added timestamp comments to key files"

# Step 2: Touch all screen files
touch src/screens/*.tsx
echo "✅ Touched all screen files"

# Step 3: Touch translation files
touch src/locales/*.ts
echo "✅ Touched translation files"

# Step 4: Update hot reload trigger
date +%s%N > .hot-reload-trigger
echo "✅ Updated hot reload trigger"

# Step 5: Clear metro cache directory if it exists
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✅ Cleared metro cache"
fi

# Step 6: Send notification to metro bundler
if command -v curl &> /dev/null; then
    curl -s -X POST http://localhost:8081/reload > /dev/null 2>&1
    echo "✅ Sent reload signal to metro bundler"
fi

echo ""
echo "========================================="
echo "✅ FORCE RELOAD COMPLETE"
echo "========================================="
echo ""
echo "📱 NOW DO THIS ON YOUR DEVICE:"
echo "   1. SHAKE your iPhone"
echo "   2. Tap 'Reload'"
echo "   OR"
echo "   3. Force close Expo Go and reopen"
echo ""
