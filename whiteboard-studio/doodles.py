"""Hand-drawable doodle library.

Every doodle is a function returning a list of strokes drawn inside a unit
square (0..1, y pointing down). A stroke is a dict:

    pts   list of (x, y) points, drawn in order like a pen would
    role  colour role: "ink", "a1", "a2" or "a3" (accents, set by the style)
    fill  optional colour role; the closed shape gets scribble-hatched
    w     line-width multiplier

A doodle can also write words (see T): {"text", "x", "y", "size", "role"}.
Doodles that take an argument are used as "name:argument", e.g.
"keycap:Alt+F5" or "t_account:Cash A/c".

The renderer scales the square into place, adds hand wobble and animates
each stroke being drawn.
"""
import math


def S(pts, role="ink", fill=None, w=1.0):
    return {"pts": list(pts), "role": role, "fill": fill, "w": w}


def T(text, x, y, size=0.12, role="ink", bold=False, max_w=0.9):
    """Text written by the pen, centred on (x, y); size is a fraction of the doodle."""
    return {"text": text, "x": x, "y": y, "size": size, "role": role, "bold": bold, "max_w": max_w}


def arc(cx, cy, rx, ry, a0, a1, n=None):
    n = n or max(8, int(abs(a1 - a0) / 6))
    return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def circle(cx, cy, r, start=-90):
    return arc(cx, cy, r, r, start, start + 360)


def ellipse(cx, cy, rx, ry, start=-90):
    return arc(cx, cy, rx, ry, start, start + 360)


def rect(x, y, w, h):
    return [(x, y), (x + w, y), (x + w, y + h), (x, y + h), (x, y)]


def rrect(x, y, w, h, r):
    pts = []
    pts += arc(x + w - r, y + r, r, r, -90, 0, 6)
    pts += arc(x + w - r, y + h - r, r, r, 0, 90, 6)
    pts += arc(x + r, y + h - r, r, r, 90, 180, 6)
    pts += arc(x + r, y + r, r, r, 180, 270, 6)
    return pts + [pts[0]]


def arrow_head(x0, y0, x1, y1, size=0.08, spread=28):
    a = math.atan2(y1 - y0, x1 - x0)
    p = lambda d: (x1 - size * math.cos(a + math.radians(d)), y1 - size * math.sin(a + math.radians(d)))
    return [p(spread), (x1, y1), p(-spread)]


