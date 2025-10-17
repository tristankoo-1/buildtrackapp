# 🚀 Supabase Migration Guide

This guide will help you migrate from mock data to Supabase for persistent, scalable data storage.

## 📋 Prerequisites

1. **Supabase Account**: Sign up at https://supabase.com
2. **Project Created**: Create a new project in Supabase dashboard
3. **Environment Variables**: Set up your `.env` file

## 🔧 Step 1: Setup Supabase Project

### 1.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `buildtrack-production`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Get Your Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGc...`

### 1.3 Create .env File
Create a `.env` file in your project root:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🗄️ Step 2: Setup Database Schema

### 2.1 Run Database Schema
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy the contents of `scripts/database-schema.sql`
4. Paste and click **Run**
5. You should see: "Success. No rows returned"

### 2.2 Verify Tables Created
Go to **Table Editor** and verify these tables exist:
- ✅ `companies`
- ✅ `users`
- ✅ `projects`
- ✅ `user_project_assignments`
- ✅ `tasks`
- ✅ `sub_tasks`
- ✅ `task_updates`
- ✅ `task_delegation_history`
- ✅ `task_read_status`

## 🌱 Step 3: Seed Database with Mock Data

### 3.1 Install Dependencies
```bash
npm install tsx
```

### 3.2 Run Seeding Script
```bash
npx tsx scripts/seedDatabase.ts
```

You should see output like:
```
🌱 Starting database seeding...

✅ Clearing existing data
✅ Seeding companies - 3 companies
✅ Seeding users - 6 users
✅ Seeding projects - 4 projects
✅ Seeding user project assignments
✅ Seeding tasks - 8 tasks
✅ Seeding sub-tasks

🎉 Database seeding completed successfully!

📊 Summary:
   Companies: 3
   Users: 6
   Projects: 4
   Tasks: 8

🚀 Your app is now ready to use Supabase!
```

## 🔄 Step 4: Update Stores to Use Supabase

### 4.1 Update Company Store
Replace `src/state/companyStore.ts` with the Supabase version:

```bash
# Backup current store
cp src/state/companyStore.ts src/state/companyStore.backup.ts

# Replace with Supabase version
cp src/state/companyStore.example-supabase.ts src/state/companyStore.ts
```

### 4.2 Update Other Stores
Follow the same pattern for other stores:
- `userStore.ts`
- `projectStore.ts`
- `taskStore.ts`

### 4.3 Update Components
Add data fetching to your components:

```typescript
// In your main screens
useEffect(() => {
  // Fetch data on mount
  useCompanyStore.getState().fetchCompanies();
  useUserStore.getState().fetchUsers();
  useProjectStore.getState().fetchProjects();
  useTaskStore.getState().fetchTasks();
}, []);
```

## 🧪 Step 5: Test the Migration

### 5.1 Test Data Loading
1. Start your app
2. Check that data loads from Supabase
3. Verify all screens work correctly

### 5.2 Test Data Persistence
1. Create a new task
2. Close and reopen the app
3. Verify the task persists

### 5.3 Test Real-time Updates
1. Open app on two devices
2. Create/update data on one device
3. Verify changes appear on the other device

## 🔍 Troubleshooting

### "Missing Supabase configuration"
- Check your `.env` file exists
- Verify environment variables are set correctly
- Restart your development server

### "Row Level Security policy violation"
- Check that RLS policies are set up correctly
- Verify user authentication is working
- Check Supabase logs for specific errors

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Data not loading
- Check Supabase dashboard for errors
- Verify tables exist and have data
- Check network connectivity

## 📊 Migration Checklist

- [ ] Supabase project created
- [ ] Environment variables set
- [ ] Database schema created
- [ ] Mock data seeded
- [ ] Company store updated
- [ ] User store updated
- [ ] Project store updated
- [ ] Task store updated
- [ ] Components updated to fetch data
- [ ] App tested and working
- [ ] Data persistence verified
- [ ] Real-time updates working

## 🎯 Next Steps

After successful migration:

1. **Set up Authentication**: Implement Supabase Auth
2. **Add Real-time**: Enable real-time subscriptions
3. **Optimize Queries**: Add indexes and optimize performance
4. **Add Backup**: Set up automated backups
5. **Monitor**: Set up monitoring and alerts

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

---

**Need Help?** Check the troubleshooting section or refer to the Supabase documentation.

