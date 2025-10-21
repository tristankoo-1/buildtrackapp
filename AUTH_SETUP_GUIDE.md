# Automated Supabase Authentication Setup

This guide provides automated scripts to set up all authentication users in Supabase without manual SQL operations.

## 🚀 Quick Setup

### Option 1: Using npm script (Recommended)
```bash
npm run setup-auth
```

### Option 2: Using shell script
```bash
./scripts/setup-auth.sh
```

### Option 3: Direct Node.js execution
```bash
node scripts/automated-setup.js
```

## 📋 What the Script Does

The automated setup script will:

1. **Create Companies** - Sets up BuildTrack Construction Inc. and Elite Electric Co.
2. **Create Auth Users** - Creates 6 users in Supabase Auth with email confirmation
3. **Create User Records** - Links auth users to the users table with proper company associations
4. **Verify Setup** - Confirms all users are properly configured

## 👥 Test Users Created

### BuildTrack Construction Inc. Users:
- **John Manager** (`manager@buildtrack.com`) - Manager
- **Sarah Worker** (`worker@buildtrack.com`) - Worker  
- **Alex Administrator** (`admin@buildtrack.com`) - Admin
- **Dennis** (`dennis@buildtrack.com`) - Worker

### Elite Electric Co. Users:
- **Lisa Martinez** (`lisa@eliteelectric.com`) - Worker
- **Mike Johnson** (`admin@eliteelectric.com`) - Admin

**All users use password:** `password123`

## 🔧 Prerequisites

1. **Node.js** installed on your system
2. **Supabase credentials** in your `.env` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
3. **Database schema** already set up in Supabase

## 🛠️ Manual Setup (Alternative)

If the automated script doesn't work, you can manually set up users:

### 1. Create Companies in Supabase SQL Editor:
```sql
INSERT INTO companies (id, name, type, description, email, phone, is_active) VALUES
('comp-1', 'BuildTrack Construction Inc.', 'general_contractor', 'Leading general contractor specializing in commercial projects', 'contact@buildtrack.com', '555-0100', true),
('comp-2', 'Elite Electric Co.', 'subcontractor', 'Professional electrical services', 'info@eliteelectric.com', '555-0200', true)
ON CONFLICT (id) DO NOTHING;
```

### 2. Create Auth Users in Supabase Dashboard:
- Go to Authentication → Users → Add User
- Create each user with email and password `password123`
- Enable "Auto Confirm" for each user

### 3. Create User Records:
After creating auth users, get their UUIDs and create records:
```sql
-- Replace AUTH_USER_UUID with actual UUIDs from auth.users
INSERT INTO users (id, email, name, role, company_id, position, phone) VALUES
('AUTH_USER_UUID_1', 'manager@buildtrack.com', 'John Manager', 'manager', 'comp-1', 'Project Manager', '555-0101'),
('AUTH_USER_UUID_2', 'worker@buildtrack.com', 'Sarah Worker', 'worker', 'comp-1', 'Construction Worker', '555-0102'),
('AUTH_USER_UUID_3', 'admin@buildtrack.com', 'Alex Administrator', 'admin', 'comp-1', 'System Administrator', '555-0103'),
('AUTH_USER_UUID_4', 'dennis@buildtrack.com', 'Dennis', 'worker', 'comp-1', 'Site Supervisor', '555-0106'),
('AUTH_USER_UUID_5', 'lisa@eliteelectric.com', 'Lisa Martinez', 'worker', 'comp-2', 'Electrician', '555-0104'),
('AUTH_USER_UUID_6', 'admin@eliteelectric.com', 'Mike Johnson', 'admin', 'comp-2', 'Operations Manager', '555-0105')
ON CONFLICT (email) DO NOTHING;
```

## 🔍 Verification

After running the setup, verify it worked by:

1. **Check Supabase Dashboard**:
   - Authentication → Users (should show 6 users)
   - Table Editor → users (should show 6 records)
   - Table Editor → companies (should show 2 companies)

2. **Test Login in App**:
   - Try logging in with any of the 6 users
   - All should work with password `password123`

## 🐛 Troubleshooting

### Common Issues:

1. **"Missing Supabase configuration"**
   - Check your `.env` file has the correct credentials
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (not just the anon key)

2. **"Node.js not found"**
   - Install Node.js from https://nodejs.org/
   - Or use the manual setup method

3. **"Permission denied" errors**
   - Make sure your service role key has admin permissions
   - Check that RLS policies allow the operations

4. **"User already exists"**
   - This is normal - the script skips existing users
   - Check the verification step to confirm setup

### Getting Help:

If you encounter issues:
1. Check the script output for specific error messages
2. Verify your Supabase credentials are correct
3. Ensure your database schema matches the expected structure
4. Try the manual setup method as a fallback

## 📱 Testing

Once setup is complete:
1. Start your app: `npm start`
2. Try logging in with any of the 6 users
3. Verify you can navigate through the app
4. Test different user roles (admin vs worker vs manager)

The authentication should now work seamlessly with Supabase!
