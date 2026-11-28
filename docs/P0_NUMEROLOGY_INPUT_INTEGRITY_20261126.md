# Numerology input and result integrity — 26 November 2026

Requirement links: **P0-06, P0-09, P0-10, A21**. These repairs do not close those whole requirements or certify astrological predictions.

## Reproduced defects at 9b84a0d

The public calculation path differed from the already guarded paid-report path:

| Input | Previous result | Corrected result |
|---|---|---|
| `आशा` | Name, vowel and personality numbers all invented as 1 | All name-derived groups unavailable; birth-date calculations retained |
| `Asha शर्मा` | Calculated only the surviving `Asha` fragment | No partial spelling calculation or inferred transliteration |
| `Rhythm` | Vowel number substituted from the full-name total, 11 | Vowel result unavailable in the declared A/E/I/O/U method |
| `AEIOU` | Personality substituted from the full-name total, 6 | Consonant result unavailable; name/vowel numbers remain 6 |
| `1990-02-30` through the public schema | JavaScript date coercion silently became 2 March | Validation fails before coercion |
| The same invalid date in focused Lo Shu | Generated a grid from the rolled date | Validation fails |

The main daily UI also recomputed a different number from life path plus a host-local day, instead of using the returned personal-day number. Focused name/Lo Shu views recalculated from editable form fields after submission. Both now display the accepted result; editing the form does not silently alter an earlier result.

The focused name and destiny pages also forced the report engine to English despite a selected Hindi or Hinglish interface. They now forward the selected locale. Six actual React component submissions in Chromium (two calculators across three locales, with the real arithmetic engine and isolated layout/language context) confirmed the corresponding localized meanings and unchanged values: `Asha Test` / `1992-05-18` gives name 3, birth 9 and life path 8. This is a component integration check, not a full deployed-site or provider test.

A subsequent consumer review reproduced a separate legacy assembler defect: an absent chart name was replaced with the brand placeholder `Naksharix Native`, producing name/vowel/personality values 5/8/6. The placeholder is removed. Missing name groups remain null, with explicit reason/limitations and partial-section status. The manual admin PDF route uses this assembler for its legacy fallback. Current automatic Royal generation does not call it, so these changes do not alter that report matrix.

## Method and compatibility

`lib/numerology/name.ts` is now the shared name arithmetic implementation. Existing paid-report imports re-export it. Valid complete A–Z spellings retain the existing continuous full-name sum, A/E/I/O/U vowel classification, Y-as-consonant convention and master-number stopping rule (11/22/33). Apostrophes, spaces, hyphens and periods retain their existing handling. No unsupported transliteration is invented.

Name-number, destiny, soul-urge and personality fields may now be `null` when their required input group is unavailable. A `nameMethod` and `nameUnavailableReason` explain the result. The general engine still supports native-script display names and returns date-derived numbers. The dedicated public name calculator requests a complete A–Z spelling and returns a validation error otherwise. Consumer views handle unavailable groups explicitly. The legacy core-calculator wrapper now delegates to the same arithmetic and uses UTC birth-date components.

`lib/numerology/input.ts` validates Gregorian civil dates by round trip before constructing the calculation date. Public API birth dates must be `YYYY-MM-DD`; timestamp or arbitrary trailing text is not silently accepted. A supplied `Date` object uses its UTC calendar date. Invalid or all-zero optional mobile/vehicle values are rejected instead of fabricating the number 1.

The Hindi birth-date life-path label is kept separate from the name-derived expression label. Four observed mixed-language/grammar defects in Hindi numerology profiles were corrected. This is an engineering copy review, not a professional editorial signoff.

## Verification

Run `npm run qa:numerology-integrity` (also included in `qa:all`). It exercises:

- 102 letter/name cases using a separately written literal alphabet table and fixed independently calculated examples;
- 36 unsupported/mixed-script/diacritic/empty-name cases in three languages;
- 20 invalid/valid date and UTC/Los Angeles/Kolkata/Auckland cases;
- 8 invalid/valid optional mobile and vehicle cases;
- 24 real paid-report assembler cases, including native-script display names and empty vowel/consonant groups, in English, Hindi and Hinglish.
- 5 legacy assembler cases: omitted name, native script, empty vowel group, empty consonant group and a normal complete spelling.

All **195 cases passed** in the repair worktree. Focused lint and full TypeScript checking passed. Existing engine-fixture checks passed 137 assertions with two pre-existing validation skips; premium-content checks passed seven assertions. Report-preflight checks passed. The HTTP suite includes validation and unavailable-group regressions for the actual `/api/numerology` route; the integrated acceptance run records their environment and result separately.

## Source distinction

The original method is frozen in the paid-report acceptance implementation. These practitioner-authored descriptions independently distinguish consonant-derived personality from vowel-derived soul urge:

- [Hans Decoz, Personality Number](https://www.worldnumerology.com/numerology-personality/)
- [Hans Decoz, Soul Urge Number](https://www.worldnumerology.com/numerology-soul-urge/)
- [Hans Decoz, calendar-cycle calculations](https://www.worldnumerology.com/do-your-own-reading/)

Those sources describe additional name-part reduction and contextual-Y conventions. This repair does **not** claim complete parity with those variants, change the approved method to them, or establish predictive validity. A change of convention would need its own explicit acceptance fixtures and disclosure.

## Strength qualification remains separate

Review of the saved Work forensics and [Raman, *Graha and Bhava Balas*, civil-day and mean-motion tables](https://astrojyotish.info/pdf/graha-bhava-balas.pdf) did not establish a safe replacement for the unresolved publisher-specific strength inputs. The 1979/2025 comparison remains 72/97 and 72/97 under the recorded Raman/seasonal-Hora settings: **50/194 mismatches**, comprising ten direct terms and forty dependent values.

Direct terms are 1979 Mars/Mercury/Jupiter/Saturn Cheshta and Saturn Sthana, plus 2025 Mercury/Venus Cheshta and Mercury/Jupiter/Saturn Sthana. Publisher mean longitudes, seeghrocha, exact day count and individual dignity awards are absent from the compared summaries. The previously tried 30-day calendar surrogate and per-varga-friendship substitutions are not adopted: they fail other independent examples. No threshold, reference number, public activation fence or qualification flag was relaxed.
