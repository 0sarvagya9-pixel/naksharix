# Naksharix Database Migration Recovery

## Purpose

Naksharix uses Prisma with PostgreSQL, but the verified release baseline did not contain a Git-tracked `prisma/migrations` history. This document defines the only safe path to establish migration history without treating the current production database as disposable.

## Non-negotiable stop rule

**Do not run migration commands against production, a shared Neon database, or any database containing unrecovered data.**

Do not run any of the following against production or the shared development database:

- `prisma migrate dev`
- `prisma migrate reset`
- `prisma db push`
- `prisma db push --accept-data-loss`
- `prisma db push --force-reset`
- destructive or unreviewed SQL

Stop immediately if Prisma requests a reset, destructive change, or data-loss acceptance.

## Required evidence before a baseline

Collect and preserve read-only evidence for:

1. Current `prisma/schema.prisma` at the authoritative release HEAD.
2. Production database provider and project identity.
3. Production schema introspection output.
4. Existing `_prisma_migrations` table state, if present.
5. Historical deployment commands and logs.
6. Evidence of previous `db push`, manual SQL, or migration execution.
7. Backup availability and one recoverable snapshot.
8. Row counts for critical payment, booking, report, user, and audit tables.

Never paste connection strings, passwords, tokens, or private keys into GitHub, documentation, CI logs, or chat.

## Isolated rehearsal requirement

All baseline experiments must use an **isolated disposable PostgreSQL database** containing no production data.

The rehearsal database must:

- use a separate database and credentials
- be safe to delete
- not share the production connection string
- not be reachable through the production application
- start from either an empty schema or an approved sanitized schema-only copy

## Safe baseline design

The baseline must be designed in two separate parts:

### Part A — Schema SQL artifact

Generate and review SQL representing the current Prisma schema from an empty database state. The SQL must be checked for:

- table creation order
- enum creation
- foreign keys
- unique constraints
- indexes
- cascade behavior
- decimal precision
- timestamp defaults
- payment, booking, report, and ownership relations

This artifact is for review and isolated rehearsal first. It must not be deployed blindly to an existing production schema.

### Part B — Existing-production adoption plan

An existing production schema generally needs migration history to be marked as already applied rather than recreated. Before any adoption command is approved:

- compare production introspection with the release schema
- resolve every drift item explicitly
- verify that no baseline SQL would recreate existing objects
- document the exact migration name and checksum
- rehearse the adoption on a disposable copy
- confirm application startup, reads, writes, payments, bookings, and report access

## Required rehearsal validation

After applying the proposed baseline to the isolated database, run:

- Prisma schema validation
- Prisma client generation
- application build
- complete deterministic QA
- report workflow QA
- payment static QA
- consultation collision tests
- PDF generation QA
- authentication and authorization checks
- production-like HTTP smoke
- browser and accessibility release QA

Record exact commands, exit codes, warnings, and test counts.

## Production approval gate

Production adoption requires a separate explicit approval containing:

- reviewed SQL
- drift report
- backup evidence
- restore procedure
- isolated rehearsal PASS
- rollback plan
- deployment window
- responsible operator
- exact non-secret commands

No migration, resolve, deploy, reset, push, or manual SQL action is implied by repository merge approval.

## Rollback and recovery

Before any production schema operation:

1. Create and verify a recoverable backup.
2. Record the current deployed application SHA.
3. Record schema and critical table row counts.
4. Ensure rollback does not delete payment, booking, report, user, or audit records.
5. Keep failing migration artifacts for diagnosis; do not rewrite Git history.

## Current classification

Until the evidence and rehearsal above are complete:

- Migration history: `REVIEW_REQUIRED`
- Production schema match: `NOT_VERIFIED`
- Baseline deployment: `NOT_APPROVED`
- Destructive database operations: `FORBIDDEN`
