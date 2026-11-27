# Same-turn Save and Refresh regression — 2026-11-27

## Reproduced failure

On immutable development commit `6755425`, the actual mounted Shop orders, Puja bookings, admin support and customer support components allowed Refresh to start a GET in the same JavaScript task as Save, before React committed the disabled state. Holding that GET until after the mutation acknowledgement reproduced older Shop/Puja notes and admin support status replacing the acknowledged state. Customer support also started the unnecessary GET during ticket creation. The consultation Refresh button reloaded the page while its save was pending.

The reproducer uses actual component source from that commit, current compatible response helpers, synthetic records and isolated transport. It does not perform a real write or contact a provider:

```sh
PLAYWRIGHT_BROWSERS_PATH=/tmp/naksharix-browser-cache-20261127 \
ADMIN_REFRESH_BASELINE=6755425 node scripts/qa-admin-refresh-ordering.mjs
```

## Repair

The four list loaders now check their existing synchronous mutation ref before starting a read. The consultation reload handler checks the same ref before navigating. This closes the gap before React renders the busy state; existing response sequencing still protects reads that began before Save.

Customer support retains its deliberate refresh after a verified creation acknowledgement. Only that internal call can refresh while the creation lock remains held. Manual Refresh and conversation callbacks use the normal guarded path. The mutation lock is not released early.

## Verification

| Gate | Observed result |
| --- | --- |
| `qa-admin-refresh-ordering.mjs` | **15 passed**, actual five components × English, Hindi and Hinglish |
| `qa-support-language-ui.mjs` | Existing **114 cases passed** again |
| `qa-admin-fulfilment-ui.mjs` | Existing **183 cases passed** again |
| Full TypeScript check | Exit 0 |
| ESLint, five changed components and new harness | Exit 0 |
| Git diff whitespace check | Exit 0 |

The focused gate confirms no GET or page reload during a pending mutation, exactly one write, saved status retained, and the customer support post-acknowledgement refresh still performed. Its 15 cases are additional; the existing 114 and 183 reruns are not additional unique tests.

Local receipts are in `support-evidence/admin-refresh-before.log`, `admin-refresh-current.log`, `support-ui-refresh-regression.log`, `fulfilment-ui-refresh-regression.log`, `admin-refresh-types.log` and `admin-refresh-lint.log` in the working session evidence directory.

This repair changes read ordering only. Existing authorization, exact acknowledgement, optimistic concurrency, payment, partner acceptance and fulfilment constraints remain in place. These isolated checks do not establish real production delivery, payment, provider acceptance, independent language review or commercial release readiness.
