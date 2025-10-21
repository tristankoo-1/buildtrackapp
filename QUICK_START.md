# 🚀 BuildTrack Quick Start

Get up and running with BuildTrack in 3 simple steps!

## Step 1: Setup Authentication

### Option A: Automated (Requires Node.js)

Run this command to create all 6 test users:

```bash
npm run setup-auth
```

### Option B: Manual (No Node.js required)

If you don't have Node.js or npm, follow the **[MANUAL_SETUP_GUIDE.md](./MANUAL_SETUP_GUIDE.md)** to set up users through the Supabase Dashboard.

This creates:
- ✅ BuildTrack Construction Inc. (4 users)
- ✅ Elite Electric Co. (2 users)
- ✅ All users with password: `password123`

## Step 2: Start the App

```bash
npm start
```

## Step 3: Login

Click any user on the login screen to login instantly!

### Available Users:

**BuildTrack Construction Inc.**
- 📋 John Manager (`manager@buildtrack.com`)
- 👷 Sarah Worker (`worker@buildtrack.com`)
- 👑 Alex Administrator (`admin@buildtrack.com`)
- 👷 Dennis (`dennis@buildtrack.com`)

**Elite Electric Co.**
- 👷 Lisa Martinez (`lisa@eliteelectric.com`)
- 👑 Mike Johnson (`admin@eliteelectric.com`)

---

## 🧹 Need a Fresh Start?

```bash
npm run setup-auth:cleanup
npm run setup-auth
```

## 📚 More Information

- **Testing Guide**: See `TESTING_GUIDE.md` for detailed testing instructions
- **Auth Setup**: See `AUTH_SETUP_GUIDE.md` for authentication details
- **Supabase Integration**: See `SUPABASE_INTEGRATION_GUIDE.md` for backend info

## 🐛 Login Not Working?

1. Make sure you ran `npm run setup-auth`
2. Check that your `.env` file has Supabase credentials
3. Verify users exist in Supabase Dashboard → Authentication
4. Try cleanup and setup again

---

That's it! You're ready to test BuildTrack! 🎉
