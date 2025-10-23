# Expo Authentication Setup Guide

## Quick Setup (Required)

To fix the authentication error, you need to create a proper Expo access token:

### 1. Create Personal Access Token
1. Go to: https://expo.dev/settings/access-tokens
2. Click "Create" to generate a new personal access token
3. Copy the generated token

### 2. Set Environment Variable
Run this command with your actual token:
```bash
export EXPO_TOKEN='your_actual_token_from_expo_dashboard'
```

### 3. Start Development Server
```bash
./start-expo-authenticated.sh
```

## Alternative: Manual Setup

If you prefer to run commands manually:

```bash
# Set your token
export EXPO_TOKEN='your_actual_token_from_expo_dashboard'
export CI=1
export EXPO_NO_TELEMETRY=1

# Start web server
npx @expo/cli@latest start --web --clear

# In another terminal, start dev client
npx @expo/cli@latest start --dev-client --offline
```

## Important Notes

- **Security**: Treat your EXPO_TOKEN like a password - don't share it or commit it to version control
- **Token Management**: You can revoke tokens at any time from the Expo dashboard
- **CI Mode**: The `CI=1` environment variable enables non-interactive mode
- **Documentation**: Full details at https://docs.expo.dev/accounts/programmatic-access/

## Troubleshooting

If you still get authentication errors:
1. Verify your token is correct
2. Check that the token hasn't expired
3. Ensure you're using the full token (not truncated)
4. Try creating a new token if the current one doesn't work
