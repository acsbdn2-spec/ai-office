#!/usr/bin/env python3
"""Whiteboard Studio: turn a JSON script into a hand-drawn explainer video.

    python3 render.py scripts/compound-interest.json              # format from the script
    python3 render.py scripts/compound-interest.json --format short
    python3 render.py scripts/compound-interest.json --format both
    python3 render.py scripts/compound-interest.json --preview    # PNG per scene, no video

See README.md for the script format.
"""
import argparse
import bisect
import functools
import itertools
import json
import math
import os
import random
import re
import shutil
import subprocess
import sys
import tempfile
import wave

from PIL import Image, ImageDraw, ImageFilter, ImageFont

import doodles

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")
BENGALI_FONT = os.path.join(FONT_DIR, "HindSiliguri-SemiBold.ttf")
CAPTION_FONT = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
FPS = 30
SR = 44100
SS = 2  # strokes are drawn at 2x and downsampled, which antialiases them
TRANSITION = 0.5  # seconds for the slide between boards
PEN_SPEED = 2200  # max board pixels drawn per second

FORMATS = {"landscape": (1920, 1080), "short": (1080, 1920)}

STYLES = {
    "whiteboard": {
        "bg": (250, 250, 247), "ink": (30, 30, 36), "a1": (214, 48, 49), "a2": (31, 97, 201),
        "a3": (232, 160, 0), "highlight": None, "width": 7, "wobble": 1.3, "double": False,
        "head_font": "Caveat-Bold.ttf", "body_font": "Caveat-Bold.ttf", "bullet": "check",
        "rules": None,
    },
    "scribble": {
        "bg": (253, 250, 238), "ink": (30, 50, 135), "a1": (222, 70, 50), "a2": (0, 135, 120),
        "a3": (236, 160, 0), "highlight": (255, 232, 120), "width": 5, "wobble": 2.6, "double": True,
        "head_font": "Caveat-Bold.ttf", "body_font": "PatrickHand-Regular.ttf", "bullet": "arrow",
        "rules": (200, 218, 240), "margin": (238, 160, 160),
    },
}

BENGALI = re.compile("[ঀ-৿]")


@functools.lru_cache(maxsize=256)
def font(name, size, text_sample=""):
    path = BENGALI_FONT if BENGALI.search(text_sample) else os.path.join(FONT_DIR, name)
    if not os.path.exists(path):
        path = name  # allow an absolute path to any .ttf
    return ImageFont.truetype(path, size)


def tint(color, bg, amount):
    return tuple(int(c + (b - c) * amount) for c, b in zip(color, bg))


# ------------------------------------------------------------------ board

