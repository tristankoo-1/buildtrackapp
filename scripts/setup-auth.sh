#!/bin/bash

# Automated Supabase Setup Script
# This script sets up all authentication users automatically

echo "🚀 Starting automated Supabase setup..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js or run the setup manually through the Supabase dashboard"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "Please create a .env file with your Supabase credentials"
    exit 1
fi

# Check if Supabase credentials are set
if ! grep -q "EXPO_PUBLIC_SUPABASE_URL" .env || ! grep -q "SUPABASE_SERVICE_ROLE_KEY" .env; then
    echo "❌ Missing Supabase credentials in .env file"
    echo "Please add EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file"
    exit 1
fi

# Run the automated setup
echo "📋 Running automated setup script..."
node scripts/automated-setup.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "📱 You can now test login in your app with any of the 6 users"
    echo "🔐 All users use password: password123"
else
    echo ""
    echo "❌ Setup failed. Please check the error messages above."
    exit 1
fi

