// Run this with: node clearCache.js
// This will show you the command to clear cache

console.log(`
╔═══════════════════════════════════════════════════════════╗
║        AUTO-RELOAD SYSTEM NOW ACTIVE - v11.4             ║
╚═══════════════════════════════════════════════════════════╝

The app now has an AUTOMATIC RELOAD SYSTEM that will:
✓ Detect version changes
✓ Clear persisted data automatically
✓ Force reload with fresh mock data

IMMEDIATE FIX - Force App to Reload NOW:
----------------------------------------
1. CLOSE the Vibecode App completely on your device
2. REOPEN the Vibecode App
3. The app will automatically detect v11.4 and clear all data
4. Login as Peter: dennis@buildtrack.com / password: 123456
5. You will see 2 projects and 3 tasks!

WHY THIS WORKS:
---------------
- App now checks version on startup (v11.4)
- If version changed, it clears AsyncStorage
- This forces stores to reload with MOCK_DATA
- Dennis's projects & tasks are in MOCK_DATA

TROUBLESHOOTING:
----------------
If closing/reopening doesn't work:

OPTION 1: Clear App Data (Fastest)
iOS:
  - Settings → General → iPhone Storage → Vibecode App → Delete
  - Reinstall from TestFlight or App Store

Android:
  - Settings → Apps → Vibecode App → Storage → Clear Data
  - Force Stop → Reopen

OPTION 2: Clear Metro Cache
  cd /home/user/workspace
  rm -rf node_modules/.cache .expo
  bun start --clear

OPTION 3: Login/Logout
  - Login to any account
  - Tap Profile
  - Logout
  - Login as Peter

╔═══════════════════════════════════════════════════════════╗
║  Peter is FULLY SETUP in the code:                       ║
║  - 2 Projects assigned                                    ║
║  - 3 Tasks assigned                                       ║
║  - Just needs the app to reload!                          ║
╚═══════════════════════════════════════════════════════════╝
`);

