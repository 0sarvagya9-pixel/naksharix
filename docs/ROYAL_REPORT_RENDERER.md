# Royal Edition report renderer

The paid generation service and the fictional sample route use the editorial renderer. Validated automated orders and reviewed specialist requests supply the SKU, reference, display name, locale, and structured calculation sections. The informational fallback for manual working reports remains separately identified.

The approved 22-page Hindi Fortune PDF has SHA-256 `57990431bcc8e04292978211a370529380ac4194c068ea3aef93d489fae79e5c`. The approved editable HTML has SHA-256 `7bdde888ffcd12fe20b1122dae689909eaf94235563fc6669fad1e34f6969e0c`. Only the cover ornament and header mark live in `public/report-design/royal`. The cover artwork was derived by removing every text object and every font resource from page one. Its form contains the approved gradient, wheel, lotus, gold arch and name-panel border. The interior mark comes from the supplied header SVG. Every title, identity, date, request ID, calculation, chapter and running page number is composed separately. Report generation refuses a mismatched declared display name. Customer text with unsupported script coverage is held for specialist handling rather than serialized with replacement characters. Both artwork files must be deployed with the application.

Royal purple headings, dark purple data bars, ivory pages, dark ink and antique gold ornaments use the locked palette. Smaller overlines use dark gold for contrast on ivory. Narrative cards use 13.2-point body type and 1.58 line height. Tabular and additional information carries smaller type. Fonts are embedded in the generated PDF. The renderer embeds subsets of Noto Sans and Noto Serif from pinned Fontsource dependencies installed at build. The existing Devanagari Sans remains packaged with its license notice. These verified assets are included in application tracing and a missing face stops the Royal render. The source repository does not add raw font binaries. Commercial visual matching must be checked on the actual host. Indic text runs carry logical-order PDF ActualText for copying and search.

Date/name-only reports select their own cover, methods and interpretation sections and omit coordinates, time, Lagna and chart labels. Other products use the birth instant and chart sections from their own calculation, and the couple report accepts a consented second profile. The sample route copies selected pages from its fictional generated report and marks every page as a preview.

## Reproducible local verification

From the repository root after installing its locked dependencies, run the following commands with a private output path and the checksum-verified reference. The matrix creates three fictional profiles for each of the 15 products in English, Hindi and Hinglish. Set `REPORT_MATRIX_PROFILE` to 1, 2 or 3 to split the work. `REPORT_MATRIX_AS_OF` overrides the fixed review instant for reproducible tests. The locked package versions determine the supplemental font faces.

```sh
REPORT_MATRIX_DIR=/tmp/naksharix-matrix node scripts/qa-royal-report-matrix.mjs
python scripts/qa-royal-report-pages.py /tmp/naksharix-matrix /path/to/approved.pdf /tmp/royal-page-proof.json
```

The page check requires PyMuPDF and NumPy. It reopens each generated PDF, checks its checksum and reference, rasterizes every page, examines glyph geometry and page numbering, and compares original cover components pixel by pixel. A passing matrix establishes those measured properties. Product scoring, the independent calculation review and release gates require their separate evidence.
