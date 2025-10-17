# 🔄 Quick Restart Instructions

**Critical Fix Applied:** Metro Watchman is now enabled for hot reload!

---

## ⚡ Quick Start (Run These Commands)

```bash
# 1. Navigate to project
cd /home/user/workspace

# 2. Clear all caches
rm -rf node_modules/.cache
rm -rf .expo

# 3. Start dev server with clean slate
npx expo start --clear
```

---

## 📱 On Your Device

### **iOS:**
1. Delete Expo Go app completely
2. Reinstall from App Store
3. Scan new QR code
4. Login as: `admin@buildtrack.com`

### **Android:**
1. Settings → Apps → Expo Go
2. Storage → Clear Data + Clear Cache
3. Force Stop
4. Reopen Expo Go
5. Scan new QR code
6. Login as: `admin@buildtrack.com`

---

## ✅ What You Should See

After logging in as `admin@buildtrack.com`:

```
╔══════════════════════════════════════════╗
║  Admin Dashboard v4.0-FINAL              ║
║  Alex Administrator • 2025-10-02-16:30   ║
╚══════════════════════════════════════════╝

✅ ALL SYSTEMS OPERATIONAL

Tests:
✓ Code Loaded: v4.0-FINAL
✓ Total Projects: 4 / 4
✓ Company Users: 3 / 3
✓ Company Filtering: 2 filtered
✓ Company Banner: Present

Company Overview
- Total Projects: 2
- Company Users: 3
```

---

## 🐛 Still Not Working?

1. **Verify Metro config was changed:**
   ```bash
   cat metro.config.js | grep useWatchman
   # Should show: config.resolver.useWatchman = true;
   ```

2. **Check port 8081:**
   ```bash
   lsof -ti:8081
   # Should return a process ID (number)
   ```

3. **Try test edit:**
   - Open any file
   - Add a space
   - Save
   - Should rebuild within 2 seconds

4. **Nuclear option:**
   ```bash
   rm -rf node_modules
   bun install
   rm -rf .expo node_modules/.cache
   npx expo start --clear
   ```

---

**The code is ready! Just needs fresh caches.** 🚀
