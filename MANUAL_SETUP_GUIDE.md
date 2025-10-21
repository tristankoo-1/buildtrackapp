# 🛠️ Manual Setup Guide for BuildTrack

Since Node.js isn't available in your environment, here's how to manually set up the authentication users in Supabase.

## 📋 Prerequisites

- Access to your Supabase Dashboard
- Project URL: Check your `.env` file for `EXPO_PUBLIC_SUPABASE_URL`

## 🚀 Step-by-Step Setup

### Step 1: Create Companies

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste this SQL:

```sql
INSERT INTO companies (id, name, type, description, address, phone, email, website, license_number, is_active, banner, created_at)
VALUES 
  (
    'comp-1',
    'BuildTrack Construction Inc.',
    'general_contractor',
    'Leading general contractor specializing in commercial projects',
    '123 Builder Street, Construction City, CA 90210',
    '555-0100',
    'contact@buildtrack.com',
    'https://buildtrack.com',
    'GC-123456',
    true,
    '{"text":"BuildTrack Construction Inc.","backgroundColor":"#3b82f6","textColor":"#ffffff","isVisible":true}',
    NOW()
  ),
  (
    'comp-2',
    'Elite Electric Co.',
    'subcontractor',
    'Professional electrical services',
    '456 Electric Avenue, Power City, CA 90211',
    '555-0200',
    'info@eliteelectric.com',
    'https://eliteelectric.com',
    'EC-789012',
    true,
    '{"text":"Elite Electric Co.","backgroundColor":"#3b82f6","textColor":"#ffffff","isVisible":true}',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
```

5. Click **RUN**
6. You should see: "Success. No rows returned"

### Step 2: Create Auth Users

1. In your **Supabase Dashboard**, go to **Authentication** → **Users**
2. Click **Add User** button
3. Create each of these 6 users:

#### User 1: John Manager
- **Email**: `manager@buildtrack.com`
- **Password**: `password123`
- **Auto Confirm User**: ✅ YES

#### User 2: Sarah Worker
- **Email**: `worker@buildtrack.com`
- **Password**: `password123`
- **Auto Confirm User**: ✅ YES

#### User 3: Alex Administrator
- **Email**: `admin@buildtrack.com`
- **Password**: `password123`
- **Auto Confirm User**: ✅ YES

#### User 4: Dennis
- **Email**: `dennis@buildtrack.com`
- **Password**: `password123`
- **Auto Confirm User**: ✅ YES

#### User 5: Lisa Martinez
- **Email**: `lisa@eliteelectric.com`
- **Password**: `password123`
- **Auto Confirm User**: ✅ YES

#### User 6: Mike Johnson
- **Email**: `admin@eliteelectric.com`
- **Password**: `password123`
- **Auto Confirm User**: ✅ YES

### Step 3: Get Auth User UUIDs

1. Go to **SQL Editor**
2. Run this query:

```sql
SELECT id, email FROM auth.users 
WHERE email IN (
  'manager@buildtrack.com',
  'worker@buildtrack.com',
  'admin@buildtrack.com',
  'dennis@buildtrack.com',
  'lisa@eliteelectric.com',
  'admin@eliteelectric.com'
)
ORDER BY email;
```

3. **SAVE THESE UUIDs** - you'll need them in the next step!

Example output:
```
id                                    | email
--------------------------------------|---------------------------
123e4567-e89b-12d3-a456-426614174000 | admin@buildtrack.com
234e5678-e89b-12d3-a456-426614174001 | admin@eliteelectric.com
345e6789-e89b-12d3-a456-426614174002 | dennis@buildtrack.com
...
```

### Step 4: Create User Records

1. Take the SQL below and **REPLACE THE UUIDs** with the actual UUIDs from Step 3
2. Match each UUID to its corresponding email
3. Run the modified SQL in **SQL Editor**:

