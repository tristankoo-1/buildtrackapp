# 🔄 Store Migration Guide

This guide will help you migrate all your Zustand stores from mock data to Supabase-enabled stores.

## 📋 Migration Overview

### **Stores to Migrate:**
- ✅ **companyStore.ts** - Already migrated
- 🔄 **userStore.ts** - Ready to migrate
- 🔄 **projectStore.ts** - Ready to migrate  
- 🔄 **taskStore.ts** - Ready to migrate
- 🔄 **authStore.ts** - Ready to migrate

### **Migration Files Created:**
- `src/state/userStore.supabase.ts` - Supabase-enabled user store
- `src/state/projectStore.supabase.ts` - Supabase-enabled project store
- `src/state/taskStore.supabase.ts` - Supabase-enabled task store
- `src/state/authStore.supabase.ts` - Supabase-enabled auth store
- `scripts/migrate-stores.sh` - Automated migration script

## 🚀 Quick Migration (Recommended)

### **Step 1: Run Migration Script**
```bash
./scripts/migrate-stores.sh
```

This script will:
- ✅ Check Supabase configuration
- 📁 Create backups of existing stores
- 🔄 Replace stores with Supabase versions
- 📊 Show migration summary

### **Step 2: Test Your App**
```bash
npm start
```

## 🔧 Manual Migration (Alternative)

If you prefer to migrate manually:

### **Step 1: Backup Existing Stores**
```bash
mkdir backup-$(date +%Y%m%d-%H%M%S)
cp src/state/*Store.ts backup-*/
```

### **Step 2: Replace Each Store**
```bash
# Replace user store
cp src/state/userStore.supabase.ts src/state/userStore.ts

# Replace project store  
cp src/state/projectStore.supabase.ts src/state/projectStore.ts

# Replace task store
cp src/state/taskStore.supabase.ts src/state/taskStore.ts

# Replace auth store
cp src/state/authStore.supabase.ts src/state/authStore.ts
```

## 📊 Store Features Comparison

| Feature | Mock Store | Supabase Store |
|---------|------------|----------------|
| **Data Persistence** | Local only | Database + Local cache |
| **Multi-device Sync** | ❌ | ✅ |
| **Real-time Updates** | ❌ | ✅ (with subscriptions) |
| **Offline Support** | ✅ | ✅ (cached data) |
| **User Authentication** | Mock | Supabase Auth |
| **Data Validation** | Basic | Database constraints |
| **Scalability** | Limited | Production ready |

## 🔍 Key Changes in Supabase Stores

### **1. New Methods Added**
Each store now includes:
- `fetch*()` methods to load data from Supabase
- `error` state for handling API errors
- Automatic fallback to mock data if Supabase unavailable

### **2. Hybrid Approach**
- **Supabase when configured** - Full database functionality
- **Mock data fallback** - Works offline if Supabase unavailable
- **Seamless transition** - No breaking changes to existing code

### **3. Enhanced Error Handling**
- Network error handling
- Graceful degradation
- User-friendly error messages

## 🧪 Testing Your Migration

### **Test Checklist:**

#### **1. Authentication**
- [ ] User login works
- [ ] User registration works
- [ ] Logout works
- [ ] User data persists across app restarts

#### **2. Data Loading**
- [ ] Companies load from Supabase
- [ ] Users load from Supabase
- [ ] Projects load from Supabase
- [ ] Tasks load from Supabase

#### **3. Data Operations**
- [ ] Create new tasks
- [ ] Update task progress
- [ ] Create new projects
- [ ] Assign users to projects

#### **4. Offline Behavior**
- [ ] App works without internet (cached data)
- [ ] Data syncs when connection restored

## 🔄 Rollback Instructions

If you need to rollback to mock stores:

### **Option 1: Use Backup**
```bash
# Find your backup directory
ls -la backup-*

# Restore from backup
cp backup-YYYYMMDD-HHMMSS/*.ts src/state/
```

### **Option 2: Manual Rollback**
```bash
# Restore original stores (if you have them)
git checkout HEAD -- src/state/userStore.ts
git checkout HEAD -- src/state/projectStore.ts
git checkout HEAD -- src/state/taskStore.ts
git checkout HEAD -- src/state/authStore.ts
```

## 🐛 Troubleshooting

### **Common Issues:**

#### **"Cannot find module" errors**
- Check that all imports are correct
- Restart your development server
- Clear Metro cache: `npx react-native start --reset-cache`

#### **"Supabase not configured" warnings**
- Check your `.env` file has correct credentials
- Restart your development server
- Verify Supabase project is active

#### **Data not loading**
- Check Supabase dashboard for errors
- Verify database schema is deployed
- Check network connectivity

#### **Authentication issues**
- Verify Supabase Auth is enabled
- Check email confirmation settings
- Review Supabase Auth logs

### **Debug Mode**
Enable debug logging by adding to your `.env`:
```bash
EXPO_PUBLIC_DEBUG=true
```

## 📈 Performance Optimization

### **After Migration:**

#### **1. Enable Real-time Subscriptions**
```typescript
// In your components
useEffect(() => {
  const subscription = supabase
    .channel('tasks')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'tasks' },
      () => {
        // Refresh tasks
        useTaskStore.getState().fetchTasks();
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

#### **2. Optimize Queries**
- Use specific field selection
- Add database indexes
- Implement pagination for large datasets

#### **3. Cache Management**
- Implement smart cache invalidation
- Use optimistic updates
- Add background sync

## 🎯 Next Steps

After successful migration:

1. **Enable Row Level Security** - Run `scripts/enable-rls.sql`
2. **Set up Real-time** - Add subscriptions for live updates
3. **Add Monitoring** - Set up Supabase monitoring
4. **Optimize Performance** - Add indexes and optimize queries
5. **Production Deployment** - Deploy to production environment

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

**Need Help?** Check the troubleshooting section or refer to the Supabase documentation.

