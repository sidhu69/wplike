
# GitHub Actions - Android APK Build

This workflow automatically builds an Android APK when you push to GitHub.

## How It Works

1. **Trigger**: Runs on push to `main` or `master` branch, or manually via workflow_dispatch
2. **Build Process**:
   - Checks out your code
   - Sets up Node.js 20 and Java 17
   - Installs dependencies
   - Builds the web app with Vite
   - Initializes Capacitor Android platform
   - Builds the APK

3. **Download APK**:
   - Go to **Actions** tab in GitHub
   - Click on the latest successful workflow run
   - Scroll to **Artifacts** section
   - Download `app-debug-apk`

## Customization

### Change App Name/ID
Edit `capacitor.config.ts`:
```typescript
appId: 'com.yourcompany.yourapp',
appName: 'YourAppName',
```

### Build Signed Release APK
You'll need to:
1. Generate a keystore file
2. Add GitHub secrets: `KEYSTORE_FILE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`
3. Update workflow to use `assembleRelease`

### Update App Icons
After first build, customize icons in:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`

## First Time Setup

After creating these files:

1. **Commit to GitHub**:
   ```bash
   git add .
   git commit -m "Add Android build workflow"
   git push origin main
   ```

2. **Wait for Build**:
   - GitHub Actions will automatically run
   - Check progress in the Actions tab
   - Build takes ~5-10 minutes

3. **Download APK**:
   - Go to completed workflow run
   - Download artifact
   - Install on Android device

## Testing Locally (Optional)

If you want to test before pushing:
```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Then build in Android Studio.
