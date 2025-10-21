# BuildTrack Testing Guide

This guide explains how to use the automated testing and setup scripts for BuildTrack.

## 🚀 Quick Start

### Setup Authentication (Recommended)
This sets up the exact 6 users shown on your login screen:

```bash
npm run setup-auth
```

This will create:
- **2 Companies**: BuildTrack Construction Inc. & Elite Electric Co.
- **6 Users** with Supabase Auth: All the users from your login screen
- All users use password: `password123`

### Cleanup
To remove all test data and start fresh:

```bash
npm run setup-auth:cleanup
```

## 📋 Available Scripts

### Authentication Setup Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Setup Auth** | `npm run setup-auth` | Sets up the 6 login screen users |
| **Cleanup Auth** | `npm run setup-auth:cleanup` | Removes all test data |
| **Legacy Setup** | `npm run setup-auth:legacy` | Old JavaScript version (for compatibility) |

### Comprehensive Test Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Comprehensive Test** | `npm run test:comprehensive` | Creates full test scenario with projects and tasks |
| **Test Cleanup** | `npm run test:cleanup` | Cleans up comprehensive test data |

## 👥 Login Screen Users

After running `npm run setup-auth`, you can login with any of these users:

### BuildTrack Construction Inc.
- **John Manager** - `manager@buildtrack.com` (Manager)
- **Sarah Worker** - `worker@buildtrack.com` (Worker)
- **Alex Administrator** - `admin@buildtrack.com` (Admin)
- **Dennis** - `dennis@buildtrack.com` (Worker)

### Elite Electric Co.
- **Lisa Martinez** - `lisa@eliteelectric.com` (Worker)
- **Mike Johnson** - `admin@eliteelectric.com` (Admin)

**All users use password:** `password123`

## 🔧 Setup Requirements

Before running any scripts, ensure:

1. **Node.js** is installed
2. **TypeScript (tsx)** is available (comes with project dependencies)
3. **.env file** has your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## 📊 What Gets Created

### `npm run setup-auth`
- ✅ 2 Companies (BuildTrack, Elite Electric)
- ✅ 6 Auth users (Supabase Auth)
- ✅ 6 User records (users table)
- ✅ Proper company associations
- ✅ Ready-to-use login credentials

### `npm run test:comprehensive`
- ✅ 2 Test companies (Company A, Company B)
- ✅ 5 Test users with auth
- ✅ 2 Projects with full details
- ✅ 5 Tasks with subtasks
- ✅ Complete test scenario

## 🎯 Typical Workflow

### For Development/Testing:

1. **First time setup:**
   ```bash
   npm run setup-auth
   ```

2. **Start your app:**
   ```bash
   npm start
   ```

3. **Test login with any user** from the login screen

4. **When you need a clean slate:**
   ```bash
   npm run setup-auth:cleanup
   npm run setup-auth
   ```

### For Comprehensive Testing:

1. **Setup users first:**
   ```bash
   npm run setup-auth
   ```

2. **Run comprehensive test** (creates projects, tasks, etc.):
   ```bash
   npm run test:comprehensive
   ```

3. **Cleanup when done:**
   ```bash
   npm run test:cleanup
   npm run setup-auth:cleanup
   ```

## 🔍 Verification

After running setup, verify it worked:

1. **Check Supabase Dashboard:**
   - Go to Authentication → Users (should show 6 users)
   - Go to Table Editor → users (should show 6 records)
   - Go to Table Editor → companies (should show 2 companies)

2. **Test in App:**
   - Start the app
   - Click any user on the login screen
   - Should successfully login and show dashboard

## 🐛 Troubleshooting

### "Missing Supabase configuration"
- Check your `.env` file has all required credentials
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key)

### "User already exists"
- Run cleanup first: `npm run setup-auth:cleanup`
- Then run setup again: `npm run setup-auth`

### "tsx command not found"
- Install dependencies: `npm install`
- Or use legacy script: `npm run setup-auth:legacy`

### "Permission denied" or RLS errors
- Ensure your service role key is correct
- Check that RLS policies allow admin operations
- Try running the SQL schema setup in Supabase first

### Login still fails in app
1. Verify users exist in Supabase dashboard
2. Check that user emails match exactly
3. Verify password is `password123`
4. Check app is using Supabase (not mock data)

## 📱 Testing Different Scenarios

### Test User Roles:
- **Admin**: Can manage everything
- **Manager**: Can create/assign tasks
- **Worker**: Can view and update assigned tasks

### Test Company Isolation:
1. Login as BuildTrack user
2. Should only see BuildTrack projects/tasks
3. Login as Elite Electric user
4. Should only see Elite Electric projects/tasks

### Test Permissions:
1. Login as worker
2. Try to assign tasks (should not be able to)
3. Login as manager
4. Try to assign tasks (should work)

## 🎓 Script Details

### setup-login-users.ts
- **Purpose**: Creates the exact users shown on login screen
- **Features**:
  - Idempotent (safe to run multiple times)
  - Creates both auth and database records
  - Verifies setup after creation
  - Provides detailed logging
- **Best for**: Daily development and testing

### comprehensive-test.ts
- **Purpose**: Creates full test scenario with projects and tasks
- **Features**:
  - Creates complete data hierarchy
  - Sets up task assignments
  - Tests all relationships
  - Validates database schema
- **Best for**: Integration testing and demos

### automated-setup.js
- **Purpose**: Legacy JavaScript version
- **Features**:
  - Works without TypeScript
  - Simpler Node.js compatibility
  - Same functionality as setup-login-users
- **Best for**: Environments without tsx support

## 🔐 Security Notes

- **Service Role Key**: Keep your `SUPABASE_SERVICE_ROLE_KEY` secure
- **Test Passwords**: `password123` is only for testing
- **Production**: Change all passwords before production use
- **RLS Policies**: Ensure proper Row Level Security is enabled

## 💡 Tips

1. **Clean start**: Always run cleanup before fresh setup
2. **Check logs**: Scripts provide detailed output for debugging
3. **Verify first**: Check Supabase dashboard before testing in app
4. **One at a time**: Don't run multiple scripts simultaneously
5. **Save credentials**: Note which users you're testing with

## 📚 Additional Resources

- **Supabase Dashboard**: Check your project's dashboard for data verification
- **Auth Documentation**: See Supabase Auth docs for advanced features
- **Database Schema**: Check `scripts/database-schema-simple.sql` for schema details
- **Integration Guide**: See `SUPABASE_INTEGRATION_GUIDE.md` for more info

---

Need help? Check the error messages from the scripts - they're designed to be helpful and point you to solutions!
