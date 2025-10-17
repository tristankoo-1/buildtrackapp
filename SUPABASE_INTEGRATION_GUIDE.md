# 🗄️ Supabase Integration Guide for BuildTrack

## Overview
This guide walks you through integrating Supabase as the backend database for BuildTrack, replacing the current mock data with real-time cloud storage.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Database Schema](#database-schema)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Implementation](#implementation)
7. [Migration Strategy](#migration-strategy)
8. [Testing](#testing)

---

## 1️⃣ Prerequisites

### What You'll Need:
- ✅ Supabase account (free tier works!)
- ✅ Email for Supabase signup
- ✅ This BuildTrack app
- ✅ Internet connection

### Sign Up for Supabase:
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub, Google, or Email
4. Create a new organization (e.g., "BuildTrack")
5. Create a new project (e.g., "buildtrack-production")

### Important Info to Save:
After creating project, you'll get:
- **Project URL**: `https://xxxxx.supabase.co`
- **API Key (anon public)**: `eyJhbGc...` (public, safe for client)
- **Service Role Key**: `eyJhbGc...` (SECRET, never expose)

---

## 2️⃣ Supabase Setup

### A. Create Database Tables

Go to your Supabase project → SQL Editor → New Query

Copy and paste this schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies Table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('general_contractor', 'subcontractor', 'supplier', 'consultant', 'owner')),
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo TEXT,
  tax_id TEXT,
  license_number TEXT,
  insurance_expiry TIMESTAMPTZ,
  banner JSONB DEFAULT '{"text":"","backgroundColor":"#3b82f6","textColor":"#ffffff","isVisible":true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  is_active BOOLEAN DEFAULT true
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'worker')),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  budget NUMERIC,
  location JSONB NOT NULL,
  client_info JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Project Assignments Table
CREATE TABLE user_project_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('lead_project_manager', 'contractor', 'subcontractor', 'inspector', 'architect', 'engineer', 'worker', 'foreman')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, project_id, category)
);

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('safety', 'electrical', 'plumbing', 'structural', 'general', 'materials')),
  due_date TIMESTAMPTZ NOT NULL,
  current_status TEXT NOT NULL CHECK (current_status IN ('not_started', 'in_progress', 'blocked', 'completed')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  assigned_to UUID[] NOT NULL,
  assigned_by UUID REFERENCES users(id),
  location JSONB,
  attachments TEXT[] DEFAULT '{}',
  accepted BOOLEAN DEFAULT false,
  decline_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sub Tasks Table
CREATE TABLE sub_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  parent_sub_task_id UUID REFERENCES sub_tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('safety', 'electrical', 'plumbing', 'structural', 'general', 'materials')),
  due_date TIMESTAMPTZ NOT NULL,
  current_status TEXT NOT NULL CHECK (current_status IN ('not_started', 'in_progress', 'blocked', 'completed')),
  completion_percentage INTEGER DEFAULT 0,
  assigned_to UUID[] NOT NULL,
  assigned_by UUID REFERENCES users(id),
  location JSONB,
  attachments TEXT[] DEFAULT '{}',
  accepted BOOLEAN DEFAULT false,
  decline_reason TEXT,
  original_assigned_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Updates Table
CREATE TABLE task_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  sub_task_id UUID REFERENCES sub_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  description TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  completion_percentage INTEGER,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'blocked', 'completed')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Delegation History Table
CREATE TABLE delegation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  sub_task_id UUID REFERENCES sub_tasks(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Project Invitations Table
CREATE TABLE project_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES users(id),
  invited_by_company_id UUID REFERENCES companies(id),
  invitee_email TEXT,
  invitee_phone TEXT,
  invitee_user_id UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  proposed_category TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  decline_reason TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX idx_sub_tasks_parent_task_id ON sub_tasks(parent_task_id);
CREATE INDEX idx_sub_tasks_project_id ON sub_tasks(project_id);
CREATE INDEX idx_user_project_assignments_user_id ON user_project_assignments(user_id);
CREATE INDEX idx_user_project_assignments_project_id ON user_project_assignments(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic - you'll want to customize these)
-- Allow authenticated users to read their company data
CREATE POLICY "Users can view their company data" ON companies
  FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE company_id = companies.id));

CREATE POLICY "Users can view users in their company" ON users
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- More policies needed for INSERT, UPDATE, DELETE operations
```

Click **RUN** to execute the schema.

---

## 3️⃣ Database Schema

### Tables Created:
1. **companies** - Company information and branding
2. **users** - User accounts (linked to auth)
3. **projects** - Construction projects
4. **user_project_assignments** - User roles per project
5. **tasks** - Main tasks
6. **sub_tasks** - Nested sub-tasks
7. **task_updates** - Task progress updates
8. **delegation_history** - Task delegation tracking
9. **project_invitations** - Project invitation system

### Key Features:
- ✅ UUIDs for all IDs (better than incremental)
- ✅ JSONB for flexible data (location, client_info, banner)
- ✅ Array types for assigned_to, attachments
- ✅ Timestamps with timezone
- ✅ Foreign keys with CASCADE delete
- ✅ Check constraints for enums
- ✅ Indexes for performance
- ✅ Row Level Security enabled

---

## 4️⃣ Installation

### Install Supabase Client

```bash
cd /home/user/workspace
bun add @supabase/supabase-js
```

### Verify Installation

```bash
bun list | grep supabase
# Should show: @supabase/supabase-js@x.x.x
```

---

## 5️⃣ Configuration

### A. Create Environment Variables

Update your `.env` file:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Your actual values from Supabase dashboard
```

⚠️ **IMPORTANT**: 
- Use `EXPO_PUBLIC_` prefix for Expo to expose these
- NEVER commit `.env` to git
- `.env` is already in `.gitignore`

