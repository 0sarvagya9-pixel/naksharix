import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");
const app=read("mobile-app/App.tsx");
const home=read("mobile-app/src/screens/HomeScreen.tsx");
const number=read("mobile-app/src/native/NumerologyScreen.tsx");
const horizon=read("mobile-app/src/screens/HoroscopeScreen.tsx");
const panchang=read("mobile-app/src/screens/PanchangScreen.tsx");
const explore=read("mobile-app/src/screens/ExploreScreen.tsx");
const account=read("mobile-app/src/screens/AccountScreen.tsx");
const api=read("mobile-app/src/config/api.ts");
const env=read("mobile-app/src/config/env.ts");
assert.ok(app.includes("SafeAreaProvider")&&app.includes('screen === "numerology"')&&
  app.includes('accessibilityRole="tab"')&&app.includes("BackHandler.addEventListener"),
  "Android must provide native five-tab navigation and platform Back support");
for(const name of ["HoroscopeScreen","PanchangScreen","ExploreScreen","AccountScreen","NumerologyScreen"])
  assert.ok(app.includes(name),"Missing native feature screen "+name);
assert.ok(home.includes('onNavigate("horoscope")')&&
  home.includes("onNavigate(tile.target)")&&home.includes("assets/icon.png"),
  "Home must navigate natively rather than only link to a website");
assert.ok(horizon.includes('getPublicData<Horoscope>')&&
  horizon.includes("controller.abort()")&&horizon.includes("zodiacSigns.map"),
  "Live horoscope must load server content, handle cancellation and list the signs");
assert.ok(panchang.includes('getPublicData<{panchang:Panchang}>')&&
  panchang.includes("timezone=%2B05%3A30")&&panchang.includes("setDate")&&
  panchang.includes("No device location permission"),
  "Native Panchang must use validated existing API and location-specific data");
assert.ok(explore.includes('getPublicData<MobileCatalogue>')&&
  explore.includes('getPublicData<CalendarFeed>')&&
  explore.includes("items.events.filter(")&&explore.includes("items.bookingAvailable!==false")&&
  explore.includes("priceLabel")&&explore.includes("bookingConfirmed"),
  "Catalogues and festival dates must load authoritative public feeds without claiming fulfilment");
assert.ok(explore.includes('mode!=="reports"?<Pressable') &&
  explore.includes('Digital report checkout is not offered') &&
  explore.includes('mode!=="reports"?<Pressable style={S.mutedButton}'),
  "Android must not steer digital report users to external checkout instead of Play Billing");
assert.ok(number.includes("Nothing you enter is transmitted or saved.")&&
  !/fetch\(|secureFetch\(|axios|AsyncStorage/.test(number),
  "Offline numerology must never transmit birth data");
assert.ok(account.includes('open("/login")')&&
  account.includes("tokens are never collected or stored"),
  "Login remains on secure official website without embedding tokens in app");
assert.ok(api.includes("AbortController")&&api.includes('method:"GET"')&&
  api.includes('cache:"no-store"')&&env.includes('url.startsWith("https://")'),
  "Native API client must stay GET-only and HTTPS");
const workflow=read(".github/workflows/android-native-build.yml");
const config=JSON.parse(read("mobile-app/app.json"));
assert.equal(config.expo.android.versionCode,7);
assert.equal(config.expo.version,"1.1.0");
assert.ok(!config.expo.android.permissions.includes("POST_NOTIFICATIONS"),"No unused notification permission");
assert.ok(workflow.includes("assembleRelease") &&
  workflow.includes("npx expo prebuild --platform android --clean --no-install") &&
  workflow.includes("upload-artifact@v4") &&
  workflow.includes("app-release.apk") &&
  workflow.includes("npx expo export --platform android") &&
  workflow.includes("npm run qa:native"),
  "CI must build a standalone internal APK and independently validate the Hermes native bundle");
console.log("NAKSHARIX_NATIVE_ANDROID_V2_CONTRACT=PASS;FIVE_TABS=YES;SERVER_READONLY=YES;OFFLINE_NUMEROLOGY=PASS;INAPP_PAYMENTS=NO");