```sql
INSERT INTO users (id, email, name, role, company_id, position, phone, created_at)
VALUES
  -- Replace UUID_MANAGER with the UUID for manager@buildtrack.com
  ('UUID_MANAGER', 'manager@buildtrack.com', 'John Manager', 'manager', 'comp-1', 'Project Manager', '555-0101', NOW()),
  
  -- Replace UUID_WORKER with the UUID for worker@buildtrack.com
  ('UUID_WORKER', 'worker@buildtrack.com', 'Sarah Worker', 'worker', 'comp-1', 'Construction Worker', '555-0102', NOW()),
  
  -- Replace UUID_ADMIN_BT with the UUID for admin@buildtrack.com
  ('UUID_ADMIN_BT', 'admin@buildtrack.com', 'Alex Administrator', 'admin', 'comp-1', 'System Administrator', '555-0103', NOW()),
  
  -- Replace UUID_DENNIS with the UUID for dennis@buildtrack.com
  ('UUID_DENNIS', 'dennis@buildtrack.com', 'Dennis', 'worker', 'comp-1', 'Site Supervisor', '555-0106', NOW()),
  
  -- Replace UUID_LISA with the UUID for lisa@eliteelectric.com
  ('UUID_LISA', 'lisa@eliteelectric.com', 'Lisa Martinez', 'worker', 'comp-2', 'Electrician', '555-0104', NOW()),
  
  -- Replace UUID_ADMIN_EE with the UUID for admin@eliteelectric.com
  ('UUID_ADMIN_EE', 'admin@eliteelectric.com', 'Mike Johnson', 'admin', 'comp-2', 'Operations Manager', '555-0105', NOW())
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone;
```

### Step 5: Verify Setup

Run this verification query in **SQL Editor**:

```sql
SELECT 'Companies' as table_name, COUNT(*) as count 
FROM companies 
WHERE id IN ('comp-1', 'comp-2')

UNION ALL

SELECT 'Users' as table_name, COUNT(*) as count 
FROM users 
WHERE email IN (
  'manager@buildtrack.com',
  'worker@buildtrack.com',
  'admin@buildtrack.com',
  'dennis@buildtrack.com',
  'lisa@eliteelectric.com',
  'admin@eliteelectric.com'
)

UNION ALL

SELECT 'Auth Users' as table_name, COUNT(*) as count 
FROM auth.users 
WHERE email IN (
  'manager@buildtrack.com',
  'worker@buildtrack.com',
  'admin@buildtrack.com',
  'dennis@buildtrack.com',
  'lisa@eliteelectric.com',
  'admin@eliteelectric.com'
);
```

**Expected Result:**
```
table_name  | count
------------|------
Companies   | 2
Users       | 6
Auth Users  | 6
```

## ✅ Test Login

1. Start your app
2. You should see all 6 users on the login screen
3. Click any user to login
4. All should work with password `password123`

## 📊 Created Users Summary

### BuildTrack Construction Inc. (comp-1)
- 📋 **John Manager** - `manager@buildtrack.com` (Manager)
- 👷 **Sarah Worker** - `worker@buildtrack.com` (Worker)
- 👑 **Alex Administrator** - `admin@buildtrack.com` (Admin)
- 👷 **Dennis** - `dennis@buildtrack.com` (Worker)

### Elite Electric Co. (comp-2)
- 👷 **Lisa Martinez** - `lisa@eliteelectric.com` (Worker)
- 👑 **Mike Johnson** - `admin@eliteelectric.com` (Admin)

**All users use password:** `password123`

## 🐛 Troubleshooting

### "Could not find the entity being inserted"
- Make sure you ran Step 1 (Create Companies) first

### "duplicate key value violates unique constraint"
- Users already exist. Either:
  - Skip creating them (they're already set up)
  - Delete existing users first
  - Use the `ON CONFLICT` clause (already in the SQL)

### Users don't appear in app
- Verify all 3 tables have data (Step 5)
- Check that UUIDs in users table match auth.users
- Ensure email addresses match exactly

### Login fails
- Verify password is exactly `password123`
- Check that "Auto Confirm User" was checked
- Verify users appear in Authentication → Users

## 🔄 Starting Fresh

If you need to start over:

1. **Delete Users**:
```sql
DELETE FROM users WHERE email IN (
  'manager@buildtrack.com',
  'worker@buildtrack.com',
  'admin@buildtrack.com',
  'dennis@buildtrack.com',
  'lisa@eliteelectric.com',
  'admin@eliteelectric.com'
);
```

2. **Delete Companies**:
```sql
DELETE FROM companies WHERE id IN ('comp-1', 'comp-2');
```

3. **Delete Auth Users**:
   - Go to Authentication → Users
   - Delete each user manually

4. **Repeat all steps above**

## 💡 Tips

- ✅ Complete steps in order
- ✅ Double-check UUIDs match between auth.users and users table
- ✅ Verify email addresses are exactly as shown
- ✅ Use the verification query to confirm setup
- ✅ Save the UUIDs somewhere safe during setup

## 🎓 Alternative: Install Node.js

If you want to use the automated scripts in the future:

1. **Install Node.js**: https://nodejs.org/
2. **Or install via Homebrew**:
   ```bash
   brew install node
   ```
3. **Or use nvm**:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install --lts
   ```

Then you can use the automated setup:
```bash
npm run setup-auth
```

---

Need help? The manual method is reliable and works every time! Just follow the steps carefully. 🚀

