# Reports Backend Workflow Plan

## Current Status

`ReportRequest` exists in Prisma and admin read APIs exist, but the public report catalogue remains request-intent only. The existing report request API requires authentication and payment/admin bypass, so it is not safe to present as a general no-payment public submission flow yet.

## Existing Related Surfaces

- `prisma/schema.prisma`: `ReportRequest`, `Payment`, `Invoice`, `PurchasedReport`.
- `app/api/report-requests/route.ts`: authenticated request creation tied to payment/admin bypass.
- `app/api/admin/report-requests/route.ts`: admin list endpoint.
- `app/admin/report-requests/[id]/page.tsx`: admin detail view.
- `components/reports-content.tsx`: public request-intent UI without submission.

## Required Before Full Activation

- Decide whether no-payment report requests are allowed for all users.
- Add status values for `pending_review`, `needs_info`, `ready`, and `delivered` or map them safely to current enum.
- Add admin notes storage.
- Add user-facing history from real persisted rows only.
- Remove payment dependency from request creation if business wants manual review first.
- Add email notifications only after privacy/legal review.

## Public Boundary

Do not show order confirmed, payment confirmed, report delivered, or instant PDF language until the matching backend workflow is real.
