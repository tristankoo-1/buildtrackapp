# 🔧 BuildTrack Setup Options

There are two ways to set up authentication for BuildTrack testing:

## 🤖 Automated Setup (Recommended if you have Node.js)

**Requirements:** Node.js and npm installed

**Command:**
```bash
npm run setup-auth
```

**Pros:**
- ✅ Fast (30 seconds)
- ✅ Automated
- ✅ No manual steps
- ✅ Includes verification

**Cons:**
- ❌ Requires Node.js/npm
- ❌ Needs command line access

**Guide:** See [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## 👋 Manual Setup (Works without Node.js)

**Requirements:** Access to Supabase Dashboard

**Method:** Use Supabase web interface

**Pros:**
- ✅ No software installation needed
- ✅ Works in any environment
- ✅ Visual interface
- ✅ Good for learning Supabase

**Cons:**
- ❌ Takes longer (~10 minutes)
- ❌ More steps
- ❌ Manual UUID matching required

**Guide:** See **[MANUAL_SETUP_GUIDE.md](./MANUAL_SETUP_GUIDE.md)** ⭐

---

## 🎯 Which Should I Use?

### Use **Automated** if:
- You have Node.js installed
- You want fast setup
- You plan to reset/test frequently

### Use **Manual** if:
- You don't have Node.js
- `npm` command gives errors
- You prefer visual interfaces
- You want to understand the database structure

---

## 📚 All Available Guides

| Guide | Purpose | Best For |
|-------|---------|----------|
| **[QUICK_START.md](./QUICK_START.md)** | 3-step quick start | Getting started fast |
| **[MANUAL_SETUP_GUIDE.md](./MANUAL_SETUP_GUIDE.md)** ⭐ | Step-by-step manual setup | No Node.js environments |
| **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** | Comprehensive testing info | Automated testing |
| **[AUTH_SETUP_GUIDE.md](./AUTH_SETUP_GUIDE.md)** | Authentication details | Understanding auth flow |
| **[SUPABASE_INTEGRATION_GUIDE.md](./SUPABASE_INTEGRATION_GUIDE.md)** | Backend integration | Technical deep dive |

---

## 🚀 Quick Decision Tree

```
Do you have Node.js/npm installed?
│
├─ YES → Use automated setup
│         Run: npm run setup-auth
│         See: TESTING_GUIDE.md
│
└─ NO → Use manual setup
        Follow: MANUAL_SETUP_GUIDE.md
        Takes 10 minutes
```

---

## ⚠️ Common Issue: "npm: command not found"

If you see this error, use the **Manual Setup** method.

The manual method is just as effective and doesn't require any software installation!

---

## 📞 Need Help?

- **For automated setup issues**: See [TESTING_GUIDE.md](./TESTING_GUIDE.md) troubleshooting section
- **For manual setup issues**: See [MANUAL_SETUP_GUIDE.md](./MANUAL_SETUP_GUIDE.md) troubleshooting section
- **For authentication issues**: See [AUTH_SETUP_GUIDE.md](./AUTH_SETUP_GUIDE.md)

---

**Remember:** Both methods create the exact same result - 6 working test users! Choose whichever is easier for your environment. 🎉
