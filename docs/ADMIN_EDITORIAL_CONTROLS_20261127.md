# Admin review and editorial controls — recovered verification

Date: 2026-11-27. Source checkpoint before this repair: `15784f59e61b0a3da9a1b924e651b2ee1abbb2a3`.

## Repaired behavior

Credential review now requires the exact submitted profile ID and decision in a successful acknowledgement. The credential route returns that identity only after its existing serializable transaction and audit succeed. Profile approval/rejection/pending controls require the exact profile ID and expected resulting status. Both use synchronous operation locks, localized recovery messages and readback links when a response is uncertain. Private notes and entered decisions are retained; neither an HTTP 200 alone nor another profile's result can produce a success notice.

The blog editor verifies the returned article's title, excerpt, content, category, tags and stored status, as well as nonempty ID and slug. It clears the draft only after an exact acknowledgement. Network or malformed outcomes preserve the draft, stop blind repeated creation and offer the private records page for readback. Authored article text is preserved. Labels, status descriptions and recovery messages are available in English, Hindi and Hinglish.

The private admin blog page shows the latest 30 stored records with their ID, slug, status and Asia/Kolkata timestamp. It explains the existing publication boundary: a database record with `PUBLISHED` status is not proof that the separate checked-in public guide at `/blog/[slug]` is live. The page does not invent a public URL for such records. The private astrologer page uses localized titles and status labels, preserves evidence/approval controls and does not make unsafe document URLs clickable. Both pages explicitly apply their existing admin role boundary and noindex metadata.

Native-script-only article titles previously produced an empty ASCII slug. The POST route now falls back to a UUID-backed `post-…` identifier only when the existing slug function returns empty. Existing ASCII slug behavior, authored text, role rules and database uniqueness remain intact. This is a bounded identifier repair, not a replacement publishing system.

## Fresh evidence

All identities, requests and persistence below are isolated synthetic fixtures. No real credential decision, practitioner approval or article publication was performed.

| Check | Result |
| --- | --- |
| Baseline at `15784f5` | The actual old credential component accepted a different profile/decision response as recorded and sent two POSTs from same-turn submissions. |
| `node scripts/qa-admin-editorial-ui.mjs` | 102 actual component/private-page cases across English, Hindi and Hinglish passed. |
| Route section of the same suite | 16 actual handler/Zod/credential-parser/slug cases passed with isolated persistence. |
| Scoped ESLint | Passed with zero errors and zero warnings. |
| Full project `tsc --noEmit` | Passed. |
| `git diff --check` | Passed. |

The suite verifies exact and malformed acknowledgements, duplicate operation locking, preserved private notes and article drafts, all three profile decisions, rejected unauthorized operations, required credential evidence, localized private metadata, no fake public article links, unsafe document URL handling, native-title uniqueness and unchanged ASCII slugs. It loads the actual components and page code. Route cases run the actual handlers and input schemas while substituting only identity and persistence dependencies.

Evidence receipts: `admin-editorial-recovery-before.log`, `admin-editorial-recovery-ui.log`, `admin-editorial-recovery-lint.log`, and `course-expert-editorial-final-typecheck.log`. A recorded failure remains separate from the final pass receipt and is not counted as a pass.

## Remaining boundary

This change does not approve any practitioner, certify their credentials, publish any real article or join the database editor to the checked-in public guide library. Human evidence review and editorial/publication acceptance still need their existing authorized owners. No production migration, payment setting, release gate or Royal report design is changed.
