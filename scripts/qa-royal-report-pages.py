"""Proof all artifacts from qa-royal-report-matrix against the owner's reference."""
import argparse
import hashlib
import json
import re
from pathlib import Path

import fitz
import numpy as np
from qa_royal_profile_cards import profile_card_errors

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("matrix", type=Path)
parser.add_argument("reference", type=Path)
parser.add_argument("output", type=Path)
args = parser.parse_args()
reference_hash = "57990431bcc8e04292978211a370529380ac4194c068ea3aef93d489fae79e5c"
if hashlib.sha256(args.reference.read_bytes()).hexdigest() != reference_hash:
    raise ValueError("Approved reference checksum mismatch")
overlays = {
    "lotus": (240, 74, 355, 133), "wheel": (153, 190, 440, 490), "border": (8, 8, 29, 833)
}
def pixels(page, bounds):
    pix = page.get_pixmap(clip=fitz.Rect(*bounds), alpha=False)
    return np.frombuffer(pix.samples, dtype=np.uint8).astype(np.int16)

with fitz.open(args.reference) as baseline:
    references = {k: pixels(baseline[0], box) for k, box in overlays.items()}

# English intentional technical labels can occur in Hinglish. These fragments
# are full editorial phrases that had leaked verbatim from the English report.
english_only_phrases = [
    "north indian house-fixed d1 and d9 diagrams", "diagrams are calculated from the internal lahiri",
    "degrees rounded to four decimal places", "empty houses remain meaningful",
    "vimshottari periods are calculated timing frameworks", "use timing as a reflection framework",
    "rule-based indicators and birth panchang", "no evaluated yoga is marked detected",
    "symbolic birth-date and name numbers", "a traditional compatibility score is not a decision",
    "absent digits are not deficiencies", "motion is estimated at the snapshot",
]
profiles = {1: "Asha Mehra", 2: "Robin Ellis", 3: "Meera Shah"}
rows = []
for manifest in sorted(args.matrix.glob("profile-*/generation.json")):
    for record in json.loads(manifest.read_text()):
        problems = []
        issues = lambda condition, description: problems.append(description) if condition else None
        row = {"profile":record["profile"],"slug":record["slug"],"language":record["language"]}
        if not record["pass"]:
            rows.append({**row,"pages":0,"pass":False,"failures":[record["error"]]})
            continue
        file = manifest.parent / record["filename"]
        digest = hashlib.sha256(file.read_bytes()).hexdigest()
        issues(digest != record["sha256"], "generation checksum mismatch")
        with fitz.open(file) as doc:
            cover = doc[0].get_text()
            issues(record["name"] not in cover, "incorrect cover identity")
            issues(record["requestId"] not in cover, "request ID missing")
            issues(record["name"] != profiles[record["profile"]], "unknown profile")
            issues(record["requestId"] not in doc.metadata["title"], "request metadata mismatch")
            issues("रॉयल संस्करण" not in cover if record["language"]=="hi" else "Royal Edition" not in cover,"cover locale")
            if record["slug"] not in ("name-correction-report", "numerology-lo-shu-report"):
                if record.get("profileCards"):
                    problems.extend(profile_card_errors(file, doc[2], record["profileCards"]))
                else:
                    problems.append("missing expected profile cards in generation manifest")
            region_errors = {key:float(np.abs(pixels(doc[0],box)-references[key]).mean()) for key,box in overlays.items()}
            issues(max(region_errors.values())>0.5,"approved cover artwork difference")
            for idx,page in enumerate(doc):
                page_no = idx+1
                text = page.get_text()
                pix = page.get_pixmap(matrix=fitz.Matrix(1,1),alpha=False)
                image = np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,3)
                # Ignore running headers/footers when detecting empty pages.
                ink = image[80:770,36:-36].min(axis=2)
                issues(np.count_nonzero(ink<120)<140,f"blank raster body p{page_no}")
                issues(len(text.strip())<60,f"no selectable content p{page_no}")
                issues(any(line.strip() in {"°","%"} for line in text.splitlines()),
                       f"unit wrapped away from its value p{page_no}")
                if idx:
                    issues(f"{page_no:02} / {len(doc):02}" not in text,f"pagination p{page_no}")
                    issues(tuple(image[75,15])!=(255,253,247),f"Royal ivory background p{page_no}")
                for trace in page.get_texttrace():
                    for unicode_value,glyph_id,_,box in trace["chars"]:
                        if chr(unicode_value).isspace(): continue
                        if glyph_id==0: problems.append(f"missing glyph U+{unicode_value:04X} p{page_no}");break
                        if not (box[0]>=-0.5 and box[1]>=-0.5 and box[2]<=page.rect.width+.5 and box[3]<=page.rect.height+.5):
                            problems.append(f"glyph outside page p{page_no}");break
                if record["language"]=="hinglish":
                    logical_text=" ".join(text.lower().split())
                    for fragment in english_only_phrases:
                        issues(fragment in logical_text,f"English-only explanatory passage p{page_no}: {fragment}")
                    if page_no==2: issues("vishay suchi" not in logical_text,"Hinglish contents page missing")
                if record["slug"]=="transit-report" and page_no==5:
                    headers={
                        "en":["DATE","SUN","MOON","MARS","MERCURY","JUPITER","VENUS","SATURN","RAHU","KETU"],
                        "hi":["तिथि","सूर्य","चंद्र","मंगल","बुध","गुरु","शुक्र","शनि","राहु","केतु"],
                        "hinglish":["DATE","SURYA","CHANDRA","MANGAL","BUDH","GURU","SHUKRA","SHANI","RAHU","KETU"],
                    }[record["language"]]
                    ordered=[line.strip() for line in text.splitlines()]
                    start=ordered.index(headers[0]) if headers[0] in ordered else -1
                    issues(start<0 or ordered[start:start+len(headers)]!=headers,"transit planet header split inside a word")
                if record["slug"]!="couple-kundli":
                    issues(any(other in text for other in set(profiles.values())-{record["name"]}),f"foreign identity p{page_no}")
                if record["slug"] in ("name-correction-report","numerology-lo-shu-report"):
                    issues(bool(re.search(r"UTC birth instant|Birth UTC offset|UTC जन्म समय|अक्षांश / देशांतर|अयनांश",text)),f"unnecessary birth-chart record p{page_no}")
            row.update(pages=len(doc),sha256=digest,coverMeanAbsoluteChannelDifference=region_errors,elapsedMs=record["elapsedMs"],passAllAutomatedChecks=not problems)
        rows.append({**row,"pass":not problems,"failures":sorted(set(problems))})

cells={(r["profile"],r["slug"],r["language"]) for r in rows}
complete=len(rows)==len(cells)==135 and all(sum(r["profile"]==n for r in rows)==45 for n in profiles)
passed=sum(r["pass"] for r in rows)
report = {"complete135":complete,"pdfs":len(rows),"passed":passed,"failed":len(rows)-passed,
          "pages":sum(r["pages"] for r in rows),"referenceSha256":reference_hash,
          "tests":"Every page rasterized at 72 dpi, page geometry and font glyphs, running pagination, content presence and selectable text, detached units, checksum, cover identity/locale, cross-profile isolation, approved lotus/wheel/border pixel comparisons, date/name-only data exclusion. The four printed birth-chart cards are compared with the calculated words, outlined rectangles and 13 pt minimum value size. Couple partner names are intentionally allowed.",
          "limitations":"These checks do not certify every interpretation, native-language quality, print fidelity, real email delivery or independent professional acceptance.",
          "rows":rows}
args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({k:v for k,v in report.items() if k not in ("rows","tests","limitations","referenceSha256")}))
if not complete or passed!=len(rows): raise SystemExit(1)
