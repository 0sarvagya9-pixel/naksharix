# Digital package customer controls — 27 November 2026

The account workspace and private page now use the saved English, Hindi or Hinglish interface preference. Report language is a separate field. Authored English products are explicitly identified; this change does not claim that their contents have been translated.

The workspace validates the actual recorded order identity, client intent, catalogue version, paise price and ordered package items before reporting a saved draft. The exact frozen request is retained after an ambiguous response. Cancellation and generation require affirmative recorded acknowledgements. Unknown account responses cannot appear as an empty account or enable checkout. Synchronous action locks prevent two submissions in the same render turn, and earlier reads cannot overwrite a later account snapshot.

## Fresh verification

`node scripts/qa-digital-package-ui.mjs` passes 77 Chromium scenarios and 10 actual private-page / POST-handler checks. It executes the actual workspace, language provider, package preparation, catalogue and installed Zod. Transport, location lookup and checkout presentation are declared isolated seams. No real payment or email is performed.

The cases cover all seven products in all three interface languages, English-content disclosure, mismatched intent/price/version/identity/items, invalid JSON, interrupted requests, exact intent retry, simultaneous submission, malformed account reads, affirmative and negative cancel/generate acknowledgements, independent report language, dynamic language switching and out-of-order reads. Server checks retain authentication and ledger-conflict behavior.

`PACKAGE_UI_BASELINE=15784f5 node scripts/qa-digital-package-ui.mjs` reproduces the original false saved-draft message after an empty recorded order and then fails its acceptance assertion. The original source is loaded immutably from Git. Early harness attempts using an insecure synthetic origin were corrected to intercepted localhost before collecting the final result.

Full TypeScript and scoped ESLint checks pass. This batch does not close external payment verification, independent content/language approval or the original A44 requirement as a whole.
