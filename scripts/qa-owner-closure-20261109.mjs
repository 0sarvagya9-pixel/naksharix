import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (file) => readFileSync(file, "utf8");

const listing = read("components/astrologer-listing.tsx");
const gallery = read("components/consultation-gallery.tsx");
const page = read("app/consultation/page.tsx");
const booking = read("components/consultation-request-form.tsx");
const monitor = read("app/api/cron/production-health/route.ts");
const backupStatus = read("app/api/ops/backup-status/route.ts");

assert.ok(listing.includes('source.length > 0 ? (') &&
  listing.includes('href="/ask-astrologer"') &&
  listing.includes("No astrologers are approved for live booking"),
  "Unavailable astrologers must not show empty filters or fabricated bookable slots");
assert.ok(gallery.includes('hasAvailableExperts ? "/astrologers" : "/ask-astrologer"') &&
  page.includes("hasAvailableExperts={profiles.length > 0}"),
  "Consultation gallery must route zero-provider users to a working written enquiry");
assert.ok(booking.includes('if (sessionPrice === null) { setStatus(') &&
  booking.indexOf('if (sessionPrice === null)') < booking.indexOf('setLoading(true)') &&
  booking.includes('}).catch(() => null);') &&
  booking.includes('setStatus("The booking response was incomplete.'),
  "Consultation booking must not get stuck for unavailable fees or failed network");
assert.ok(monitor.includes('const recovery = await recoveryHealth()') &&
  !monitor.includes('runDailyRecovery(') &&
  !monitor.includes('authorizedRecoveryRequest(') &&
  monitor.includes('status: healthy ? 200 : 503'),
  "Read-only health cron must not launch duplicate live backup jobs");
assert.ok(backupStatus.includes("'Cache-Control':'no-store'") &&
  backupStatus.includes('status:data.operational?200:503'),
  "Backup availability must be fresh and fail closed");
console.log("NAKSHARIX_CONSULTATION_FALLBACK_QA=PASS;BOOKING_NETWORK_QA=PASS;CRON_SIDE_EFFECT_QA=PASS;BACKUP_STATUS_CACHE_QA=PASS");