def star_pts(cx, cy, r_out, r_in, n=5):
    pts = []
    for i in range(n * 2 + 1):
        r = r_out if i % 2 == 0 else r_in
        a = math.radians(-90 + i * 180 / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


# ---------------------------------------------------------------- doodles

def lightbulb():
    glass = [(0.41, 0.70)] + arc(0.5, 0.38, 0.25, 0.25, 125, 415) + [(0.59, 0.70)]
    rays = []
    for a in (-160, -125, -90, -55, -20):
        r = math.radians(a)
        rays.append(S([(0.5 + 0.32 * math.cos(r), 0.38 + 0.32 * math.sin(r)),
                       (0.5 + 0.43 * math.cos(r), 0.38 + 0.43 * math.sin(r))], "a3"))
    return [S(glass, fill="a3"),
            S([(0.44, 0.66), (0.46, 0.50), (0.5, 0.58), (0.54, 0.50), (0.56, 0.66)], "a1", w=0.7),
            S([(0.40, 0.73), (0.60, 0.73)]), S([(0.41, 0.79), (0.59, 0.79)]),
            S([(0.43, 0.85), (0.57, 0.85)]), S([(0.47, 0.91), (0.53, 0.91)])] + rays


def arrow_right():
    return [S([(0.08, 0.52), (0.35, 0.47), (0.62, 0.53), (0.88, 0.5)], "a1", w=1.3),
            S(arrow_head(0.62, 0.53, 0.9, 0.5, 0.16), "a1", w=1.3)]


def arrow_down():
    return [S([(0.5, 0.08), (0.47, 0.5), (0.5, 0.9)], "a1", w=1.3),
            S(arrow_head(0.5, 0.6, 0.5, 0.92, 0.16), "a1", w=1.3)]


def growth_chart():
    line = [(0.18, 0.75), (0.32, 0.66), (0.44, 0.70), (0.56, 0.52), (0.68, 0.48), (0.84, 0.18)]
    return [S([(0.12, 0.08), (0.12, 0.88), (0.94, 0.88)]),
            S(line, "a3", w=1.3), S(arrow_head(0.68, 0.48, 0.86, 0.15, 0.1), "a3", w=1.3)]


def decline_chart():
    line = [(0.18, 0.2), (0.32, 0.32), (0.44, 0.28), (0.56, 0.5), (0.68, 0.55), (0.84, 0.8)]
    return [S([(0.12, 0.08), (0.12, 0.88), (0.94, 0.88)]),
            S(line, "a1", w=1.3), S(arrow_head(0.68, 0.55, 0.86, 0.82, 0.1), "a1", w=1.3)]


def bar_chart():
    out = [S([(0.1, 0.08), (0.1, 0.9), (0.94, 0.9)])]
    for i, (h, role) in enumerate([(0.2, "a2"), (0.35, "a2"), (0.52, "a3"), (0.72, "a1")]):
        x = 0.18 + i * 0.19
        out.append(S(rect(x, 0.9 - h, 0.13, h), role, fill=role))
    return out


def check():
    return [S(circle(0.5, 0.5, 0.4), "a3"),
            S([(0.3, 0.52), (0.45, 0.67), (0.72, 0.34)], "a3", w=1.5)]


def cross():
    return [S(circle(0.5, 0.5, 0.4), "a1"),
            S([(0.33, 0.33), (0.67, 0.67)], "a1", w=1.5), S([(0.67, 0.33), (0.33, 0.67)], "a1", w=1.5)]


def star():
    return [S(star_pts(0.5, 0.53, 0.42, 0.18), "a3", fill="a3")]


def heart():
    pts = []
    for i in range(0, 73):
        t = math.radians(i * 5)
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((0.5 + x / 38, 0.46 - y / 38))
    return [S(pts, "a1", fill="a1")]


def clock():
    ticks = []
    for i in range(12):
        a = math.radians(i * 30)
        l = 0.07 if i % 3 == 0 else 0.04
        ticks.append(S([(0.5 + 0.36 * math.cos(a), 0.5 + 0.36 * math.sin(a)),
                        (0.5 + (0.36 - l) * math.cos(a), 0.5 + (0.36 - l) * math.sin(a))], w=0.6))
    return [S(circle(0.5, 0.5, 0.42))] + ticks + [
        S([(0.5, 0.5), (0.5, 0.25)], "a1", w=1.2), S([(0.5, 0.5), (0.68, 0.58)], "a1", w=1.2)]


def dollar_sign(cx, cy, s, role="ink", w=1.0):
    top = arc(cx, cy - 0.16 * s, 0.15 * s, 0.15 * s, -20, -270, 18)
    bot = arc(cx, cy + 0.14 * s, 0.15 * s, 0.15 * s, -90, 160, 18)
    return [S(top + bot, role, w=w), S([(cx, cy - 0.42 * s), (cx, cy + 0.42 * s)], role, w=w)]


def coin():
    return [S(circle(0.5, 0.5, 0.42), "a3", fill="a3"), S(circle(0.5, 0.5, 0.34), w=0.6)] + \
        dollar_sign(0.5, 0.5, 0.6, w=1.1)


def money():
    out = []
    for i, y in enumerate((0.78, 0.66, 0.54)):
        out.append(S(ellipse(0.38, y, 0.24, 0.07), "a3", fill="a3" if i == 2 else None))
    out.append(S(rrect(0.56, 0.2, 0.36, 0.22, 0.04), "a3"))
    out.append(S(circle(0.74, 0.31, 0.07)))
    out.append(S(rrect(0.5, 0.48, 0.4, 0.24, 0.04), "a3", fill="a3"))
    out.append(S(circle(0.7, 0.6, 0.07)))
    return out


def person(cx=0.5, s=1.0, role="ink"):
    hy = 0.2
    return [S(circle(cx, hy, 0.11 * s), role),
            S([(cx, hy + 0.11 * s), (cx, hy + 0.48 * s)], role),
            S([(cx - 0.2 * s, hy + 0.36 * s), (cx, hy + 0.22 * s), (cx + 0.2 * s, hy + 0.36 * s)], role),
            S([(cx - 0.16 * s, hy + 0.74 * s), (cx, hy + 0.48 * s), (cx + 0.16 * s, hy + 0.74 * s)], role),
            S(arc(cx, hy + 0.01 * s, 0.05 * s, 0.04 * s, 20, 160, 8), role, w=0.6)]


def people():
    return person(0.28, 0.85) + person(0.72, 0.85, "a2") + person(0.5, 0.95)


def target():
    return [S(circle(0.45, 0.55, 0.38), "a1"), S(circle(0.45, 0.55, 0.25)),
            S(circle(0.45, 0.55, 0.11), "a1", fill="a1"),
            S([(0.92, 0.08), (0.47, 0.53)], w=1.1), S(arrow_head(0.8, 0.2, 0.47, 0.53, 0.09))]


def rocket():
    body = [(0.5, 0.06), (0.62, 0.22), (0.64, 0.62), (0.36, 0.62), (0.38, 0.22), (0.5, 0.06)]
    return [S(body, fill="a2"),
            S(circle(0.5, 0.33, 0.07), "a2"),
            S([(0.38, 0.45), (0.25, 0.62), (0.36, 0.62)], "a1", fill="a1"),
            S([(0.62, 0.45), (0.75, 0.62), (0.64, 0.62)], "a1", fill="a1"),
            S([(0.42, 0.66), (0.46, 0.86), (0.5, 0.74), (0.54, 0.92), (0.58, 0.66)], "a3", fill="a3")]


def book():
    return [S([(0.5, 0.25)] + arc(0.3, 0.3, 0.2, 0.08, 0, -180, 12)[1:] + [(0.1, 0.8)] +
              arc(0.3, 0.8, 0.2, 0.06, 180, 360, 12)[1:] + [(0.5, 0.25)], fill="a2"),
            S([(0.5, 0.25)] + arc(0.7, 0.3, 0.2, 0.08, 180, 360, 12)[1:] + [(0.9, 0.8)] +
              arc(0.7, 0.8, 0.2, 0.06, 0, -180, 12)[1:] + [(0.5, 0.25)]),
            S([(0.6, 0.4), (0.82, 0.38)], "a2", w=0.6), S([(0.6, 0.5), (0.82, 0.48)], "a2", w=0.6),
            S([(0.6, 0.6), (0.82, 0.58)], "a2", w=0.6)]


def house():
    return [S([(0.12, 0.45), (0.5, 0.12), (0.88, 0.45)], "a1", w=1.2),
            S([(0.2, 0.38), (0.2, 0.88), (0.8, 0.88), (0.8, 0.38)]),
            S(rect(0.42, 0.6, 0.16, 0.28), "a2", fill="a2"),
            S(rect(0.26, 0.48, 0.12, 0.12)), S(rect(0.62, 0.48, 0.12, 0.12))]


def phone():
    return [S(rrect(0.3, 0.06, 0.4, 0.88, 0.06)), S(rect(0.34, 0.16, 0.32, 0.62), "a2", fill="a2"),
            S(circle(0.5, 0.86, 0.035)), S([(0.45, 0.11), (0.55, 0.11)], w=0.6)]


def globe():
    return [S(circle(0.5, 0.5, 0.4), "a2"),
            S(ellipse(0.5, 0.5, 0.17, 0.4), "a2", w=0.7), S([(0.5, 0.1), (0.5, 0.9)], "a2", w=0.7),
            S([(0.1, 0.5), (0.9, 0.5)], "a2", w=0.7),
            S(arc(0.5, 0.05, 0.36, 0.3, 30, 150, 12), "a2", w=0.6),
            S(arc(0.5, 0.95, 0.36, 0.3, -30, -150, 12), "a2", w=0.6),
            S([(0.3, 0.3), (0.42, 0.26), (0.44, 0.4), (0.33, 0.44), (0.3, 0.3)], "a3", fill="a3"),
            S([(0.58, 0.56), (0.7, 0.54), (0.72, 0.7), (0.6, 0.74), (0.58, 0.56)], "a3", fill="a3")]


def trophy():
    cup = [(0.28, 0.12), (0.72, 0.12), (0.7, 0.36)] + arc(0.5, 0.36, 0.2, 0.2, 0, 180, 12)[1:] + [(0.28, 0.12)]
    return [S(cup, "a3", fill="a3"),
            S(arc(0.28, 0.27, 0.12, 0.1, 270, 90, 12)), S(arc(0.72, 0.27, 0.12, 0.1, -90, 90, 12)),
            S([(0.5, 0.56), (0.5, 0.74)]), S(rect(0.34, 0.74, 0.32, 0.12)),
            S(star_pts(0.5, 0.31, 0.08, 0.035), "a1", w=0.6)]


def calendar():
    out = [S(rrect(0.12, 0.16, 0.76, 0.72, 0.04)), S(rect(0.12, 0.16, 0.76, 0.16), "a1", fill="a1"),
           S([(0.3, 0.08), (0.3, 0.22)], w=1.2), S([(0.7, 0.08), (0.7, 0.22)], w=1.2)]
    for r in range(3):
        for c in range(4):
            x, y = 0.22 + c * 0.17, 0.44 + r * 0.14
            out.append(S([(x, y), (x + 0.06, y)], w=0.8))
    out.append(S(circle(0.56, 0.58, 0.07), "a1"))
    return out


def question():
    return [S(arc(0.5, 0.3, 0.2, 0.18, 190, 405, 24) + [(0.5, 0.52), (0.5, 0.64)], "a1", w=1.6),
            S(circle(0.5, 0.82, 0.035), "a1", fill="a1", w=1.4)]


def exclamation():
    return [S([(0.5, 0.1), (0.5, 0.64)], "a1", w=1.8), S(circle(0.5, 0.82, 0.04), "a1", fill="a1", w=1.4)]


def magnifier():
    return [S(circle(0.4, 0.4, 0.27), fill="a2"), S([(0.6, 0.6), (0.88, 0.88)], w=2.0)]


def battery(level=0.7):
    out = [S(rrect(0.1, 0.3, 0.72, 0.4, 0.05)), S(rect(0.82, 0.42, 0.06, 0.16), fill="ink")]
    n = max(1, round(level * 4))
    for i in range(n):
        role = "a3" if level > 0.4 else "a1"
        out.append(S(rect(0.15 + i * 0.165, 0.36, 0.12, 0.28), role, fill=role))
    return out


def battery_low():
    return battery(0.2)


def plant():
    return [S([(0.3, 0.66), (0.7, 0.66), (0.64, 0.92), (0.36, 0.92), (0.3, 0.66)], "a1", fill="a1"),
            S([(0.5, 0.66), (0.49, 0.45), (0.5, 0.2)], "a3", w=1.1),
            S([(0.5, 0.45)] + arc(0.34, 0.38, 0.16, 0.08, 20, 200, 10) + [(0.5, 0.45)], "a3", fill="a3"),
            S([(0.5, 0.32)] + arc(0.66, 0.25, 0.16, 0.08, 160, -20, 10) + [(0.5, 0.32)], "a3", fill="a3"),
            S(circle(0.5, 0.16, 0.05), "a3")]


def mountain():
    return [S([(0.04, 0.88), (0.38, 0.28), (0.56, 0.58), (0.68, 0.42), (0.96, 0.88), (0.04, 0.88)], fill="a2"),
            S([(0.3, 0.42), (0.38, 0.36), (0.44, 0.42)], w=0.7),
            S([(0.38, 0.28), (0.38, 0.06)]), S([(0.38, 0.06), (0.56, 0.12), (0.38, 0.18)], "a1", fill="a1")]


def speech():
    return [S(rrect(0.08, 0.12, 0.84, 0.56, 0.12)[:-1] + [(0.3, 0.68), (0.2, 0.88), (0.42, 0.68)], "a2"),
            S([(0.22, 0.32), (0.78, 0.32)], w=0.7), S([(0.22, 0.46), (0.62, 0.46)], w=0.7)]


def gear():
    pts = []
    teeth = 8
    for i in range(teeth * 4 + 1):
        a = math.radians(i * 360 / (teeth * 4))
        r = 0.4 if (i % 4) in (1, 2) else 0.31
        pts.append((0.5 + r * math.cos(a), 0.5 + r * math.sin(a)))
    return [S(pts, fill="a2"), S(circle(0.5, 0.5, 0.12), "a1")]


def hourglass():
    return [S([(0.25, 0.1), (0.75, 0.1)], w=1.3), S([(0.25, 0.9), (0.75, 0.9)], w=1.3),
            S([(0.3, 0.1), (0.3, 0.2), (0.48, 0.5), (0.3, 0.8), (0.3, 0.9)]),
            S([(0.7, 0.1), (0.7, 0.2), (0.52, 0.5), (0.7, 0.8), (0.7, 0.9)]),
            S([(0.36, 0.28), (0.64, 0.28), (0.5, 0.48), (0.36, 0.28)], "a3", fill="a3"),
            S([(0.5, 0.52), (0.5, 0.74)], "a3", w=0.6),
            S([(0.34, 0.86), (0.5, 0.74), (0.66, 0.86), (0.34, 0.86)], "a3", fill="a3")]


def brain():
    lobes = arc(0.32, 0.4, 0.17, 0.17, 100, 280, 14) + arc(0.5, 0.24, 0.15, 0.13, 190, 350, 12) + \
        arc(0.68, 0.4, 0.17, 0.17, 260, 440, 14) + arc(0.6, 0.66, 0.14, 0.12, 0, 150, 10) + \
        arc(0.4, 0.66, 0.14, 0.12, 30, 180, 10)
    return [S(lobes + [lobes[0]], "a1", fill="a1"),
            S([(0.5, 0.14), (0.47, 0.35), (0.53, 0.5), (0.5, 0.74)], w=0.7),
            S(arc(0.34, 0.48, 0.08, 0.06, 180, 360, 8), w=0.6), S(arc(0.66, 0.48, 0.08, 0.06, 180, 360, 8), w=0.6)]


def snowball():
    """A small ball rolling into a big one: compounding / momentum."""
    return [S([(0.04, 0.9), (0.96, 0.9)]),
            S(circle(0.16, 0.82, 0.07), "a2"),
            S([(0.26, 0.74), (0.38, 0.68)], "a2", w=0.6), S([(0.26, 0.82), (0.4, 0.8)], "a2", w=0.6),
            S(circle(0.66, 0.6, 0.29), "a2", fill="a2")]


def warning():
    return [S([(0.5, 0.1), (0.92, 0.86), (0.08, 0.86), (0.5, 0.1)], "a1", fill="a3", w=1.2),
            S([(0.5, 0.36), (0.5, 0.62)], w=1.5), S(circle(0.5, 0.74, 0.03), fill="ink")]


def subscribe():
    btn = rrect(0.04, 0.3, 0.6, 0.36, 0.08)
    bell = [(0.74, 0.62)] + arc(0.84, 0.44, 0.1, 0.14, 180, 360, 14) + [(0.94, 0.62), (0.74, 0.62)]
    return [S(btn, "a1", fill="a1"), S([(0.27, 0.4), (0.27, 0.56), (0.41, 0.48), (0.27, 0.4)], fill="ink"),
            S(bell, "a3", fill="a3"), S(arc(0.84, 0.64, 0.035, 0.035, 0, 180, 8), "a3"),
            S([(0.84, 0.25), (0.84, 0.3)], "a3"),
            S([(0.66, 0.3), (0.7, 0.36)], "a3", w=0.6), S([(1.0, 0.3), (0.97, 0.36)], "a3", w=0.6)]


def like():
    return [S([(0.2, 0.45), (0.34, 0.45), (0.34, 0.86), (0.2, 0.86), (0.2, 0.45)], "a2", fill="a2"),
            S([(0.34, 0.47), (0.5, 0.2), (0.56, 0.12), (0.62, 0.18), (0.58, 0.42), (0.82, 0.42),
               (0.86, 0.5), (0.8, 0.84), (0.34, 0.84)], "a2")]


# ------------------------------------------------------- accounting / Tally

def arrow_left():
    return [S([(0.92, 0.5), (0.65, 0.47), (0.38, 0.53), (0.12, 0.5)], "a1", w=1.3),
            S(arrow_head(0.38, 0.53, 0.1, 0.5, 0.16), "a1", w=1.3)]


def plus():
    return [S([(0.5, 0.25), (0.5, 0.75)], "a1", w=1.6), S([(0.25, 0.5), (0.75, 0.5)], "a1", w=1.6)]


def equals():
    return [S([(0.25, 0.42), (0.75, 0.42)], "a1", w=1.6), S([(0.25, 0.58), (0.75, 0.58)], "a1", w=1.6)]


def text(words="₹"):
    """Just words, written big: "text:₹5,000" or "text:Dr = Cr"."""
    # may spill past its square cell: a lone text doodle has the whole row to itself
    return [T(words, 0.5, 0.5, 0.3, "ink", bold=True, max_w=1.9)]


def label(words="Debit"):
    """Words in a rounded tag."""
    return [S(rrect(0.04, 0.32, 0.92, 0.36, 0.08), "a2", fill="a2"), T(words, 0.5, 0.5, 0.17, bold=True, max_w=0.82)]


def keycap(key="F5"):
    return [S(rrect(0.12, 0.2, 0.76, 0.6, 0.08)), S(rrect(0.2, 0.26, 0.6, 0.42, 0.05), "a2", w=0.6),
            T(key, 0.5, 0.47, 0.2, "a1", bold=True, max_w=0.52)]


def t_account(title=""):
    out = [S([(0.08, 0.3), (0.92, 0.3)], w=1.3), S([(0.5, 0.3), (0.5, 0.92)], w=1.3),
           T("Dr", 0.24, 0.4, 0.1, "a1", bold=True), T("Cr", 0.76, 0.4, 0.1, "a2", bold=True)]
    if title:
        out.insert(0, T(title, 0.5, 0.17, 0.12, bold=True, max_w=0.9))
    return out


def voucher(title="Voucher"):
    edge = [(0.2, 0.08), (0.8, 0.08), (0.8, 0.86)]
    for i in range(6):
        edge += [(0.8 - (i + 0.5) * 0.1, 0.92), (0.8 - (i + 1) * 0.1, 0.86)]
    return [S(edge + [(0.2, 0.08)]),
            S(rect(0.2, 0.08, 0.6, 0.16), "a3", fill="a3"), T(title, 0.5, 0.16, 0.08, bold=True, max_w=0.55),
            S([(0.28, 0.36), (0.72, 0.36)], w=0.5), S([(0.28, 0.46), (0.62, 0.46)], w=0.5),
            S([(0.28, 0.56), (0.72, 0.56)], w=0.5), T("₹", 0.32, 0.72, 0.12, "a1", bold=True),
            S([(0.4, 0.75), (0.72, 0.75)], "a1", w=0.8)]


def ledger(title="Ledger"):
    return [S(rrect(0.1, 0.08, 0.8, 0.84, 0.03), fill="a2"), S(rect(0.18, 0.14, 0.64, 0.14), w=0.8),
            T(title, 0.5, 0.21, 0.08, bold=True, max_w=0.58),
            S([(0.18, 0.36), (0.82, 0.36)], w=0.6), S([(0.5, 0.36), (0.5, 0.86)], w=0.6),
            S([(0.24, 0.48), (0.44, 0.48)], w=0.5), S([(0.24, 0.6), (0.4, 0.6)], w=0.5),
            S([(0.56, 0.48), (0.76, 0.48)], w=0.5), S([(0.56, 0.6), (0.72, 0.6)], w=0.5)]


def laptop(screen="TallyPrime"):
    out = [S(rrect(0.16, 0.14, 0.68, 0.48, 0.03)), S(rect(0.2, 0.18, 0.6, 0.4), "a2", w=0.6),
           S([(0.06, 0.74), (0.16, 0.62), (0.84, 0.62), (0.94, 0.74), (0.06, 0.74)], fill="ink"),
           S([(0.42, 0.68), (0.58, 0.68)], w=0.6)]
    if screen:
        out.append(T(screen, 0.5, 0.26, 0.06, "a2", bold=True, max_w=0.5))
    for i, wd in enumerate((0.4, 0.3, 0.36)):
        y = 0.36 + i * 0.07
        out.append(S([(0.26, y), (0.26 + wd, y)], "a3", w=0.7))
    return out


def school():
    out = [S([(0.06, 0.38), (0.5, 0.14), (0.94, 0.38), (0.06, 0.38)], "a1", fill="a1"),
           S([(0.1, 0.38), (0.1, 0.9), (0.9, 0.9), (0.9, 0.38)]),
           S(rect(0.42, 0.66, 0.16, 0.24), "a2", fill="a2"),
           S([(0.5, 0.14), (0.5, 0.02)]), S([(0.5, 0.02), (0.64, 0.05), (0.5, 0.08)], "a3", fill="a3"),
           S(circle(0.5, 0.28, 0.04), w=0.6)]
    for x in (0.18, 0.3, 0.62, 0.74):
        out.append(S(rect(x, 0.48, 0.08, 0.1), w=0.7))
        out.append(S(rect(x, 0.7, 0.08, 0.1), w=0.7))
    return out


def student():
    return person(0.5, 1.0, "ink") + [
        S([(0.3, 0.08), (0.5, 0.0), (0.7, 0.08), (0.5, 0.15), (0.3, 0.08)], "a2", fill="a2"),
        S([(0.66, 0.1), (0.68, 0.24)], "a3", w=0.8),
        S(rect(0.6, 0.48, 0.16, 0.12), "a1", fill="a1")]


def teacher():
    return person(0.3, 0.9) + [S(rect(0.52, 0.12, 0.42, 0.34), "a2"),
                               S([(0.48, 0.38), (0.6, 0.3)], "a1", w=0.8),
                               T("A B C", 0.73, 0.29, 0.07, "a2", bold=True)]


def rupee():
    return [S(circle(0.5, 0.5, 0.42), "a3", fill="a3"), S(circle(0.5, 0.5, 0.34), w=0.6),
            T("₹", 0.5, 0.5, 0.4, bold=True)]


def bank():
    out = [S([(0.06, 0.32), (0.5, 0.08), (0.94, 0.32), (0.06, 0.32)], "a2", fill="a2"),
           S(rect(0.08, 0.32, 0.84, 0.06)), S(rect(0.04, 0.84, 0.92, 0.08)),
           T("BANK", 0.5, 0.24, 0.07, bold=True)]
    for x in (0.16, 0.34, 0.52, 0.7):
        out.append(S(rect(x, 0.42, 0.1, 0.38), w=0.8))
    return out


def scale():
    """A balanced scale with Dr and Cr pans: the trial balance tallies."""
    return [S([(0.5, 0.12), (0.5, 0.86)], w=1.2), S([(0.32, 0.92), (0.68, 0.92)], w=1.2),
            S(circle(0.5, 0.12, 0.03), fill="ink"),
            S([(0.12, 0.2), (0.88, 0.2)], w=1.1),
            S([(0.12, 0.2), (0.05, 0.56)], w=0.5), S([(0.12, 0.2), (0.29, 0.56)], w=0.5),
            S([(0.88, 0.2), (0.71, 0.56)], w=0.5), S([(0.88, 0.2), (0.95, 0.56)], w=0.5),
            S(arc(0.17, 0.56, 0.13, 0.1, 0, 180, 12) + [(0.04, 0.56), (0.3, 0.56)], "a1", fill="a1"),
            S(arc(0.83, 0.56, 0.13, 0.1, 0, 180, 12) + [(0.7, 0.56), (0.96, 0.56)], "a2", fill="a2"),
            T("Dr", 0.17, 0.46, 0.09, "a1", bold=True), T("Cr", 0.83, 0.46, 0.09, "a2", bold=True)]


def calculator():
    out = [S(rrect(0.24, 0.06, 0.52, 0.88, 0.05)), S(rect(0.3, 0.12, 0.4, 0.16), "a2", fill="a2")]
    for r in range(4):
        for c in range(3):
            x, y = 0.32 + c * 0.13, 0.36 + r * 0.14
            out.append(S(rrect(x, y, 0.09, 0.09, 0.015), "a1" if (r, c) == (3, 2) else "ink", w=0.6))
    return out


# ------------------------------------------------------------ GST / business

def percent(value="18%"):
    return [S(circle(0.5, 0.5, 0.42), "a1", fill="a1"), S(circle(0.5, 0.5, 0.35), w=0.6),
            T(value, 0.5, 0.5, 0.26, bold=True, max_w=0.62)]


def invoice(title="Tax Invoice"):
    return [S(rect(0.18, 0.06, 0.64, 0.88)), S(rect(0.18, 0.06, 0.64, 0.14), "a2", fill="a2"),
            T(title, 0.5, 0.13, 0.08, bold=True, max_w=0.56),
            S([(0.26, 0.3), (0.74, 0.3)], w=0.5), S([(0.26, 0.4), (0.66, 0.4)], w=0.5),
            S([(0.26, 0.5), (0.74, 0.5)], w=0.5), S([(0.26, 0.6), (0.74, 0.6)], w=0.8),
            T("GST", 0.36, 0.72, 0.08, "a1", bold=True), S([(0.48, 0.72), (0.74, 0.72)], "a1", w=0.8),
            T("₹", 0.36, 0.84, 0.09, bold=True), S([(0.48, 0.84), (0.74, 0.84)], w=1.1)]


def shop(name=""):
    awning = [(0.1, 0.3), (0.9, 0.3), (0.94, 0.44)]
    for i in range(5):
        x = 0.94 - (i + 1) * 0.168
        awning += arc(x + 0.084, 0.44, 0.084, 0.06, 0, 180, 6)[1:]
    out = [S([(0.14, 0.3), (0.2, 0.1), (0.8, 0.1), (0.86, 0.3)]),
           S(awning + [(0.1, 0.3)], "a1", fill="a1"),
           S([(0.12, 0.5), (0.12, 0.9), (0.88, 0.9), (0.88, 0.5)]),
           S(rect(0.2, 0.58, 0.28, 0.22), "a2", fill="a2"), S(rect(0.58, 0.58, 0.2, 0.32))]
    if name:
        out.insert(1, T(name, 0.5, 0.2, 0.09, bold=True, max_w=0.56))
    return out


def factory():
    return [S([(0.06, 0.9), (0.06, 0.5), (0.26, 0.38), (0.26, 0.5), (0.46, 0.38), (0.46, 0.5), (0.66, 0.38),
               (0.66, 0.5), (0.94, 0.5), (0.94, 0.9), (0.06, 0.9)], fill="a2"),
            S([(0.72, 0.5), (0.72, 0.14), (0.84, 0.14), (0.84, 0.5)]),
            S(arc(0.84, 0.08, 0.06, 0.04, 180, 360, 8) + arc(0.96, 0.06, 0.05, 0.035, 180, 360, 8), "a3", w=0.7),
            S(rect(0.16, 0.66, 0.1, 0.1), "a3", fill="a3"), S(rect(0.4, 0.66, 0.1, 0.1), "a3", fill="a3"),
            S(rect(0.64, 0.66, 0.1, 0.24), "a1")]


def truck():
    return [S(rect(0.04, 0.3, 0.56, 0.4), "a2", fill="a2"),
            S([(0.6, 0.7), (0.6, 0.4), (0.8, 0.4), (0.94, 0.56), (0.94, 0.7), (0.6, 0.7)]),
            S([(0.66, 0.46), (0.78, 0.46), (0.86, 0.56), (0.66, 0.56), (0.66, 0.46)], w=0.6),
            S(circle(0.2, 0.74, 0.07), fill="ink"), S(circle(0.78, 0.74, 0.07), fill="ink"),
            T("GOODS", 0.32, 0.5, 0.08, bold=True, max_w=0.46)]


def state(name="West Bengal"):
    blob = [(0.32, 0.1), (0.52, 0.16), (0.6, 0.08), (0.74, 0.2), (0.7, 0.36), (0.86, 0.46), (0.8, 0.62),
            (0.88, 0.8), (0.66, 0.92), (0.46, 0.84), (0.3, 0.9), (0.16, 0.74), (0.2, 0.56), (0.1, 0.4),
            (0.2, 0.26), (0.32, 0.1)]
    return [S(blob, "a2", fill="a2"), T(name, 0.5, 0.5, 0.13, bold=True, max_w=0.8)]


def handcuffs():
    return [S(circle(0.24, 0.62, 0.16), w=1.6), S(circle(0.76, 0.62, 0.16), w=1.6),
            S(rect(0.33, 0.4, 0.08, 0.08), fill="ink"), S(rect(0.59, 0.4, 0.08, 0.08), fill="ink"),
            S(ellipse(0.46, 0.4, 0.05, 0.03)), S(ellipse(0.54, 0.4, 0.05, 0.03)),
            S([(0.08, 0.14), (0.92, 0.9)], "a1", w=1.8)]


def shield():
    body = [(0.5, 0.06), (0.86, 0.2), (0.82, 0.56)] + arc(0.5, 0.56, 0.32, 0.38, 0, 90, 8)[1:] + \
        arc(0.5, 0.56, 0.32, 0.38, 90, 180, 8)[1:] + [(0.14, 0.2), (0.5, 0.06)]
    return [S(body, "a2", fill="a2"), S([(0.34, 0.5), (0.46, 0.62), (0.68, 0.38)], "a3", w=1.5)]


def share():
    nodes = [(0.72, 0.22), (0.26, 0.5), (0.72, 0.78)]
    return [S([nodes[0], nodes[1], nodes[2]], "a2", w=1.2)] + \
        [S(circle(x, y, 0.13), "a2", fill="a2") for x, y in nodes]


def comment():
    bub = rrect(0.08, 0.14, 0.84, 0.56, 0.12)[:-1] + [(0.34, 0.7), (0.22, 0.9), (0.46, 0.7)]
    return [S(bub + [bub[0]], "a1", w=1.2)] + [S(circle(x, 0.42, 0.045), "a1", fill="a1") for x in (0.32, 0.5, 0.68)]


def news():
    return [S(rrect(0.08, 0.14, 0.84, 0.72, 0.03)), S(rect(0.14, 0.2, 0.72, 0.14), "a1", fill="a1"),
            T("NEWS", 0.5, 0.27, 0.1, bold=True, max_w=0.6),
            S(rect(0.14, 0.42, 0.3, 0.36), "a2", fill="a2"),
            S([(0.52, 0.46), (0.86, 0.46)], w=0.5), S([(0.52, 0.56), (0.86, 0.56)], w=0.5),
            S([(0.52, 0.66), (0.86, 0.66)], w=0.5), S([(0.52, 0.76), (0.76, 0.76)], w=0.5)]


DOODLES = {name: fn for name, fn in globals().items()
           if callable(fn) and not name.startswith("_") and fn.__module__ == __name__
           and name not in ("S", "T", "arc", "circle", "ellipse", "rect", "rrect", "arrow_head",
                            "star_pts", "dollar_sign", "person", "battery")}
DOODLES["person"] = lambda: person()
DOODLES["battery"] = lambda: battery()
