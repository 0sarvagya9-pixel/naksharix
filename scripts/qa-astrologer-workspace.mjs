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
  theme.includes("prefers-reduced-motion") &&
  !theme.includes("body {") &&
  !theme.includes("html {"),
  "Astrologer theme should not change public website styling");

console.log("ASTROLOGER_WORKSPACE_QA=PASS;ROLE_GATE=PRESERVED;LEFT_SIDEBAR=RESPONSIVE;KPI_SCOPE=FULL_HISTORY;PUBLIC_THEME=UNCHANGED");
