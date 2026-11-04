import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = path => readFileSync(path, "utf8");
const nav = src("components/astrologer-navbar.tsx");
const shell = src("app/astrologer/layout.tsx");
const dashboard = src("app/astrologer/dashboard/page.tsx");
const theme = src("app/astrologer/portal.css");

for (const href of [
  "/astrologer/dashboard", "/astrologer/bookings/today",
  "/astrologer/bookings/upcoming", "/astrologer/requests",
  "/astrologer/completed", "/astrologer/availability",
  "/astrologer/report-generator", "/astrologer/profile",
  "/astrologer/reviews", "/astrologer/earnings", "/astrologer/payout"
]) {
  assert.ok(nav.includes(href), "Missing sidebar route " + href);
}
for (const token of [
  'aria-label="Astrologer portal sidebar"', 'aria-current={active ? "page"',
  'aria-controls="astrologer-side-navigation"', "aria-expanded={mobileOpen}",
  "Escape", "lg:sticky", "lg:translate-x-0", "setMobileOpen(false)"
]) assert.ok(nav.includes(token), "Missing responsive navigation guard " + token);

assert.ok(shell.includes("getCurrentUser()") &&
  shell.includes('["ASTROLOGER", "CONSULTANT"].includes(effectiveRole)') &&
  shell.includes('redirect("/dashboard")') &&
  shell.includes("robots: { index: false, follow: false }") &&
  shell.includes('<div className="min-w-0 w-full flex-1">'),
  "Sidebar layout must retain owner-only role gate and a responsive content column");

assert.ok(dashboard.includes("prisma.consultationBooking.count(") &&
  dashboard.includes("prisma.consultationBooking.aggregate(") &&
  dashboard.includes("where: { ...bookingScope, status:") &&
  !dashboard.includes("acceptedBookings = bookings.filter(") &&
  !dashboard.includes("totalEarnings = bookings"),
  "Metrics must derive from complete authorized booking history, not 8 visible rows");

assert.ok(theme.includes(".astrologer-portal .glass") &&
  theme.includes(".astrologer-portal .star-field") &&
  theme.includes("background: linear-gradient(160deg, #153b5b 0%, #0b2845 100%) !important") &&
  theme.includes("color: #f5f8fc !important") &&
  theme.includes(".astrologer-portal .nx-portal-action") &&
  dashboard.includes('className="nx-portal-action"') &&
  theme.includes("prefers-reduced-motion") &&
  !theme.includes("body {") &&
  !theme.includes("html {"),
  "Astrologer theme must defeat inline white Card styles, keep CTA legible, and leave public pages unchanged");

console.log("ASTROLOGER_WORKSPACE_QA=PASS;ROLE_GATE=PRESERVED;LEFT_SIDEBAR=RESPONSIVE;KPI_SCOPE=FULL_HISTORY;PUBLIC_THEME=UNCHANGED");
