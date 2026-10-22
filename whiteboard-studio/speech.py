"""Turn narration written the way people type it into text a Bangla voice reads well.

    "GSTR-3B-তে ₹1,800 ITC, 18% GST, 1 July 2017"
 -> "জি এস টি আর থ্রি বিতে এক হাজার আটশো টাকা আই টি সি, আঠারো শতাংশ জি এস টি,
     পয়লা জুলাই দু হাজার সতেরো"

English words come from lexicon.json (editable). Acronyms are spelled letter by
letter, numbers become colloquial Kolkata Bangla. Words the lexicon doesn't
know are reported so they can be added.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))

ONES = ("শূন্য এক দুই তিন চার পাঁচ ছয় সাত আট নয় দশ এগারো বারো তেরো চোদ্দো পনেরো ষোলো সতেরো আঠারো উনিশ "
        "কুড়ি একুশ বাইশ তেইশ চব্বিশ পঁচিশ ছাব্বিশ সাতাশ আঠাশ উনত্রিশ তিরিশ একত্রিশ বত্রিশ তেত্রিশ চৌত্রিশ "
        "পঁয়ত্রিশ ছত্রিশ সাঁইত্রিশ আটত্রিশ উনচল্লিশ চল্লিশ একচল্লিশ বিয়াল্লিশ তেতাল্লিশ চুয়াল্লিশ পঁয়তাল্লিশ "
        "ছেচল্লিশ সাতচল্লিশ আটচল্লিশ উনপঞ্চাশ পঞ্চাশ একান্ন বাহান্ন তিপ্পান্ন চুয়ান্ন পঞ্চান্ন ছাপ্পান্ন সাতান্ন "
        "আটান্ন উনষাট ষাট একষট্টি বাষট্টি তেষট্টি চৌষট্টি পঁয়ষট্টি ছেষট্টি সাতষট্টি আটষট্টি উনসত্তর সত্তর "
        "একাত্তর বাহাত্তর তিয়াত্তর চুয়াত্তর পঁচাত্তর ছিয়াত্তর সাতাত্তর আটাত্তর উনআশি আশি একাশি বিরাশি তিরাশি "
        "চুরাশি পঁচাশি ছিয়াশি সাতাশি আটাশি উননব্বই নব্বই একানব্বই বিরানব্বই তিরানব্বই চুরানব্বই পঁচানব্বই "
        "ছিয়ানব্বই সাতানব্বই আটানব্বই নিরানব্বই").split()
HUNDREDS = [""] + "একশো দুশো তিনশো চারশো পাঁচশো ছশো সাতশো আটশো নশো".split()
DAYS = [""] + ("পয়লা দোসরা তেসরা চৌঠা পাঁচই ছয়ই সাতই আটই নয়ই দশই এগারোই বারোই তেরোই চোদ্দোই পনেরোই "
               "ষোলোই সতেরোই আঠারোই উনিশে কুড়ি একুশে বাইশে তেইশে চব্বিশে পঁচিশে ছাব্বিশে সাতাশে আঠাশে "
               "উনত্রিশে তিরিশে একত্রিশে").split()
EN_DIGITS = "জিরো ওয়ান টু থ্রি ফোর ফাইভ সিক্স সেভেন এইট নাইন".split()
LETTERS = dict(zip("ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                   "এ বি সি ডি ই এফ জি এইচ আই জে কে এল এম এন ও পি কিউ আর এস টি ইউ ভি ডাবলিউ এক্স ওয়াই জেড".split()))
MONTHS = ("January February March April May June July August September October November December "
          "জানুয়ারি ফেব্রুয়ারি মার্চ এপ্রিল মে জুন জুলাই আগস্ট সেপ্টেম্বর অক্টোবর নভেম্বর ডিসেম্বর").split()
BN_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")
BN = "ঀ-৿"


def number(n, before_unit=False):
    """Integer to spoken Bangla, Indian grouping: 2,24,500 -> দু লাখ চব্বিশ হাজার পাঁচশো."""
    if n < 100:
        return "দু" if n == 2 and before_unit else ONES[n]
    for size, unit in ((10 ** 7, "কোটি"), (10 ** 5, "লাখ"), (1000, "হাজার")):
        if n >= size:
            head, rest = divmod(n, size)
            out = f"{number(head, True)} {unit}"
            return f"{out} {number(rest)}" if rest else out
    head, rest = divmod(n, 100)
    return f"{HUNDREDS[head]} {ONES[rest]}" if rest else HUNDREDS[head]


def amount(text):
    """'1,800' / '1.5' / '2.5' -> words; halves become দেড় / আড়াই / সাড়ে."""
    text = text.replace(",", "")
    if "." in text:
        whole, frac = text.split(".", 1)
        whole = int(whole or 0)
        if frac.rstrip("0") == "5":
            return {0: "আধ", 1: "দেড়", 2: "আড়াই"}.get(whole, f"সাড়ে {number(whole)}")
        return f"{number(whole)} দশমিক {' '.join(ONES[int(d)] for d in frac)}"
    return number(int(text))


def year(n):
    if 1900 <= n < 2000:
        rest = n - 1900
        return "উনিশশো" + (f" {ONES[rest]}" if rest else "")
    return number(n, True) if n % 1000 == 0 else number(n)


CONSONANTS = set("কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহড়ঢ়য়")


def join_suffix(m):
    """Glue a typed '-এর' / '-এ' onto a Bangla word: বিল-এর -> বিলের, টাকা-এর -> টাকার."""
    word_end, suffix = m[1], m[2]
    if word_end in CONSONANTS:
        return word_end + "ে" + suffix[1:]
    return word_end + {"এর": "র", "এ": "য়", "এতে": "তে"}[suffix]


def load_lexicon(extra=None):
    with open(os.path.join(HERE, "lexicon.json"), encoding="utf-8") as f:
        lex = {k: v for k, v in json.load(f).items() if not k.startswith("_")}
    lex.update(extra or {})
    return lex


def spell(token, lex, unknown):
    """GSTR-1A -> জি এস টি আর ওয়ান এ; unknown English words are kept and reported."""
    words = []
    for part in re.findall(r"[A-Za-z]+|[0-9]+", token):
        if part.isdigit():
            words += [EN_DIGITS[int(d)] for d in part]
        elif part.lower() in lex:
            words.append(lex[part.lower()])
        elif part.isupper() or len(part) <= 2:
            words += [LETTERS[c] for c in part.upper()]
        else:
            unknown.add(part)
            words.append(part)
    return " ".join(words)


def speakable(text, lex=None, unknown=None):
    lex = {k.lower(): v for k, v in (lex if lex is not None else load_lexicon()).items()}
    unknown = set() if unknown is None else unknown
    t = text.translate(BN_DIGITS)

    # lexicon phrases first, longest first ("Input Tax Credit" before "Tax")
    for term in sorted(lex, key=len, reverse=True):
        if re.search(f"[{BN}]", term):  # Bangla-script entries, e.g. জিএসটি -> জি এস টি
            t = t.replace(term, lex[term])
        elif " " in term or "-" in term or "/" in term or not term.isalnum():
            t = re.sub(rf"(?<![A-Za-z0-9]){re.escape(term)}(?![A-Za-z0-9])", lex[term], t, flags=re.I)

    num = r"\d[\d,]*(?:\.\d+)?"
    units = "হাজার|লাখ|কোটি"
    # ₹1,800 / ₹1.5 কোটি / Rs 500
    t = re.sub(rf"(?:₹|Rs\.?\s?)\s?({num})(?:\s*({units}))?",
               lambda m: f"{amount(m[1])} {m[2] + ' ' if m[2] else ''}টাকা", t)
    t = re.sub(rf"({num})\s*%", lambda m: f"{amount(m[1])} শতাংশ", t)
    t = re.sub(rf"({num})\s*({units})", lambda m: f"{amount(m[1])} {m[2]}", t)
    # 350cc, 100 km: a number with a lowercase unit the lexicon knows
    t = re.sub(rf"({num})\s?([a-z]+)(?![A-Za-z0-9])",
               lambda m: f"{amount(m[1])} {lex[m[2]]}" if m[2] in lex else m[0], t)
    # 1 July 2017 / 22 সেপ্টেম্বর
    months = "|".join(MONTHS)
    t = re.sub(rf"(?<![\d.,])([1-9]|[12]\d|3[01])\s+({months})",
               lambda m: f"{DAYS[int(m[1])]} {lex.get(m[2].lower(), m[2])}", t)
    t = re.sub(r"(?<![\d.,A-Za-z-])(19\d\d|20\d\d)(?![\d,])", lambda m: year(int(m[1])), t)
    # codes that mix letters and digits (GSTR-1A, 3B, F5, CMP-08, B2B) and plain English words
    t = re.sub(r"[A-Za-z0-9]*[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*|[0-9]+[A-Za-z][A-Za-z0-9]*",
               lambda m: lex.get(m[0].lower()) or spell(m[0], lex, unknown), t)
    # whatever numbers are left
    t = re.sub(rf"(?<![A-Za-z]){num}", lambda m: amount(m[0]), t)
    t = re.sub(r"(\S)\+(?=\s|$|[,।?!])", r"\1-এর বেশি", t)  # ₹5 কোটি+ -> ...টাকার বেশি
    t = re.sub(rf"([{BN}])-(এর|এতে|এ)(?![{BN}])", join_suffix, t)
    t = re.sub(rf"-(?=[{BN}])", "", t)
    t = re.sub(r"\s*\+\s*", " যোগ ", t)
    t = re.sub(r"\s*=\s*", " মানে ", t)
    return re.sub(r"\s{2,}", " ", t).strip()


if __name__ == "__main__":
    import sys
    u = set()
    for line in sys.argv[1:] or [sys.stdin.read()]:
        print(speakable(line, unknown=u))
    if u:
        print("not in lexicon:", ", ".join(sorted(u)), file=sys.stderr)
