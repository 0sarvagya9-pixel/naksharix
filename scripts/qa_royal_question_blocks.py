"""Independent physical readback for the short questions in the Royal matrix."""
import subprocess
import unicodedata


def normalized(value):
    value = unicodedata.normalize("NFC", value).casefold()
    replacements = {"–": "-", "—": "-", "−": "-", "‘": "'", "’": "'", "′": "'", "“": '"', "”": '"'}
    for before, after in replacements.items():
        value = value.replace(before, after)
    return "".join(value.split())


def question_block_errors(file, question):
    if not isinstance(question, dict):
        return ["missing expected question block in generation manifest"]
    keys = ("submittedQuestion", "label", "title", "body", "disclaimer")
    if any(not isinstance(question.get(key), str) or not question[key].strip() for key in keys):
        return ["incomplete expected question block in generation manifest"]
    pages = subprocess.check_output(["pdftotext", "-raw", str(file), "-"], text=True).split("\f")
    expected = [normalized(question[key]) for key in keys]
    if not any(all(text in normalized(page) for text in expected) for page in pages):
        return ["short submitted question, answer and disclaimer split across pages"]
    return []


if __name__ == "__main__":
    import argparse
    import hashlib
    import json
    from pathlib import Path

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("matrix", type=Path)
    parser.add_argument("--expected-documents", type=int, required=True)
    args = parser.parse_args()
    checked, failures = 0, []
    for manifest in sorted(args.matrix.glob("profile-*/generation.json")):
        for record in json.loads(manifest.read_text()):
            checked += 1
            file = manifest.parent / record.get("filename", "")
            if not record.get("pass") or not file.is_file():
                failures.append({"profile": manifest.parent.name, "error": "generation failed"})
                continue
            if hashlib.sha256(file.read_bytes()).hexdigest() != record["sha256"]:
                failures.append({"file": str(file), "error": "generation checksum mismatch"})
                continue
            failures.extend({"file": str(file), "error": error} for error in question_block_errors(file, record.get("readerQuestion")))
    print(json.dumps({"documents": checked, "expectedDocuments": args.expected_documents, "failures": failures}))
    if checked != args.expected_documents or failures:
        raise SystemExit(1)
