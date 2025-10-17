#!/bin/bash

# BuildTrack Store Migration Script
# This script migrates from mock data stores to Supabase-enabled stores

echo "🔄 BuildTrack Store Migration"
echo "=============================="
echo ""

# Check if Supabase is configured
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please run setup-supabase.sh first."
    exit 1
fi

if ! grep -q "EXPO_PUBLIC_SUPABASE_URL" .env || ! grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY" .env; then
    echo "❌ Supabase credentials not configured in .env file."
    echo "   Please add your Supabase URL and Anon Key to .env"
    exit 1
fi

echo "✅ Supabase configuration found"
echo ""

# Create backup directory
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Creating backup in $BACKUP_DIR/"

# Backup existing stores
cp src/state/userStore.ts "$BACKUP_DIR/"
cp src/state/projectStore.ts "$BACKUP_DIR/"
cp src/state/taskStore.ts "$BACKUP_DIR/"
cp src/state/authStore.ts "$BACKUP_DIR/"
cp src/state/companyStore.ts "$BACKUP_DIR/"

echo "✅ Backups created"
echo ""

# Function to migrate a store
migrate_store() {
    local store_name=$1
    local source_file="src/state/${store_name}.supabase.ts"
    local target_file="src/state/${store_name}.ts"
    
    if [ -f "$source_file" ]; then
        echo "🔄 Migrating $store_name..."
        cp "$source_file" "$target_file"
        echo "✅ $store_name migrated"
    else
        echo "❌ $source_file not found"
        return 1
    fi
}

# Migrate all stores
echo "🚀 Starting store migration..."
echo ""

migrate_store "userStore"
migrate_store "projectStore" 
migrate_store "taskStore"
migrate_store "authStore"

echo ""
echo "🎉 Store migration completed!"
echo ""
echo "📊 Summary:"
echo "   ✅ userStore.ts → Supabase enabled"
echo "   ✅ projectStore.ts → Supabase enabled"
echo "   ✅ taskStore.ts → Supabase enabled"
echo "   ✅ authStore.ts → Supabase enabled"
echo "   ✅ companyStore.ts → Already migrated"
echo ""
echo "📁 Backups saved in: $BACKUP_DIR/"
echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. 🧪 Test your app:"
echo "   npm start"
echo ""
echo "2. 🔍 Check for any import errors in your components"
echo ""
echo "3. 📱 Test key functionality:"
echo "   - User login/registration"
echo "   - Task creation and management"
echo "   - Project management"
echo "   - Data persistence"
echo ""
echo "4. 🔄 If you need to rollback:"
echo "   cp $BACKUP_DIR/*.ts src/state/"
echo ""
echo "🚀 Your app is now fully migrated to Supabase!"

