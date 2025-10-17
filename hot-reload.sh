#!/bin/bash
# Hot Reload Trigger Script

echo "🔥 Triggering hot reload..."

# Method 1: Touch App.tsx (main entry point)
touch App.tsx

# Method 2: Touch a timestamp file to force reload
echo "// Hot reload triggered at $(date)" > .hot-reload-trigger

# Method 3: Clear metro cache if needed
if [ "$1" == "--clear" ]; then
  echo "🧹 Clearing Metro cache..."
  rm -rf node_modules/.cache
  rm -rf .expo
fi

echo "✅ Hot reload triggered! Changes should appear on device within 2-3 seconds."
