# 🔥 Hot Reload System Guide

## ✅ What's Been Fixed

### Metro Configuration Updated
- **File**: `metro.config.js`
- **Changes**:
  - Added cache control headers to force fresh reloads
  - Configured transformer for faster dev builds
  - Optimized for Node.js file watcher (watchman not installed)

### Hot Reload Script Created
- **File**: `hot-reload.sh`
- **Usage**: `./hot-reload.sh` or `./hot-reload.sh --clear`
- **What it does**:
  - Touches `App.tsx` to trigger Metro rebuild
  - Creates timestamp file for change detection
  - Optionally clears Metro cache with `--clear` flag

---

## 🚀 How to Trigger Hot Reload

### Method 1: Use the Script (Recommended)
```bash
cd /home/user/workspace
./hot-reload.sh
```

### Method 2: Touch App.tsx Manually
```bash
cd /home/user/workspace
touch App.tsx
```

### Method 3: Add/Remove a Space
- Open `App.tsx`
- Add a space or newline
- Save the file
- Changes should appear in 2-3 seconds

### Method 4: Nuclear Option (If Nothing Works)
```bash
cd /home/user/workspace
./hot-reload.sh --clear
# Then restart the Expo dev server
```

---

## 📱 Expo Dev Server Status

### Check if Server is Running
```bash
lsof -ti:8081
# Should return a process ID (number)
# If empty, server is not running
```

### Server Start Command (Vibecode manages this automatically)
```bash
# Vibecode's internal system runs:
npx expo start --port 8081

# You should NOT need to run this manually
# The Vibecode system handles the dev server
```

---

## 🔍 Understanding the Hot Reload Flow

1. **You make a change** to any `.tsx` or `.ts` file
2. **Metro detects the change** via Node.js file watcher
3. **Metro rebuilds** the changed module
4. **Fast Refresh sends update** to connected devices
5. **React Native applies the change** without full reload

### What Triggers Hot Reload:
- ✅ Editing any `.tsx` component
- ✅ Editing any `.ts` file
- ✅ Touching `App.tsx`
- ✅ Changes to files imported by components

### What Requires Full Reload:
- ❌ Changes to `metro.config.js`
- ❌ Changes to `babel.config.js`
- ❌ Installing new packages
- ❌ Changes to native module configurations
- ❌ Changes to `app.json`

---

## 🐛 Troubleshooting

### Hot Reload Not Working?

1. **Verify Metro is running:**
   ```bash
   lsof -ti:8081
   ```

2. **Check device connection:**
   - Shake device → "Settings" → Verify dev server URL
   - Should show: `exp://YOUR_IP:8081`

3. **Clear Metro cache:**
   ```bash
   ./hot-reload.sh --clear
   ```

4. **Check for TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```
   - TypeScript errors can block hot reload
   - Fix any errors shown

5. **Restart Expo on device:**
   - Close Expo Go app completely
   - Reopen and scan QR code again

### Still Not Working?

1. **Full cache clear:**
   ```bash
   rm -rf node_modules/.cache
   rm -rf .expo
   rm -rf /tmp/metro-*
   ```

2. **Verify file saved:**
   - Some editors have "auto-save delay"
   - Make sure file is actually saved to disk
   - Check file modification time: `ls -la App.tsx`

3. **Check Metro logs:**
   - Metro shows rebuild messages in terminal
   - Look for: "Building bundle..."
   - Look for: "Fast refresh complete"

---

## ⚡ Performance Tips

### Fast Reload Times
- **Small changes**: ~1-2 seconds
- **Large changes**: ~3-5 seconds
- **Full rebuild**: ~10-30 seconds

### To Speed Up Reloads:
1. Only edit one file at a time
2. Keep components small and focused
3. Use React.memo() for expensive components
4. Avoid inline functions in render
5. Use the `hot-reload.sh` script for instant feedback

---

## 📝 Quick Reference

| Command | Description |
|---------|-------------|
| `./hot-reload.sh` | Trigger hot reload |
| `./hot-reload.sh --clear` | Clear cache & reload |
| `touch App.tsx` | Manual reload trigger |
| `lsof -ti:8081` | Check Metro server |
| `npx tsc --noEmit` | Check TypeScript errors |

---

## 🎯 Best Practices

1. **Save files immediately** - Don't rely on auto-save
2. **Watch Metro terminal** - It shows rebuild status
3. **One change at a time** - Easier to debug issues
4. **Use the script** - `./hot-reload.sh` is most reliable
5. **Check device** - Sometimes need to shake and "Reload"

---

## 🔧 Technical Details

### Metro Configuration
- **Watcher**: Node.js fs.watch() (no watchman)
- **Cache**: Enabled with no-cache headers
- **Transform Cache**: Enabled for faster rebuilds
- **Minifier**: metro-minify-terser with dev optimizations

### File Watching
- Metro watches all files in `src/`, root `.tsx/.ts` files
- Uses Node.js native file watching
- Should detect changes within 100-500ms
- Network latency adds 500-1000ms
- Total time: ~2-3 seconds

---

**Last Updated**: After banner upload feature implementation
**Status**: ✅ Fully configured and working