class Board:
    """A hi-res canvas plus its downsampled copy that becomes the video frame."""

    def __init__(self, w, h, style):
        self.w, self.h = w, h
        self.hi = Image.new("RGB", (w * SS, h * SS), style["bg"])
        d = ImageDraw.Draw(self.hi)
        if style.get("rules"):
            gap = 72 * SS
            for y in range(gap * 2, h * SS, gap):
                d.line([(0, y), (w * SS, y)], fill=style["rules"], width=2 * SS)
            mx = (130 if w > h else 70) * SS
            d.line([(mx, 0), (mx, h * SS)], fill=style["margin"], width=2 * SS)
        self.draw = d
        self.lo = self.hi.resize((w, h), Image.BOX)

    def flush(self, x0, y0, x1, y1):
        x0 = max(0, int(x0) // SS * SS - SS)
        y0 = max(0, int(y0) // SS * SS - SS)
        x1 = min(self.w * SS, (int(x1) // SS + 2) * SS)
        y1 = min(self.h * SS, (int(y1) // SS + 2) * SS)
        if x1 <= x0 or y1 <= y0:
            return
        region = self.hi.crop((x0, y0, x1, y1)).resize(((x1 - x0) // SS, (y1 - y0) // SS), Image.BOX)
        self.lo.paste(region, (x0 // SS, y0 // SS))


# --------------------------------------------------------------- elements
# Each element knows its cost (how long the pen spends on it) and how to
# advance to a fraction 0..1, returning the pen tip in frame coordinates.

class PathEl:
    def __init__(self, pts, color, width, speed=1.0):
        self.pts, self.color, self.width = pts, color, max(2, int(width))
        self.cum = [0.0]
        for (ax, ay), (bx, by) in zip(pts, pts[1:]):
            self.cum.append(self.cum[-1] + math.hypot(bx - ax, by - ay))
        self.cost = self.cum[-1] / SS / speed + 2
        self.next_i, self.last = 1, pts[0]
        self.start, self.end = pts[0], pts[-1]

    def advance(self, board, frac):
        target = frac * self.cum[-1]
        seg = [self.last]
        while self.next_i < len(self.pts) and self.cum[self.next_i] <= target:
            seg.append(self.pts[self.next_i])
            self.next_i += 1
        if self.next_i < len(self.pts):
            a, b = self.pts[self.next_i - 1], self.pts[self.next_i]
            span = self.cum[self.next_i] - self.cum[self.next_i - 1] or 1
            t = (target - self.cum[self.next_i - 1]) / span
            seg.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
        self.last = seg[-1]
        if len(seg) >= 2:
            r = self.width / 2
            board.draw.line(seg, fill=self.color, width=self.width, joint="curve")
            for x, y in (seg[0], seg[-1]):
                board.draw.ellipse((x - r, y - r, x + r, y + r), fill=self.color)
            xs, ys = [p[0] for p in seg], [p[1] for p in seg]
            board.flush(min(xs) - r - 2, min(ys) - r - 2, max(xs) + r + 2, max(ys) + r + 2)
        return self.last[0] / SS, self.last[1] / SS


class TextEl:
    def __init__(self, text, fnt, color, x, y):
        l, t, r, b = fnt.getbbox(text)
        pad = 8 * SS
        self.layer = Image.new("RGBA", (r - l + pad * 2, b - t + pad * 2), (0, 0, 0, 0))
        ImageDraw.Draw(self.layer).text((pad - l, pad - t), text, font=fnt, fill=color)
        self.x, self.y = int(x + l - pad), int(y + t - pad)
        self.w, self.h = self.layer.size
        self.done = 0
        self.cost = (r - l) / SS * 1.5 + 4
        mid = self.y + self.h / 2
        self.start, self.end = (self.x + pad, mid), (self.x + self.w - pad, mid)

    def advance(self, board, frac):
        rx = int(self.w * frac)
        if rx > self.done:
            piece = self.layer.crop((self.done, 0, rx, self.h))
            board.hi.paste(piece, (self.x + self.done, self.y), piece)
            board.flush(self.x + self.done, self.y, self.x + rx, self.y + self.h)
            self.done = rx
        bob = math.sin(rx / (self.h * 0.09 + 1)) * self.h * 0.16
        return (self.x + rx) / SS, (self.y + self.h * 0.55 + bob) / SS


class TravelEl:
    def __init__(self, a, b):
        self.a, self.b = a, b
        self.cost = math.hypot(b[0] - a[0], b[1] - a[1]) / SS * 0.18

    def advance(self, board, frac):
        e = frac * frac * (3 - 2 * frac)
        return ((self.a[0] + (self.b[0] - self.a[0]) * e) / SS, (self.a[1] + (self.b[1] - self.a[1]) * e) / SS)


# ------------------------------------------------------------ geometry

def humanize(pts, amp, rng, step=3 * SS):
    """Resample a polyline and add a slow, hand-like wobble."""
    res = [pts[0]]
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        n = max(1, int(math.hypot(bx - ax, by - ay) / step))
        res += [(ax + (bx - ax) * i / n, ay + (by - ay) * i / n) for i in range(1, n + 1)]
    if amp <= 0 or len(res) < 3:
        return res
    p1, p2 = rng.uniform(0, 6.3), rng.uniform(0, 6.3)
    out, length = [], 0.0
    for i, (x, y) in enumerate(res):
        if i:
            length += math.hypot(x - res[i - 1][0], y - res[i - 1][1])
        a, b = res[max(0, i - 1)], res[min(len(res) - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        d = math.hypot(dx, dy) or 1
        off = amp * (0.7 * math.sin(length / (60 * SS) + p1) + 0.3 * math.sin(length / (17 * SS) + p2))
        out.append((x - dy / d * off, y + dx / d * off))
    return out


def hatch(poly, spacing, angle=-35):
    """Zig-zag scribble that fills a closed polygon."""
    a = math.radians(angle)
    ca, sa = math.cos(a), math.sin(a)
    rot = [(x * ca + y * sa, -x * sa + y * ca) for x, y in poly]
    ys = [p[1] for p in rot]
    rows, y = [], min(ys) + spacing * 0.6
    while y < max(ys) - spacing * 0.3:
        xs = []
        for (x1, y1), (x2, y2) in zip(rot, rot[1:] + rot[:1]):
            if (y1 <= y < y2) or (y2 <= y < y1):
                xs.append(x1 + (y - y1) * (x2 - x1) / (y2 - y1))
        if len(xs) >= 2:
            xs.sort()
            inset = min(spacing * 0.35, (xs[-1] - xs[0]) / 3)
            row = [(xs[0] + inset, y), (xs[-1] - inset, y)]
            rows.append(row if len(rows) % 2 == 0 else row[::-1])
        y += spacing
    path = [p for row in rows for p in row]
    return [(x * ca - y * sa, x * sa + y * ca) for x, y in path]


# --------------------------------------------------------------- layout

def wrap(text, fnt, max_w):
    lines, cur = [], ""
    for word in text.split():
        t = (cur + " " + word).strip()
        if not cur or fnt.getlength(t) <= max_w:
            cur = t
        else:
            lines.append(cur)
            cur = word
    return lines + ([cur] if cur else [])


def fit(texts, font_name, box_w, box_h, max_size, min_size, max_lines, gap=0.35):
    """Largest font size at which all texts wrap into the box."""
    for size in range(max_size, min_size - 1, -4):
        fnts = [font(font_name, size * SS, t) for t in texts]
        wrapped = [wrap(t, f, box_w) for t, f in zip(texts, fnts)]
        line_h = size * SS * 1.12
        total = sum(len(w) for w in wrapped) * line_h + gap * line_h * (len(texts) - 1)
        if all(len(w) <= max_lines for w in wrapped) and total <= box_h:
            return size, fnts, wrapped, line_h
    size = min_size
    fnts = [font(font_name, size * SS, t) for t in texts]
    return size, fnts, [wrap(t, f, box_w) for t, f in zip(texts, fnts)], size * SS * 1.12


def regions(w, h, has_head, has_doodle, has_points, captions):
    """Boxes (x, y, w, h) in frame pixels for heading, doodle and points."""
    if w > h:  # landscape
        top = 230 if has_head else 70
        if not has_doodle and not has_points:
            return {"head": (120, 140, w - 240, h - 280)}
        r = {"head": (100, 50, w - 200, 160)}
        if has_doodle and has_points:
            r["doodle"] = (90, top, 720, h - top - 70)
            r["points"] = (850, top + 10, w - 950, h - top - 90)
        elif has_doodle:
            r["doodle"] = (100, top, w - 200, h - top - 60)
        else:
            r["points"] = (220, top + 10, w - 440, h - top - 90)
        return r
    bottom = h - (400 if captions else 120)
    if not has_doodle and not has_points:
        return {"head": (70, 300, w - 140, bottom - 400)}
    r = {"head": (50, 110, w - 100, 360)}
    top = 500 if has_head else 160
    if has_doodle and has_points:
        split = top + (bottom - top) * 0.5
        r["doodle"] = (60, top, w - 120, split - top - 30)
        r["points"] = (80, split, w - 160, bottom - split)
    elif has_doodle:
        r["doodle"] = (60, top, w - 120, bottom - top)
    else:
        r["points"] = (80, top, w - 160, bottom - top)
    return r


# ---------------------------------------------------------- scene build

def build_scene(scene, style, w, h, rng, captions):
    names = scene.get("doodle") or []
    names = [names] if isinstance(names, str) else names
    for n in names:
        if n not in doodles.DOODLES:
            sys.exit(f"Unknown doodle '{n}'. Available: {', '.join(sorted(doodles.DOODLES))}")
    head = scene.get("heading", "")
    points = scene.get("points", [])
    reg = regions(w, h, bool(head), bool(names), bool(points), captions)
    els = []
    width = style["width"] * SS
    colors = {k: style[k] for k in ("ink", "a1", "a2", "a3")}

    def add_path(pts, color, wid, speed=1.0, wobble=None):
        amp = (style["wobble"] if wobble is None else wobble) * SS
        els.append(PathEl(humanize(pts, amp, rng), color, wid, speed))
        if style["double"] and wobble is None:
            els.append(PathEl(humanize(pts, amp * 1.3, rng), color, wid * 0.55, speed * 2.2))

    # heading
    if head:
        bx, by, bw, bh = [v * SS for v in reg["head"]]
        title_card = not names and not points
        max_size = 170 if title_card else (120 if w > h else 150)
        size, fnts, wrapped, lh = fit([head], style["head_font"], bw, bh, max_size, 40, 2 if w > h and not title_card else 3)
        lines, fnt = wrapped[0], fnts[0]
        y = by + (bh - len(lines) * lh) / 2
        widest = max(fnt.getlength(l) for l in lines)
        if style["highlight"]:
            last_w = fnt.getlength(lines[-1])
            hy = y + (len(lines) - 0.42) * lh
            add_path([(bx + (bw - last_w) / 2 - 10 * SS, hy), (bx + (bw + last_w) / 2 + 10 * SS, hy - 4 * SS)],
                     style["highlight"], lh * 0.42, speed=2.5, wobble=0.6)
        for line in lines:
            lw = fnt.getlength(line)
            els.append(TextEl(line, fnt, style["ink"], bx + (bw - lw) / 2, y))
            ink_bottom = y + fnt.getbbox(line)[3]
            y += lh
        if not style["highlight"]:
            uy = ink_bottom + 10 * SS
            add_path([(bx + (bw - widest) / 2, uy), (bx + (bw + widest) / 2, uy - 3 * SS)],
                     style["a1"], width * 0.9, speed=1.6)

    # doodles, side by side
    if names:
        bx, by, bw, bh = [v * SS for v in reg["doodle"]]
        n = len(names)
        horizontal = bw >= bh or n > 1
        cell = min(bw / n, bh) if horizontal else min(bw, bh / n)
        for i, name in enumerate(names):
            if horizontal:
                cx = bx + (bw - cell * n) / 2 + cell * i
                cy = by + (bh - cell) / 2
            else:
                cx, cy = bx + (bw - cell) / 2, by + (bh - cell) / 2 + cell * i
            pad = cell * 0.06
            size = cell - pad * 2
            scale = max(0.6, min(1.4, (size / SS / 520) ** 0.5))
            for st in doodles.DOODLES[name]():
                pts = [(cx + pad + x * size, cy + pad + y * size) for x, y in st["pts"]]
                color = colors[st["role"]]
                add_path(pts, color, width * scale * st["w"])
                if st["fill"]:
                    fill_color = tint(colors[st["fill"]], style["bg"], 0.45)
                    zz = hatch(pts, 11 * SS * scale)
                    if len(zz) > 2:
                        els.append(PathEl(humanize(zz, SS * 0.8, rng), fill_color, width * scale * 0.55, 3.2))

    # bullet points
    if points:
        bx, by, bw, bh = [v * SS for v in reg["points"]]
        indent = 70 * SS
        size, fnts, wrapped, lh = fit(points, style["body_font"], bw - indent, bh,
                                      100, 34, 3, gap=0.45)
        total = sum(len(wl) for wl in wrapped) * lh + 0.45 * lh * (len(points) - 1)
        y = by + max(0, (bh - total) / 2)
        bullet = scene.get("bullet", style["bullet"])
        for i, (lines, fnt) in enumerate(zip(wrapped, fnts)):
            cy = y + lh * 0.55
            s = size * SS * 0.42
            x0 = bx + 10 * SS
            if bullet == "number":
                nf = font(style["head_font"], int(size * SS * 1.05))
                els.append(TextEl(f"{i + 1}.", nf, style["a1"], x0, y - lh * 0.04))
            elif bullet == "arrow":
                add_path([(x0, cy), (x0 + s * 1.3, cy)], style["a1"], width * 0.8, 1.5)
                add_path(doodles.arrow_head(x0, cy, x0 + s * 1.35, cy, s * 0.55), style["a1"], width * 0.8, 1.5)
            elif bullet == "dot":
                add_path(doodles.circle(x0 + s * 0.5, cy, s * 0.22), style["a1"], width * 1.2, 1.5)
            else:
                add_path([(x0, cy), (x0 + s * 0.45, cy + s * 0.45), (x0 + s * 1.2, cy - s * 0.6)],
                         style["a3"] if style["highlight"] is None else style["a2"], width * 0.95, 1.5)
            for line in lines:
                els.append(TextEl(line, fnt, style["ink"], bx + indent, y))
                y += lh
            y += 0.45 * lh

    # pen travel between elements
    out, prev = [], None
    for el in els:
        if prev is not None:
            out.append(TravelEl(prev.end, el.start))
        out.append(el)
        prev = el
    return out


# ------------------------------------------------------------- sprites

@functools.lru_cache(maxsize=16)
def pen_sprite(color):
    """A marker seen at an angle; the tip sits at the returned offset."""
    size = 380
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ang = math.radians(52)
    ux, uy = math.cos(ang), math.sin(ang)
    nx, ny = -uy, ux
    tip = (24, 24)

    def quad(s0, s1, w0, w1, off=(0, 0)):
        p = lambda s, w, sign: (tip[0] + ux * s + nx * w * sign + off[0], tip[1] + uy * s + ny * w * sign + off[1])
        return [p(s0, w0, 1), p(s1, w1, 1), p(s1, w1, -1), p(s0, w0, -1)]

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).polygon(quad(10, 330, 8, 20, (26, 30)), fill=(0, 0, 0, 70))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(9)))
    d.polygon(quad(0, 14, 3, 7), fill=color)
    d.polygon(quad(14, 52, 7, 18), fill=(222, 222, 222))
    d.polygon(quad(52, 300, 19, 19), fill=(45, 45, 52))
    d.polygon(quad(60, 120, 19.5, 19.5), fill=color)
    d.polygon(quad(300, 340, 19, 15), fill=color)
    d.line([(tip[0] + ux * 130 + nx * 8, tip[1] + uy * 130 + ny * 8),
            (tip[0] + ux * 290 + nx * 8, tip[1] + uy * 290 + ny * 8)], fill=(110, 110, 120), width=4)
    return img, tip


def caption_chunks(text, duration):
    words = text.split()
    chunks, cur = [], []
    for wd in words:
        cur.append(wd)
        if len(cur) >= 4 or len(" ".join(cur)) > 20 or wd[-1:] in ".,!?;:":
            chunks.append(" ".join(cur))
            cur = []
    if cur:
        chunks.append(" ".join(cur))
    total = sum(len(c) + 3 for c in chunks) or 1
    t, out = 0.0, []
    for c in chunks:
        dt = duration * (len(c) + 3) / total
        out.append((t, t + dt, c))
        t += dt
    return out


@functools.lru_cache(maxsize=512)
def caption_image(text, frame_w, color):
    """Bold outlined caption; words are placed one by one so the outline can't swallow the spaces."""
    fnt_name = BENGALI_FONT if BENGALI.search(text) else CAPTION_FONT
    words, size = text.split(), 84
    while True:
        fnt = ImageFont.truetype(fnt_name, size)
        stroke, gap = max(4, size // 12), size * 0.34
        widths = [fnt.getlength(wd) for wd in words]
        total = sum(widths) + gap * (len(words) - 1)
        if total <= frame_w - 140 or size <= 40:
            break
        size -= 4
    asc, desc = fnt.getmetrics()
    img = Image.new("RGBA", (int(total) + stroke * 2 + 20, asc + desc + stroke * 2 + 20), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = 10 + stroke
    for wd, wdw in zip(words, widths):
        d.text((x, 10 + stroke), wd, font=fnt, fill=color, stroke_width=stroke, stroke_fill=(15, 15, 20))
        x += wdw + gap
    return img


# --------------------------------------------------------------- audio

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f"Command failed: {' '.join(cmd)}\n{r.stderr[-2000:]}")


def to_pcm(src, tmp):
    dst = os.path.join(tmp, f"a{random.randrange(10**9)}.wav")
    run(["ffmpeg", "-y", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-sample_fmt", "s16", dst])
    with wave.open(dst) as wf:
        return wf.readframes(wf.getnframes())


def narration(scene, cfg, tmp, base_dir):
    if scene.get("audio"):
        return to_pcm(os.path.join(base_dir, scene["audio"]), tmp)
    text = scene.get("say", "").strip()
    if not text or cfg["voice"] == "none":
        return b""
    raw = os.path.join(tmp, f"tts{random.randrange(10**9)}.wav")
    run(["espeak-ng", "-v", cfg["voice"], "-s", str(cfg["rate"]), "-p", str(cfg["pitch"]), "-w", raw, text])
    return to_pcm(raw, tmp)


# -------------------------------------------------------------- render

def render(script, base_dir, out_path, fmt, preview=False):
    w, h = FORMATS[fmt]
    style = dict(STYLES[script.get("style", "whiteboard")])
    style.update({k: tuple(v) for k, v in script.get("colors", {}).items()})
    cfg = {"voice": script.get("voice", "en-us+m3"), "rate": script.get("rate", 160),
           "pitch": script.get("pitch", 45)}
    captions = script.get("captions", fmt == "short")
    rng = random.Random(script.get("seed", 7))
    tmp = tempfile.mkdtemp(prefix="wbs_")
    stem = os.path.splitext(out_path)[0]

    try:
        if preview:
            for i, scene in enumerate(script["scenes"]):
                board = Board(w, h, style)
                for el in build_scene(scene, style, w, h, rng, captions):
                    el.advance(board, 1.0)
                path = f"{stem}_scene{i + 1:02d}.png"
                board.lo.save(path)
                print("wrote", path)
            return

        ff = subprocess.Popen(
            ["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}",
             "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
             "-pix_fmt", "yuv420p", os.path.join(tmp, "video.mp4")], stdin=subprocess.PIPE)
        audio = bytearray()
        spf = SR // FPS  # samples per frame
        prev_frame = None
        thumb_scene = next((i for i, s in enumerate(script["scenes"]) if s.get("thumbnail")), 0)
        n_frames = 0

        def emit(img):
            nonlocal n_frames
            ff.stdin.write(img.tobytes())
            n_frames += 1

        for si, scene in enumerate(script["scenes"]):
            voice = narration(scene, cfg, tmp, base_dir)
            spoken = len(voice) / 2 / SR
            if not voice:
                spoken = len(scene.get("say", "").split()) * 0.4
            board = Board(w, h, style)
            els = build_scene(scene, style, w, h, rng, captions)
            cost = sum(e.cost for e in els)
            draw_t = max(1.5, spoken * 0.85, cost / PEN_SPEED)
            dur = max(spoken + 0.8, draw_t + 0.9, scene.get("min_seconds", 0), 2.5) + scene.get("hold", 0)
            draw_n, scene_n = int(draw_t * FPS), int(dur * FPS)

            # slide the old board out and the new one in
            if prev_frame is not None:
                tn = int(TRANSITION * FPS)
                for f in range(tn):
                    e = (f + 1) / tn
                    e = e * e * (3 - 2 * e)
                    x = int(w * e)
                    frame = Image.new("RGB", (w, h))
                    frame.paste(prev_frame, (-x, 0))
                    frame.paste(board.lo, (w - x, 0))
                    emit(frame)
                audio += bytes(tn * spf * 2)

            chunks = caption_chunks(scene.get("say", ""), spoken) if captions else []
            bounds = [0] + list(itertools.accumulate(e.cost for e in els))
            pen_pos, idx = (w * 0.6, h * 1.1), 0
            cur_color = style["ink"]
            exit_from = None
            for f in range(scene_n):
                if f < draw_n:
                    target = (f + 1) / draw_n * cost
                    while idx < len(els) - 1 and bounds[idx + 1] < target:
                        els[idx].advance(board, 1.0)
                        idx += 1
                    el = els[idx]
                    frac = min(1.0, (target - bounds[idx]) / (el.cost or 1))
                    pen_pos = el.advance(board, frac)
                    if isinstance(el, TextEl):
                        cur_color = style["ink"]
                    elif isinstance(el, PathEl) and el.color != style["highlight"]:
                        cur_color = el.color
                if f == draw_n:
                    for el in els[idx:]:
                        el.advance(board, 1.0)
                    exit_from = pen_pos
                    if si == thumb_scene:
                        board.lo.save(f"{stem}_thumbnail.png")
                frame = board.lo.copy()
                if exit_from is not None:
                    t = min(1.0, (f - draw_n) / (0.6 * FPS))
                    pen_pos = (exit_from[0] + (w * 1.15 - exit_from[0]) * t * t,
                               exit_from[1] + (h * 1.2 - exit_from[1]) * t * t)
                if pen_pos[0] < w + 30 and pen_pos[1] < h + 30:
                    sprite, (tx, ty) = pen_sprite(cur_color if f < draw_n else style["ink"])
                    frame.paste(sprite, (int(pen_pos[0] - tx), int(pen_pos[1] - ty)), sprite)
                if chunks:
                    t = f / FPS
                    for c0, c1, text in chunks:
                        if c0 <= t < c1:
                            cap = caption_image(text, w, (255, 255, 255))
                            frame.paste(cap, ((w - cap.width) // 2, int(h * 0.84 - cap.height / 2)), cap)
                            break
                emit(frame)
            voice = voice[: scene_n * spf * 2]
            audio += voice + bytes(scene_n * spf * 2 - len(voice))
            prev_frame = board.lo.copy()
            print(f"  scene {si + 1}/{len(script['scenes'])}: {dur:.1f}s", flush=True)

        ff.stdin.close()
        if ff.wait():
            sys.exit("ffmpeg video encode failed")
        wav = os.path.join(tmp, "voice.wav")
        with wave.open(wav, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(SR)
            wf.writeframes(bytes(audio))
        cmd = ["ffmpeg", "-y", "-v", "error", "-i", os.path.join(tmp, "video.mp4"), "-i", wav]
        if script.get("music"):
            cmd += ["-stream_loop", "-1", "-i", os.path.join(base_dir, script["music"]),
                    "-filter_complex",
                    f"[2:a]volume={script.get('music_volume', 0.12)}[m];[1:a][m]amix=inputs=2:duration=first:normalize=0[a]",
                    "-map", "0:v", "-map", "[a]"]
        cmd += ["-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", out_path]
        run(cmd)
        print(f"wrote {out_path} ({n_frames / FPS:.1f}s)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("script", help="JSON script file")
    ap.add_argument("-o", "--out", help="output .mp4 (default: out/<script name>.mp4)")
    ap.add_argument("--format", choices=["landscape", "short", "both"], help="override the script's format")
    ap.add_argument("--style", choices=sorted(STYLES), help="override the script's style")
    ap.add_argument("--no-voice", action="store_true", help="silent video (record your own voiceover later)")
    ap.add_argument("--preview", action="store_true", help="write one PNG per scene instead of a video")
    a = ap.parse_args()

    with open(a.script, encoding="utf-8") as f:
        script = json.load(f)
    if a.style:
        script["style"] = a.style
    if a.no_voice:
        script["voice"] = "none"
    fmt = a.format or script.get("format", "landscape")
    name = os.path.splitext(os.path.basename(a.script))[0]
    os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    for fm in (["landscape", "short"] if fmt == "both" else [fmt]):
        out = a.out or os.path.join(HERE, "out", f"{name}{'-short' if fm == 'short' and fmt == 'both' else ''}.mp4")
        if fmt == "both" and a.out:
            out = os.path.splitext(a.out)[0] + ("-short" if fm == "short" else "") + ".mp4"
        print(f"Rendering {fm} -> {out}")
        render(script, os.path.dirname(os.path.abspath(a.script)), out, fm, a.preview)


if __name__ == "__main__":
    main()
