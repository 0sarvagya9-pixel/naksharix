# Naksharix Mobile App

Production Android Play Store setup for the Naksharix mobile app using React Native, Expo, and EAS Build.

## App Details

- App name: Naksharix
- Android package name: `com.naksharix.app`
- Expo slug: `naksharix`
- Version: `1.0.0`
- Android versionCode: `5`
- Expo SDK: `54`
- React Native: `0.81.5`
- React: `19.1.0`
- Privacy policy placeholder: `https://naksharix.com/privacy`
- Production API URL: `https://naksharix.com`
- Expo config schema: SDK 54 compatible, no deprecated `privacy` field

## Files

- `app.json`: Expo app identity, Android package, icons, splash screen, permissions, and Play Store metadata.
- `eas.json`: EAS build profiles. Android profiles use the Expo SDK 54 build image, and the `production` profile uses `android.buildType: "app-bundle"` for Play Store AAB output.
- `.env.example`: Optional public runtime values for API, Razorpay placeholder key, and AdSense placeholder ID.
- `assets/`: Play Store ready icon, adaptive icon, favicon, and splash placeholders.

## Install

```bash
cd mobile-app
npm install
npm run expo:fix
```

## Local Preview

```bash
npm run start
npm run android
```

## Production AAB Build

Log in and initialize EAS once per Expo account/project:

```bash
cd mobile-app
npm install
npm run expo:fix
npx eas-cli login
npx eas-cli init
```

Then generate the Play Store AAB with the exact production command:

```bash
eas build -p android --profile production
```

The `production` profile is configured with:

```json
"android": {
  "buildType": "app-bundle"
}
```

## Environment Variables

Copy `.env.example` to `.env` for local mobile development:

```bash
cp .env.example .env
```

Required for production API routing:

```bash
EXPO_PUBLIC_API_URL=https://naksharix.com
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://naksharix.com/privacy
```

Optional future activation variables are intentionally not included as empty values in `eas.json`, because EAS rejects empty env values in build profiles. Keep them in local `.env` only when testing, or create EAS secrets later when you have real/test IDs:

```bash
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
EXPO_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx
```

If these variables are missing, the app falls back safely: payment buttons remain visible but disabled with `Payments are coming soon`, ads are hidden, and the production AAB build still works.

## Razorpay Activation Later

1. Create or open your Razorpay account.
2. Use test keys first.
3. Add the public key to mobile env or EAS secrets:

```bash
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

4. Add server-side Razorpay secrets only in the Naksharix web/API deployment, not inside the mobile app:

```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_server_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

5. Add server keys in Vercel under Project Settings > Environment Variables.
6. Rebuild the mobile app with:

```bash
eas build -p android --profile production
```

Until `EXPO_PUBLIC_RAZORPAY_KEY_ID` is set, payment buttons stay visible but disabled with: `Payments are coming soon`.

## Google AdSense Placeholder Activation Later

The app includes a reusable placeholder component that renders nothing unless an ID exists. For native mobile monetization, Google AdMob is usually the production choice; this placeholder is kept for future webview/PWA/approved ad integration alignment.

To enable the placeholder later:

```bash
EXPO_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx
```

Add the value in EAS project environment variables or your local `.env`. Do not add it as an empty string in `eas.json`. If it is missing, ads are hidden and builds continue normally.

## EAS Environment Variables

You can add mobile env values in the Expo/EAS dashboard or with CLI secrets after you have real/test values. Do not create empty EAS secrets and do not put empty optional monetization keys in `eas.json`:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://naksharix.com
eas secret:create --scope project --name EXPO_PUBLIC_RAZORPAY_KEY_ID --value rzp_test_xxxxxxxxxxxxx
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_ADSENSE_ID --value ca-pub-xxxxxxxxxxxxxxxx
```

Do not put private API keys, Gemini keys, Razorpay secret keys, or database URLs in the mobile app. Keep those on the Naksharix backend/Vercel environment only.

## Dependency Alignment Notes

This project is aligned to Expo SDK 54, React Native 0.81.5, React 19.1.0, and Expo-managed native modules. It intentionally does not pin `expo-modules-core` directly. Expo installs the compatible `expo-modules-core`, Android Gradle plugin, and autolinking packages for the selected SDK.

If EAS reports Gradle errors from `expo-modules-core`, run:

```bash
npm install
npm run expo:fix
npx expo-doctor
npx tsc --noEmit
eas build -p android --profile production
```

Do not add a manual `expo-modules-core` version unless Expo support specifically asks for it.

## EAS Cloud Gradle Compatibility

The Android production profile pins the EAS build image to `sdk-54`. Keep this in place for Expo SDK 54 so EAS cloud uses the matching Android Gradle plugin, Gradle, React Native, and Expo Modules toolchain.

On Windows, `eas build:inspect -s pre-build` can stop with `Android builds are supported only on Linux and macOS` because that command uses the local build plugin. That is a local inspection limitation, not the cloud Gradle failure. Use the cloud build command for the real Play Store AAB build:

```bash
eas build -p android --profile production
```
## Play Store Checklist

- Replace placeholder privacy policy page with a complete production privacy policy.
- Upload real brand icon and splash assets if the generated placeholders are not final.
- Run `npm run expo:fix`, `npx expo-doctor`, and `npx tsc --noEmit` before release.
- Run `eas build -p android --profile production`.
- Download the generated `.aab` from Expo.
- Upload the `.aab` to Play Console internal testing first.
- Confirm package name remains `com.naksharix.app`; it cannot be changed after Play Store release.

