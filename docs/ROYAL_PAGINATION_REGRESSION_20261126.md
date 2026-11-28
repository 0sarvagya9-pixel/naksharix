# Royal reference-matrix pagination repair

The saved `9b84a0d6ac1b08d97e2354067919a56bbff60619` source generated 31 pages for the London reference profile's Premium Kundli Hinglish edition. Its planetary-placement heading ended on page 6, while the two interpretation cards continued onto page 7. The previous all-page checker accepted the file because it checked numbering and geometry without checking the reference matrix's page-count range.

The previously prepared renderer repair keeps those cards with the nine-planet table by using a 31-point minimum table row height for that one chapter, instead of 33 points. Font sizes, text, calculations, chart diagrams and the approved design remain intact. Other planetary tables retain their existing row height. The reproduced London file now has 30 pages, and the table and both cards fit on page 6. The resulting page was rasterized and inspected for spacing and clipping.

Both reference-matrix generation and the independent physical-PDF checker now enforce the existing 4-30 page regression range. The physical checker also compares the serialized page count to the generation manifest. Running it against the old, clean 135-file matrix rejects precisely the London Hinglish file; the other 134 files pass the measured checks.

This range is a contract for the declared three-profile regression corpus. The original P0 instructions treat page-count targets as guidance rather than a reason to pad, delete or shrink meaningful content. No universal production page-count restriction or new requirement has been introduced.

## Verification

The failing and corrected single-case reproduction uses:

```sh
REPORT_MATRIX_DIR=/private/qa-output REPORT_MATRIX_PROFILE=2 REPORT_MATRIX_LANG=hinglish REPORT_MATRIX_SKU=premium-kundli node scripts/qa-royal-report-matrix.mjs
```

The complete regression uses the same matrix generator without profile, language or SKU filters, followed by `scripts/qa-royal-report-pages.py` with the approved reference PDF. Run `node --experimental-strip-types scripts/qa-editorial-display.mjs` for the adjacent display and row-pagination contracts. The saved question-boundary cases independently exercise empty, in-scope and out-of-scope questions in all three languages.

Commercial acceptance, complete numerical qualification, qualified editorial review and real provider-to-recipient delivery remain separate gates. These pagination results do not close them.

## Related editorial regressions

Reviewing the saved customer reports exposed untranslated Hindi numerology prose (`grounded routine` and `healing`). The numerology correction supplies Hindi wording, and `qa-automatic-report-delivery.mjs --numerology-narrative` exercises all twelve ordinary/master-number profiles and 48 narrative fields, including profiles not selected by the three default birth examples. This mechanical language check supplements the required qualified editorial review.

The free-text question router also treated `homework` as `work`, assigning a study question to the career house. Work matching now uses a word boundary; homework, coursework and the corresponding Hindi terms route to study. `qa-automatic-report-delivery.mjs --question-routing` checks ten actual assembled answers, including the original failure, three-language study/career questions, retained family scope boundaries and a networking substring control. The printed answer remains bound to the same selected response in the report content.

## Question and answer pagination

Visual review of the refreshed matrix found the Hindi Lo Shu answer split mid-sentence onto its last page. The renderer now measures the submitted question, response and disclaimer together. When that group fits on a fresh page, it stays together. Longer customer questions retain normal line pagination; the response and disclaimer are kept together separately when they fit. No font sizes or report text are shortened.

The matrix manifest records its expected question text, and the standalone Poppler reader `scripts/qa_royal_question_blocks.py` checks the physical PDF for the whole short question/answer/disclaimer group on one page. The CI regression now covers the three London Kundli editions and the Hindi Lo Shu case. The original Hindi file fails this check, the repaired file passes, and both retain 15 pages. The full 135-file physical proof applies the same check to each reference question; this does not impose a single-page rule on arbitrary long customer input.

A separate 1,991-character question with 71 explicit lines rendered over multiple pages. Poppler readback found every submitted line exactly once and the generated response intact. This exercises the oversized-input path rather than treating a long question as an indivisible layout block.
