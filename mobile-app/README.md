# Naksharix Android — Native V2 (Expo SDK 54)

**Status:** Native client source and Android Hermes bundle are being verified. No signed AAB/APK or on-device acceptance is claimed until EAS credentials and device tests pass.

## Native experiences

- Five-tab Android navigation: Home, Rashifal, Panchang, Explore, Account; system Back support and accessible touch targets.
- Horoscope: 12 zodiac signs with daily, weekly, monthly and 2026 yearly content from validated read-only `/api/mobile/horoscope`.
- Panchang: six Indian city presets, change date and get real server-calculated tithi, nakshatra, sunrise/sunset and timings via `/api/panchang`. No location permission requested.
- Explore: authoritative published Shop/Puja/Report catalogue via `/api/mobile/catalogue` and festival dates from `/api/puja/calendar`; no invented product availability or confirmed ceremonies.
- Numerology: birth number and life-path calculation fully offline. Input is never transmitted or stored.
- Secure login, customer dashboard, reports and checkout open HTTPS `www.naksharix.com` in the platform browser. Never store login tokens or payment credentials locally.

## Supported build / smoke checks

```
cd mobile-app
npm ci
npm run qa:native
npx expo export --platform android --output-dir ../.tmp-android-export
# Production Play Store bundle (requires authorized Expo EAS account):
npx eas-cli build -p android --profile production --non-interactive
```

Server-side contracts run from the repository root:

```
node scripts/qa-mobile-public-apis.mjs
node scripts/qa-mobile-native-v2.mjs
node scripts/qa-mobile-native.mjs
```

## Identity, privacy and release gates

- Expo project: `0cadd797-361c-44a4-8b19-8cd15c9f3f44`; package: `com.naksharix.app`.
- Application version `1.1.0`, Android versionCode `7`. Production profile creates an Android App Bundle (AAB); preview profile creates an internal APK.
- No unnecessary photo, camera, background location, media or push-notification permissions.
- Public data endpoints use GET, input validation, rate limits and no-store. On outage screens fail closed with a retry control.
- APK/AAB signing, Google Play upload, device login, purchases and notification/permission checks need real-device/connected EAS acceptance. Mobile code cannot make Google AdSense approval or database backup verification succeed.
- Digital purchases, if later sold inside a Play Store Android app, need a separate Google Play Billing policy review. Current app does not collect native payments.
