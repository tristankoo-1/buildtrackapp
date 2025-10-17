#!/bin/bash

# BuildTrack Supabase Setup Script
# This script helps you set up Supabase for the BuildTrack application

echo "🚀 BuildTrack Supabase Setup"
echo "=============================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Supabase Configuration
# Replace these with your actual Supabase project values
# Get these from: https://supabase.com/dashboard → Your Project → Settings → API

EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Example:
# EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2MDAwMCwiZXhwIjoyMDE0MzM2MDAwfQ.example-signature
EOF
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your actual Supabase credentials"
    echo "   Get them from: https://supabase.com/dashboard → Your Project → Settings → API"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if tsx is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js first"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install tsx

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. 📝 Edit .env file with your Supabase credentials:"
echo "   - EXPO_PUBLIC_SUPABASE_URL"
echo "   - EXPO_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo "2. 🗄️  Set up database schema:"
echo "   - Go to Supabase Dashboard → SQL Editor"
echo "   - Copy contents of scripts/database-schema.sql"
echo "   - Paste and run the SQL"
echo ""
echo "3. 🌱 Seed the database:"
echo "   npx tsx scripts/seedDatabase.ts"
echo ""
echo "4. 🚀 Start your app:"
echo "   npm start"
echo ""
echo "📚 For detailed instructions, see: SUPABASE_MIGRATION_GUIDE.md"
echo ""
echo "🎉 Setup complete! Follow the next steps above."

