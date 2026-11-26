"""Check printed profile-card words and their actual geometry in the rendered PDFs."""
import json
import subprocess
import sys
from pathlib import Path

import fitz


def profile_card_errors(file, page, expected):
    # Poppler honors the PDF's ActualText for shaped Devanagari clusters.
    lines = subprocess.check_output(
        ["pdftotext", "-f", "3", "-l", "3", "-raw", str(file), "-"],
        text=True, encoding="utf-8",
    ).splitlines()
    boxes = [item["rect"] for item in page.get_drawings()
             if item["type"] == "fs" and item["fill"] == (1.0, 1.0, 1.0)
             and item["rect"].y0 > 100][:len(expected)]
    if len(boxes) != len(expected):
        return ["missing profile card rectangles"]

    errors = []
    traces = page.get_texttrace()
    start = 0
    for card, box in zip(expected, boxes):
        label, value = card["label"], card["value"]
        try:
            start = lines.index(label, start) + 1
        except ValueError:
            errors.append(f"profile card label missing or split: {label}")
            continue
        # A multiword value may wrap at spaces. A suffix of a single word
        # on the next printed line (e.g. Vrishchi / k) must fail.
        words = value.split()
        if not any(" ".join(" ".join(lines[start:start+n]).split()) == " ".join(words)
                   for n in range(1, len(words)+1)):
            errors.append(f"profile card value missing or split: {value}")

        value_traces = [trace for trace in traces if "Serif" in trace["font"] and trace["chars"]
                        and box.contains(fitz.Point(*trace["chars"][0][2]))]
        if not value_traces or any(trace["size"] < 12.99 for trace in value_traces):
            errors.append(f"missing or undersized profile card value: {value}")
        for trace in value_traces:
            for code, _, _, bounds in trace["chars"]:
                if not chr(code).isspace() and not box.contains(fitz.Rect(bounds)):
                    errors.append(f"profile card value outside the drawn rectangle: {value}")
                    break
    return errors


if __name__ == "__main__":
    root = Path(sys.argv[1])
    failures, count = [], 0
    for manifest in sorted(root.glob("profile-*/generation.json")):
        for record in json.loads(manifest.read_text()):
            if record["slug"] in ("name-correction-report", "numerology-lo-shu-report"):
                continue
            file = manifest.parent / record["filename"]
            with fitz.open(file) as document:
                cards = record["profileCards"]
                count += len(cards)
                failures += [(str(file), issue) for issue in profile_card_errors(file, document[2], cards)]
    print(json.dumps({"cards": count, "failures": failures}, ensure_ascii=False))
    if not count or failures:
        raise SystemExit(1)
