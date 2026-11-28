"""Check repaired semantic distinctions in actual Royal PDF text.

This is a targeted regression, not a native-language or practitioner approval.
The optional frozen corpus supplies unchanged profile/question/numerical facts.
"""
import argparse
import json
import re
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("matrix", type=Path)
parser.add_argument("output", type=Path)
parser.add_argument("--baseline", type=Path)
args = parser.parse_args()


def manifests(directory):
    return {(row["profile"], row["slug"], row["language"]): (manifest.parent, row)
            for manifest in sorted(directory.glob("profile-*/generation.json"))
            for row in json.loads(manifest.read_text())}


def extracted(file):
    return subprocess.check_output(["pdftotext", "-raw", str(file), "-"], text=True, encoding="utf-8")


def normalized(text):
    return " ".join(text.split())


def lunar_values(text, language):
    table = re.search(r"Lahiri\s*/\s*([\d.]+)°", text)
    intro = {"en": "Lunar method v2", "hi": "चंद्र गणना विधि 2", "hinglish": "Chandra ganana ki doosri vidhi"}[language]
    paragraph = text.split(intro, 1)[1] if intro in text else ""
    lunar = re.search(r"([\d.]+)°", paragraph[:1200])
    return [table.group(1) if table else None, lunar.group(1) if lunar else None]


baseline = manifests(args.baseline) if args.baseline else {}
records = manifests(args.matrix)
if not records:
    raise ValueError("No generated report manifest found")
rows = []
for key, (directory, record) in records.items():
    profile, slug, language = key
    problems = []
    if not record.get("pass"):
        rows.append({"profile": profile, "slug": slug, "language": language, "pass": False, "failures": ["generation failed"]})
        continue
    raw = extracted(directory / record["filename"])
    text = normalized(raw)
    count_matches = []
    if slug not in {"name-correction-report", "numerology-lo-shu-report"}:
        label = {"en": "Mean ayanamsha for the lunar calculation:", "hi": "चंद्र गणना का माध्य अयनांश:", "hinglish": "Chandra ganana ka madhya ayanamsha:"}[language]
        if label not in text:
            problems.append("unlabeled lunar mean ayanamsha")
        hours = {"en": "Birth UTC offset (hours)", "hi": "जन्म का UTC अंतर (घंटे)", "hinglish": "Janm ka UTC antar (ghante)"}[language]
        if hours not in text:
            problems.append("birth offset unit missing")
    if slug in {"baby-name-report", "name-correction-report"}:
        header = {"en": "Number symbolism / reflection", "hi": "अंक की व्याख्या / चिंतन", "hinglish": "Ank ki vyakhya / reflection"}[language]
        if header.casefold() not in text.casefold():
            problems.append("name table does not distinguish number symbolism from name meaning")
    if slug in {"premium-kundli", "manglik-kaal-sarp-report", "couple-kundli"}:
        label = {"en": "Rule matches:", "hi": "नियम का मेल:", "hinglish": "Niyam se mel:"}[language]
        count_matches = re.findall(re.escape(label) + r"\s*([0-3])\s*/\s*3", text)
        expected = 2 if slug == "couple-kundli" else 1
        if len(count_matches) != expected:
            problems.append(f"expected {expected} explicit Manglik reference counts, found {len(count_matches)}")
        legacy = ["touches Manglik-sensitive houses", "Mars sensitive houses indicate", "मंगल संवेदनशील भावों में संकेत देता", "Manglik levels", "मांगलिक स्तर"]
        if any(phrase in text for phrase in legacy):
            problems.append("legacy severity/compatibility inference remains")
        if re.search(r"[.!?।],", text):
            problems.append("comma appended after a complete guidance sentence")
        if slug != "couple-kundli":
            negative = {"en": "Not clearly detected", "hi": "स्पष्ट रूप से नहीं पाया गया", "hinglish": "Spasht roop se nahi mila"}[language]
            if negative in text:
                problems.append("negative rule result still presented as inconclusive data")
            boundary = {"en": "boundary points", "hi": "सीमा-बिंदु", "hinglish": "seema ke bindu"}[language]
            if boundary not in text:
                problems.append("Kaal Sarp rule boundary convention missing")
            caution = {"en": "Dosha indicators should be read with context, not fear.", "hi": "दोष संकेतों को भय नहीं, संदर्भ के साथ समझना चाहिए।", "hinglish": "Dosha signals ko fear nahi, context ke saath samjhein."}[language]
            if slug == "manglik-kaal-sarp-report":
                for page in raw.split("\f"):
                    if normalized(page).count(caution) > 1:
                        problems.append("identical Kaal Sarp caution repeated on one page")
        elif language == "hi" and re.search(r"\b(?:Remedies|Nadi Dosh(?:a)?|Bhakoot Dosh(?:a)?)\b", raw, flags=re.IGNORECASE):
            problems.append("unlocalized Hindi guidance/factor label")
    if baseline:
        if key not in baseline:
            problems.append("no matching baseline report")
        else:
            old_directory, old = baseline[key]
            for field in ["name", "requestId", "profileCards", "readerQuestion"]:
                if record.get(field) != old.get(field):
                    problems.append("frozen input/output changed: " + field)
            if slug not in {"name-correction-report", "numerology-lo-shu-report"}:
                old_text = normalized(extracted(old_directory / old["filename"]))
                current_values, old_values = lunar_values(text, language), lunar_values(old_text, language)
                if None in current_values or current_values != old_values:
                    problems.append("rendered ayanamsha values changed or were omitted")
    rows.append({"profile": profile, "slug": slug, "language": language,
                 "pages": record["pages"], "manglikReferenceCounts": count_matches,
                 "pass": not problems, "failures": problems})

summary = {"scope": "Targeted actual-PDF semantic regression, not human language/practitioner approval",
           "reports": len(rows), "passed": sum(row["pass"] for row in rows),
           "failed": sum(not row["pass"] for row in rows),
           "baselineCompared": bool(baseline), "rows": rows}
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({key: value for key, value in summary.items() if key != "rows"}, ensure_ascii=False))
if summary["failed"]:
    print(json.dumps([row for row in rows if not row["pass"]], ensure_ascii=False))
    raise SystemExit(1)