### B. Create Supabase Client

Create new file: `/src/api/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please check your .env file has EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 6️⃣ Implementation

### Phase 1: Authentication (Recommended First Step)

Supabase provides built-in authentication. Update your auth store:

```typescript
// src/state/authStore.ts (updated)
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../api/supabase";
import { User } from "../types/buildtrack";

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  
  // Methods
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,

      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // Fetch user data from database
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            set({ session, user: userData });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Fetch full user data
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          set({ session: data.session, user: userData });
        } catch (error: any) {
          console.error('Login error:', error);
          throw new Error(error.message || 'Login failed');
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
      },

      signUp: async (email: string, password: string, userData: Partial<User>) => {
        set({ isLoading: true });
        try {
          // Create auth user
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          // Create user record in database
          const { data: newUser, error: dbError } = await supabase
            .from('users')
            .insert({
              id: data.user!.id,
              email,
              ...userData,
            })
            .select()
            .single();

          if (dbError) throw dbError;

          set({ session: data.session, user: newUser });
        } catch (error: any) {
          console.error('Signup error:', error);
          throw new Error(error.message || 'Signup failed');
        } finally {
          set({ isLoading: false });
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "buildtrack-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

### Phase 2: Data Stores

Update each store to use Supabase instead of mock data.

**Example: CompanyStore**

```typescript
// src/state/companyStore.ts (updated)
import { create } from "zustand";
import { supabase } from "../api/supabase";
import { Company } from "../types/buildtrack";

interface CompanyStore {
  companies: Company[];
  isLoading: boolean;

  // Methods
  fetchCompanies: () => Promise<void>;
  getCompanyById: (id: string) => Company | undefined;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  updateCompanyBanner: (companyId: string, banner: Company['banner']) => Promise<void>;
  getCompanyBanner: (companyId: string) => Company['banner'] | undefined;
}

export const useCompanyStore = create<CompanyStore>()((set, get) => ({
  companies: [],
  isLoading: false,

  fetchCompanies: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      set({ companies: data || [] });
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  getCompanyById: (id) => {
    return get().companies.find(company => company.id === id);
  },

  updateCompany: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set(state => ({
        companies: state.companies.map(company =>
          company.id === id ? { ...company, ...updates } : company
        )
      }));
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  updateCompanyBanner: async (companyId, banner) => {
    await get().updateCompany(companyId, { banner });
  },

  getCompanyBanner: (companyId) => {
    const company = get().getCompanyById(companyId);
    return company?.banner;
  },
}));
```

---

## 7️⃣ Migration Strategy

### Step-by-Step Migration:

#### Step 1: Keep Mock Data (Parallel Development)
- Don't remove mock data yet
- Add Supabase alongside existing code
- Use feature flag to switch between mock/real data

```typescript
// src/config/featureFlags.ts
export const USE_SUPABASE = process.env.EXPO_PUBLIC_USE_SUPABASE === 'true';
```

#### Step 2: Seed Initial Data
Create a script to populate Supabase with your mock data:

```typescript
// scripts/seedDatabase.ts
import { supabase } from '../src/api/supabase';
import { MOCK_COMPANIES } from '../src/state/mockData';

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Insert companies
  for (const company of MOCK_COMPANIES) {
    const { error } = await supabase
      .from('companies')
      .insert(company);
    
    if (error) console.error('Error inserting company:', error);
  }

  console.log('✅ Database seeded!');
}

seedDatabase();
```

#### Step 3: Test Each Store Individually
1. Start with CompanyStore
2. Then UserStore
3. Then ProjectStore
4. Finally TaskStore

#### Step 4: Enable Real-Time Updates (Optional)
```typescript
// Listen to changes
supabase
  .channel('tasks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks'
  }, (payload) => {
    console.log('Task changed:', payload);
    // Update local state
  })
  .subscribe();
```

---

## 8️⃣ Testing

### Test Checklist:

#### Authentication:
- [ ] User can sign up
- [ ] User can log in
- [ ] User can log out
- [ ] Session persists on app reload
- [ ] Auth errors handled properly

#### Data Operations:
- [ ] Fetch companies
- [ ] Fetch users by company
- [ ] Create project
- [ ] Assign users to projects
- [ ] Create tasks
- [ ] Update task status
- [ ] Create subtasks
- [ ] Add task updates

#### Real-Time:
- [ ] Changes reflect across devices
- [ ] Banner updates appear immediately
- [ ] Task status updates in real-time

---

## 🔒 Security Best Practices

### Row Level Security (RLS) Policies:

```sql
-- Example: Users can only see projects they're assigned to
CREATE POLICY "Users can view assigned projects" ON projects
  FOR SELECT USING (
    id IN (
      SELECT project_id FROM user_project_assignments
      WHERE user_id = auth.uid()
    )
  );

-- Admins can see all projects in their company
CREATE POLICY "Admins can view company projects" ON projects
  FOR SELECT USING (
    created_by IN (
      SELECT id FROM users 
      WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
      AND role = 'admin'
    )
  );
```

### Environment Variables:
- ✅ Use `EXPO_PUBLIC_` prefix for client-side vars
- ✅ Never commit `.env` to git
- ✅ Use different projects for dev/staging/production
- ✅ Rotate API keys regularly

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

## 🎯 Next Steps

1. Create Supabase account
2. Run the SQL schema
3. Install `@supabase/supabase-js`
4. Add environment variables
5. Create supabase client
6. Update auth store
7. Test login/signup
8. Migrate other stores one by one
9. Test thoroughly
10. Remove mock data

---

**Ready to start?** Follow Step 1 (Prerequisites) and create your Supabase account!
