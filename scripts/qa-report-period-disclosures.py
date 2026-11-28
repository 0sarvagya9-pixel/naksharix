"""Check period-model disclosures and reproducibility timestamps on the rendered PDF pages."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import unicodedata

PRODUCTS = {"premium-kundli", "career-report", "wealth-report", "love-report", "yearly-horoscope-report", "fortune-report"}
WORDS = {
    "en": ("These Dasha dates use the calculated birth Moon", "can move a period boundary by days", "how to reproduce this model", "Model start (UTC)", "Model end (UTC)", "can shift them by days"),
    "hi": ("दशा तिथियाँ जन्म के समय चंद्रमा की गणितीय स्थिति", "अवधि की सीमा कई दिन खिसक सकती है", "इसी गणना को दोहराने के लिए", "गणितीय आरंभ (UTC)", "गणितीय अंत (UTC)", "ये तिथियाँ कई दिन खिसक सकती हैं"),
    "hinglish": ("Dasha ki tareekhein janm ke Chandra ki ganana", "avadhi ki seema kai din khisak sakti hai", "isi ganana ko dohraane ke liye", "Ganit se aarambh (UTC)", "Ganit se ant (UTC)", "ye tareekhein kai din khisak sakti hain"),
}

def normalize(value):
    return "".join(unicodedata.normalize("NFC", value).split()).casefold()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("matrix", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--smoke", action="store_true", help="Allow one product per locale for quick pre-commit PDF checks")
    args = parser.parse_args()
    results = []
    for manifest in sorted(args.matrix.glob("profile-*/generation.json")):
        for sample in json.loads(manifest.read_text()):
            if sample["slug"] not in PRODUCTS:
                continue
            pdf = manifest.parent / sample["filename"]
            pages = [normalize(p) for p in subprocess.check_output(["pdftotext", "-raw", str(pdf), "-"]).decode().split("\f")]
            start, uncertainty, reproduction, start_label, end_label, depth_note = map(normalize, WORDS[sample["language"]])
            tests = {
                "manifestHash": hashlib.sha256(pdf.read_bytes()).hexdigest() == sample["sha256"],
                "methodAndCalendarUncertainty": any(start in p and uncertainty in p and reproduction in p for p in pages),
                "labelledModelTimestamps": any(start_label in p and end_label in p and re.search(r"\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}\.\d{3}z", p) for p in pages),
                "contextQualification": any(depth_note in p for p in pages),
                "noUnqualifiedExactBoundary": all("exactcalculatedthird-levelboundaries" not in p for p in pages),
            }
            results.append({"sku":sample["slug"],"profile":sample["profile"],"language":sample["language"],"revision":sample["sourceRevision"],"tests":tests})
    ids={(r["sku"],r["profile"],r["language"]) for r in results}
    complete=ids=={(s,p,l) for s in PRODUCTS for p in (1,2,3) for l in WORDS} if not args.smoke else {r["language"] for r in results}==set(WORDS)
    out={"files":len(results),"allExpected":complete,"passed":sum(all(r["tests"].values()) for r in results),"perFile":results}
    args.output.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n")
    print(out["passed"],"of",len(results),"PDFs passed")
    if not complete or len(ids)!=len(results) or out["passed"]!=len(results):
        raise SystemExit(1)
if __name__=="__main__":
    main()
