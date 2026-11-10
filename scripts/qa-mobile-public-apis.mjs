import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const horoscope=read("app/api/mobile/horoscope/route.ts");
const catalogue=read("app/api/mobile/catalogue/route.ts");
assert.ok(horoscope.includes('export async function GET(') &&
  horoscope.includes("allowedSigns.has(parsed.data.zodiac)") &&
  horoscope.includes('rateLimitResponse("mobile-horoscope"') &&
  horoscope.includes('period==="yearly" ? "yearly-2026" : period') &&
  !horoscope.includes("getCurrentUser") &&
  !horoscope.includes("birthDetails") &&
  !horoscope.includes("POST("),
  "Public native horoscope must validate sign/period, rate limit, and avoid personal data");
assert.ok(catalogue.includes('export async function GET(') &&
  catalogue.includes('rateLimitResponse("native-mobile-catalogue"') &&
  catalogue.includes('product.status==="active"') &&
  catalogue.includes("!shop.storageReady") &&
  catalogue.includes("getPublishedPujaOffers()") &&
  catalogue.includes("curatedPujaIds") &&
  catalogue.includes("getPublishedManualReportOffers()") &&
  catalogue.includes('bookingConfirmed:false') &&
  catalogue.includes('purchaseInApp:false') &&
  !catalogue.includes("prisma.") && !catalogue.includes("shopOrder.create"),
  "Native catalogues must use published authoritative fields and cannot claim bookings/payments");
console.log("NAKSHARIX_ANDROID_PUBLIC_API_CONTRACT=PASS;PRIVATE_DATA=NO;CHECKOUT_NATIVE=OFF");
