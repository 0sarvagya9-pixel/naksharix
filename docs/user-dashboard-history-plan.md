# User Dashboard And History Plan

## Current Status

The database has models for Kundli, KundliReport, NumerologyReport, TarotReading, Payment, Invoice, PurchasedReport, and ReportRequest. The dashboard should only show real persisted records or honest empty states.

## Target Sections

- Saved Kundlis from `Kundli`.
- Kundli reports from `KundliReport`.
- Report requests from `ReportRequest`.
- Numerology history from `NumerologyReport`.
- Tarot history from `TarotReading`.
- Payments/invoices only when payment flows are intentionally active.

## Safety Rule

No dashboard card should imply saved reports, consultation bookings, AI sessions, planet strength scores, or premium PDF downloads unless those values come from persisted data or verified calculation output.

## Next Step

Replace illustrative dashboard widgets with server-loaded real data counts and empty states.
