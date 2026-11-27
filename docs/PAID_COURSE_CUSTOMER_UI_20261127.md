# Private course controls and assessment confirmation

This repair was rebuilt from durable source `15784f5` after the temporary workspace was lost. Earlier local test counts are not claimed for these replacement bytes.

## Reproduced failure and fix

The actual original component accepted an assessment response for another order and marked the visible module as passed. The before-change Chromium probe runs the immutable original component using `COURSE_UI_BASELINE=15784f5` and a deliberately mismatched acknowledgement.

The client now validates the course owner-order identity, selected module and complete lesson shape before rendering. Assessment confirmation requires the exact submitted order and module, two complete feedback entries, explicit booleans and consistency between the passed flag and the individual feedback. The locked service adds the order and module identifiers after its existing entitlement check and progress transaction. Incomplete or sparse answers cannot submit, and same-turn submissions share one synchronous lock.

Malformed or interrupted saves keep the answers without inventing progress. The user refreshes the stored course state before another submission. Existing per-load sequence guards preserve selected-module ownership. A failed practice attempt still cannot erase a previous pass.

## Language and scope

English, Hindi and Hinglish controls, private metadata, progress labels and recovery messages follow the selected language. The page explicitly states that the seven authored lessons, questions, explanations and purchased workbook remain English. Authored lesson elements have `lang="en"`. Formative checks remain distinct from professional qualification or accredited certification.

## Executed checks

```sh
COURSE_UI_BASELINE=15784f5 node scripts/qa-paid-course-ui.mjs
node scripts/qa-paid-course-ui.mjs
npm run qa:paid-course-contract
```

The current replacement suite passed **78 actual Chromium/component/page scenarios across three locales** and **10 actual assessment-service cases with isolated transaction and entitlement dependencies**. The baseline probe reproduced the false completion for a different order. The browser uses actual React components, `LanguageProvider`, the private page and response readers; HTTP transport is explicitly isolated. The service cases use actual answer keys for all seven modules and verify that failed or unentitled attempts do not write progress.

This evidence does not claim a live purchase, provider payment, actual production database write, human-language acceptance or accredited educational review. The original commercial release gates remain in force.
