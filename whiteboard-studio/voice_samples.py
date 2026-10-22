#!/usr/bin/env python3
"""Read one typical narration with several voices and methods, so the best one can be picked by ear.

    python3 voice_samples.py [--out videos/voice-samples]

Needs the internet (run it in the "Voice samples" GitHub Action). Sarvam samples
are added only when SARVAM_API_KEY is set.
"""
import argparse
import os
import shutil
import subprocess
import sys
import tempfile

import render
import speech

TEXT = ("নমস্কার! আজকে সহজ ভাষায় দেখব, GSTR-1 আর GSTR-3B-র তফাৎ। "
        "ধরুন ₹1,800 GST দিয়েছেন, তাহলে সেটা ITC হিসেবে পাবেন। "
        "আর 3B জমা দেওয়ার শেষ তারিখ, পরের মাসের 20 তারিখ। "
        "ভিডিওটা ভালো লাগলে Like আর Share করুন!")

# (file name, engine, voice, speed, use pronunciation rules, what it shows)
SAMPLES = [
    ("01-tanishaa-without-rules", "edge", "bn-IN-TanishaaNeural", "-4%", False,
     "Current female voice, text sent as typed (how the voice copes with English on its own)"),
    ("02-tanishaa-with-rules", "edge", "bn-IN-TanishaaNeural", "-4%", True,
     "Current female voice with the new pronunciation rules"),
    ("03-tanishaa-with-rules-faster", "edge", "bn-IN-TanishaaNeural", "+8%", True,
     "Same, a little faster: suits Shorts"),
    ("04-bashkar-male-with-rules", "edge", "bn-IN-BashkarNeural", "+0%", True,
     "Male Kolkata voice"),
    ("05-nabanita-bangladesh-with-rules", "edge", "bn-BD-NabanitaNeural", "+0%", True,
     "Female Bangladeshi accent"),
    ("06-emma-multilingual-without-rules", "edge", "en-US-EmmaMultilingualNeural", "+0%", False,
     "Experimental multilingual voice, text as typed"),
    ("07-google-with-rules", "gtts", "bn-IN", "+0%", True,
     "Google Translate Bangla voice"),
    ("08-sarvam-ritu-without-rules", "sarvam", "bn-IN", "+0%", False,
     "Sarvam AI (Indian company), mixed Bangla-English as typed"),
    ("09-sarvam-ritu-with-rules", "sarvam", "bn-IN", "+0%", True,
     "Sarvam AI with the pronunciation rules"),
]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", default=os.path.join(render.HERE, "videos", "voice-samples"))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    lex = speech.load_lexicon()
    lines = ["# Voice samples", "", "Every file reads the same text:", "", f"> {TEXT}", "",
             "With the pronunciation rules the voice reads:", "", f"> {speech.speakable(TEXT, lex)}", "",
             "| File | What it is |", "|---|---|"]
    tmp = tempfile.mkdtemp()
    try:
        for name, engine, voice, speed, rules, note in SAMPLES:
            if engine == "sarvam" and not os.environ.get("SARVAM_API_KEY"):
                print(f"skip {name}: no SARVAM_API_KEY")
                continue
            cfg = {"voice": voice, "speed": speed, "tone": "+0Hz", "rate": 160, "pitch": 45,
                   "sarvam_speaker": "ritu", "sarvam_model": "bulbul:v3", "sarvam_language": "bn-IN",
                   "sarvam_pace": 1.0}
            text = speech.speakable(TEXT, lex) if rules else TEXT
            raw = os.path.join(tmp, name + (".wav" if engine == "sarvam" else ".mp3"))
            try:
                ok = render.ENGINES[engine](text, cfg, raw) is not None
            except Exception as e:  # noqa: BLE001 - a missing voice should not stop the others
                print(f"fail {name}: {e}", file=sys.stderr)
                continue
            if not ok:
                continue
            dst = os.path.join(a.out, name + ".mp3")
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-ac", "1", "-b:a", "96k", dst], check=True)
            lines.append(f"| `{name}.mp3` | {note} |")
            print("wrote", dst)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    with open(os.path.join(a.out, "README.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
