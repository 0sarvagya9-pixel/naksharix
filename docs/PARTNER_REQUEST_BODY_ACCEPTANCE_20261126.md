# Partner API request admission — 26 November 2026

Scope: existing R32 partner calculation and R34 publisher widget endpoints. The baseline is development revision `9b84a0d6ac1b08d97e2354067919a56bbff60619`. Contract activation, payment purposes, scopes, quotas and prices are unchanged.

## Reproduced defect and repair

The calculation endpoint advertised an 8 KiB request bound but called `request.text()` before checking JavaScript string length. A missing or understated `Content-Length` therefore allowed the entire stream to be buffered before rejection. A multibyte UTF-8 payload could also exceed the intended byte limit while its string length remained below it.

The shared `readBoundedUtf8Body` reader now counts each chunk's bytes before decoding, rejects an oversized declared length early, cancels an over-limit stream and rejects malformed UTF-8. A smaller or absent length header never bypasses the observed byte count. The calculation endpoint accepts at most 8,192 bytes; the widget retains its 4,096-byte bound, error responses and exact-origin CORS behavior. Rejected calculation bodies do not reach the usage reservation or calculation functions. This bounds application buffering; the transport can still provide one incoming chunk larger than the configured limit.

The implementation follows Node's [Web Streams reader contract](https://nodejs.org/api/webstreams.html#class-readablestreamdefaultreader).

## Observed verification

`node scripts/qa-partner-request-boundaries.mjs` fails on the baseline handler because it drains the oversized stream. After repair it passes 40 assertions. The test offers 256 chunks of 1,024 bytes; the repaired handler reads nine chunks, cancels and responds 413. Other cases cover understated and oversized length headers, exact/one-byte-over limits, multibyte payload size, UTF-8 characters split at every byte boundary, malformed or absent bodies, and preserved widget boundaries/CORS.

The test invokes real request handlers and the real input schema. Registry, rate-limit and calculation dependencies are isolated, so these results do not certify actual credentials, provider transport, database billing or commercial integration. Existing disposable-database integration tests retain those separate responsibilities.

Passed locally after repair:

- `npm run qa:business-integrations-contract`, including the new request tests.
- ESLint for the five changed source/test files.
- `npx tsc --noEmit --incremental false`.
- `git diff --check`.

R32/R34 remain subject to their original contract, independent calculation and real integration acceptance. This change closes the request-buffering defect, not those entire commercial requirements.
