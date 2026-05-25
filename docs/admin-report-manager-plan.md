# Admin Report Manager Plan

## Current Status

Admin protection exists through `app/admin/layout.tsx`. Admin report request listing and detail surfaces exist, but editing/status transitions are not a complete workflow.

## Safe Next Steps

- Add admin report request list page if not already visible in the UI.
- Add status transition API after enum/status mapping is finalized.
- Add admin notes field through a safe migration.
- Add audit log entries for every status change.
- Add filters by status, plan type, payment status, and date.

## Not In Scope

- Shop manager.
- Consultation manager.
- AI Astrologer manager.
- Fake report delivery.
- Fake payment state changes.
