#!/bin/bash

# Quick script to update Supabase database constraints
# This script will update the task status constraints to allow 'rejected' instead of 'blocked'

echo "🔄 Updating Supabase database constraints..."

# Supabase configuration
SUPABASE_URL="https://zusulknbhaumougqckec.supabase.co"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1c3Vsa25iaGF1bW91Z3Fja2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MjQ3NzIsImV4cCI6MjA3NjAwMDc3Mn0.MllamzveYfgR0hH1G-1-qv-E7wjMkhzjH8MhWnO-cIA"

# SQL commands to update constraints
SQL_COMMANDS=(
  "ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_current_status_check;"
  "ALTER TABLE tasks ADD CONSTRAINT tasks_current_status_check CHECK (current_status IN ('not_started', 'in_progress', 'rejected', 'completed'));"
  "ALTER TABLE sub_tasks DROP CONSTRAINT IF EXISTS sub_tasks_current_status_check;"
  "ALTER TABLE sub_tasks ADD CONSTRAINT sub_tasks_current_status_check CHECK (current_status IN ('not_started', 'in_progress', 'rejected', 'completed'));"
  "ALTER TABLE task_updates DROP CONSTRAINT IF EXISTS task_updates_status_check;"
  "ALTER TABLE task_updates ADD CONSTRAINT task_updates_status_check CHECK (status IN ('not_started', 'in_progress', 'rejected', 'completed'));"
)

echo "📝 Executing SQL commands..."

for sql in "${SQL_COMMANDS[@]}"; do
  echo "Executing: $sql"
  
  response=$(curl -s -X POST \
    "$SUPABASE_URL/rest/v1/rpc/exec" \
    -H "apikey: $API_KEY" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"$sql\"}")
  
  if echo "$response" | grep -q "error"; then
    echo "❌ Error executing SQL: $response"
  else
    echo "✅ Success"
  fi
done

echo "🎉 Database constraints updated!"
echo ""
echo "You can now test the 'rejected' status functionality."
