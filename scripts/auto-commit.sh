#!/bin/bash

# BuildTrack Auto-Commit Script
# Usage: ./scripts/auto-commit.sh "Your commit message"
# Or: ./scripts/auto-commit.sh (uses timestamp)

cd /Users/tristan/Desktop/BuildTrack

# Check if there are changes
if [[ -z $(git status -s) ]]; then
  echo "✅ No changes to commit"
  exit 0
fi

# Get commit message from argument or use default
if [ -z "$1" ]; then
  COMMIT_MSG="Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
else
  COMMIT_MSG="$1"
fi

echo "📦 Staging all changes..."
git add -A

echo "💾 Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

echo "🚀 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
  echo "✅ Successfully pushed to GitHub!"
  echo "🔗 View at: https://github.com/tristankoo-1/buildtrackapp"
else
  echo "❌ Push failed. Check your internet connection or GitHub credentials."
  exit 1
fi

