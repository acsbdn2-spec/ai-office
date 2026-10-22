# Whiteboard Studio

Turns a short JSON script into a hand-drawn **whiteboard** or **scribble** explainer video. A marker writes the headings and points, draws the doodles, and slides to a new board for each scene. A voiceover and captions are added automatically.

- **Long-form videos:** 1920×1080 landscape.
- **YouTube Shorts:** 1080×1920 vertical, with large captions burned in.
- **Four looks:** `whiteboard` (clean marker on a white board), `scribble` (ink on notebook paper with highlighter and hatched shading), `brand` (the channel's navy, amber and teal) and `chalkboard` (chalk on dark teal).
- **Bangla:** Bengali text uses Baloo Da 2 for headings and Atma for hand-written points. A natural neural voice (`bn-IN-TanishaaNeural`) reads the narration.
- **Channel strip:** the channel name, series and a "PART" badge, at the bottom of long videos and the top of Shorts.
- **Thumbnail:** a `*_thumbnail.png` is saved for every video.

## Quick start

```bash
cd whiteboard-studio
python3 render.py scripts/two-minute-rule.json                    # a Short
python3 render.py scripts/compound-interest.json                  # a long video
python3 render.py scripts/compound-interest.json --format both    # long video + Short from one script
python3 render.py scripts/compound-interest.json --preview        # one PNG per scene, renders in about a second
python3 render.py my-script.json --no-voice                       # silent, so you can record your own voice
```

Videos go to `out/`. A 30-second Short renders in about 15 seconds.

**Requirements:** Python 3 with Pillow (built with libraqm for Bangla) and `ffmpeg`. For voices: `pip install edge-tts gTTS` (online) or `apt-get install espeak-ng` (offline).

## Bangla videos with a natural voice (GitHub Actions)

The scripts in `scripts/bangla/` use the Microsoft Edge neural voice `bn-IN-TanishaaNeural`, which sounds like everyday spoken Bangla. It needs the internet, so the **Render whiteboard videos** GitHub Action renders them:

1. Add or edit a script in `whiteboard-studio/scripts/` and push it.
2. The Action renders only the scripts that changed. It commits the MP4s and thumbnails to `whiteboard-studio/videos/`.
3. To re-render manually, go to the Actions tab, choose **Render whiteboard videos**, then **Run workflow**.

If the neural voice is unreachable, the renderer falls back to Google's Bangla voice and then to `espeak-ng`.

### Pronunciation

Write `say` the way you'd type it, mixing Bangla and English: `"GSTR-3B-তে ₹1,800 ITC পাবেন।"`. Before the text reaches the voice, `speech.py` rewrites it:

| You write | The voice reads |
|---|---|
| `GSTR-3B`, `ITC`, `B2B`, `CMP-08` | জি এস টি আর থ্রি বি, আই টি সি, বি টু বি, সি এম পি জিরো এইট |
| `₹1,800`, `₹1.5 কোটি`, `₹2.5 লাখ` | এক হাজার আটশো টাকা, দেড় কোটি টাকা, আড়াই লাখ টাকা |
| `18%`, `350cc`, `100 km` | আঠারো শতাংশ, তিনশো পঞ্চাশ সিসি, একশো কিলোমিটার |
| `1 July 2017`, `22 September 2025` | পয়লা জুলাই দু হাজার সতেরো, বাইশে সেপ্টেম্বর দু হাজার পঁচিশ |
| `Bill-এর`, `₹50,000-এর`, `₹5 কোটি+` | বিলের, পঞ্চাশ হাজার টাকার, পাঁচ কোটি টাকার বেশি |
| `Invoice`, `Ledger`, `Composition` | ইনভয়েস, লেজার, কম্পোজিশন (from `lexicon.json`) |

- Captions show your text as written, so viewers see "GSTR-3B" while the voice says জি এস টি আর থ্রি বি.
- **Fix a word:** add it to `lexicon.json` (`"Word": "how it should sound"`), or to a script's own `"lexicon": {...}`. The render log lists English words the lexicon doesn't know yet.
- **Check before rendering:** `python3 render.py my-script.json --speech` prints exactly what the voice will read.
- **Turn it off:** `"pronounce": false` for a script, or `"raw_say": true` for one scene.
- With the neural voice, captions follow its sentence timings, so they stay in step with speech.

### Choosing a voice

Run the **Voice samples** Action (Actions tab, then Run workflow). It reads one paragraph with every voice option and commits the MP3s to `videos/voice-samples/`.

**Sarvam AI (optional):** Bulbul voices are built for Indian languages mixed with English. Get an API key at sarvam.ai and add it as a repository secret named `SARVAM_API_KEY` (Settings → Secrets and variables → Actions). Then set `"tts": "sarvam"` in a script, plus optionally `"sarvam_speaker"`.

Writing tips:
- Write in everyday chalti bhasha: "আজকে আমরা দেখব…", "মনে রাখুন…".
- Short sentences with commas give the voice natural pauses.

## Script format

```json
{
  "format": "short",              // "landscape" or "short"
  "style": "scribble",            // "whiteboard" or "scribble"
  "voice": "bn-IN-TanishaaNeural",// neural voice (bn-IN-BashkarNeural is male, bn-BD-NabanitaNeural is Bangladeshi)
                                  // or an espeak-ng voice: en-us+m3, bn, hi ... or "none"
  "speed": "-4%",                 // neural voice speed, e.g. "-10%" or "+5%"
  "rate": 165,                    // espeak-ng speed (words per minute)
  "tts": "edge",                  // force an engine: edge | gtts | espeak (default picks from the voice)
  "brand": {"name": "PROTYASHA TAH", "tagline": "Business Software Trainer",
            "series": "TallyPrime School & Institute Accounting · বাংলায়", "badge": "PART 12"},
  "music": "music/lofi.mp3",      // optional background track, looped under the voice
  "music_volume": 0.12,
  "captions": true,               // defaults to on for Shorts and off for landscape
  "colors": {"a1": [220, 40, 40]},// optional overrides: ink, a1, a2, a3, bg
  "scenes": [
    {
      "heading": "The 2-Minute Rule",
      "doodle": "lightbulb",                // one name, or a list: ["mountain", "arrow_right", "check"]
      "points": ["If it takes under 2 minutes, do it NOW"],
      "bullet": "check",                    // check | arrow | dot | number
      "say": "It's called the two minute rule...",
      "audio": "voice/scene2.mp3",          // optional: your own recording replaces the robot voice
      "min_seconds": 4,                     // optional
      "hold": 1.0,                          // optional extra seconds after drawing
      "thumbnail": true                     // use this scene for the thumbnail
    }
  ]
}
```

(JSON doesn't allow comments. Remove them when you copy this.)

### Cover thumbnail and ending (Shorts)

```json
"cover": {
  "hook": "মাত্র *1% GST* দিয়ে ব্যবসা চালান!",   // *stars* paint those words yellow
  "label": "Composition Scheme",                // tilted red tag
  "badge": "GST EP 04",
  "doodle": ["shop", "percent:1%"],
  "say": "মাত্র এক শতাংশ জিএসটি দিয়ে ব্যবসা! কীভাবে, দেখুন।"
},
"outro": {
  "question": "কমেন্টে লিখুন: Composition না Regular?",                 // shown on screen
  "ask": "আর কমেন্টে লিখুন, আপনার ব্যবসার জন্য কম্পোজিশন ভালো, না রেগুলার?"  // spoken
}
```

The cover becomes the video's first 1–2 seconds, so it can be picked as the Short's cover frame in the YouTube app. It's also saved as `*_thumbnail.png`. The `outro` adds a closing scene with like, share, comment and subscribe doodles. It asks viewers to like, share and subscribe, then asks your question to get comments.

A scene needs only one of `heading`, `doodle` or `points`. A scene with only a heading becomes a big title card. Each scene lasts as long as its narration, and the drawing finishes just before the narration does.

### Doodles

**Accounting and Tally.** Doodles that take a word are written as `name:word`.

| Doodle | Draws |
|---|---|
| `t_account:Cash A/c` | T-account with Dr and Cr sides |
| `scale` | Balanced scale with Dr and Cr pans (trial balance) |
| `voucher:Payment` | Voucher slip with a title and a ₹ amount |
| `ledger:Ledger` | Account register |
| `keycap:F5` | Keyboard key, e.g. `keycap:Alt+F5` |
| `laptop:TallyPrime` | Laptop with text on the screen |
| `label:Debit` | Rounded tag with any words |
| `text:₹5,000` | Big hand-written words |
| `rupee` | ₹ coin |
| `bank`, `school`, `student`, `teacher`, `calculator`, `plus`, `equals`, `arrow_left` | |

**GST and business:**

| Doodle | Draws |
|---|---|
| `percent:18%` | Rate badge |
| `invoice:Tax Invoice` | Bill with GST and ₹ lines |
| `state:West Bengal` | State outline with its name |
| `shop`, `factory`, `truck`, `news`, `shield`, `handcuffs`, `share`, `comment` | |

## Series in this repo

- `scripts/bangla/`: TallyPrime School Accounting extras (golden rules, receivable vs payable, voucher shortcuts).
- `scripts/gst/`: **GST সহজ বাংলায়**. EP 02–07 are Shorts with hook covers: GST 2.0 rates, GSTR-1 vs 3B, Composition Scheme, Reverse Charge, e-Invoice & e-Way Bill, and Registration. Also EP 01 "GST কী?", the 57th GST Council update (long video + Short), and Shorts on GST 2.0 rates, CGST/SGST/IGST and Input Tax Credit. Facts as of October 2026: re-check rates and notifications before publishing an update.

**General:** `arrow_down` `arrow_right` `bar_chart` `battery` `battery_low` `book` `brain` `calendar` `check` `clock` `coin` `cross` `decline_chart` `exclamation` `gear` `globe` `growth_chart` `heart` `hourglass` `house` `lightbulb` `like` `magnifier` `money` `mountain` `people` `person` `phone` `plant` `question` `rocket` `snowball` `speech` `star` `subscribe` `target` `trophy` `warning`

To add your own, write a function in `doodles.py` that returns strokes in a 0–1 square. It is picked up automatically.

## Better voice

The built-in `espeak-ng` voice works offline, but it sounds robotic. For a channel, record each scene's line yourself or export it from a TTS tool such as ElevenLabs or CapCut. Then point `"audio"` at the file. The scene's timing will follow your recording.

## Upload tips

- **Shorts:** keep them under 60 seconds (YouTube accepts up to 3 minutes). Put the hook in scene 1 and the follow call-to-action in the last scene (`subscribe` / `like` doodles).
- **Long-form:** upload `*_thumbnail.png` as the custom thumbnail, or use it as a base for one.
- **Both formats from one idea:** use `--format both` to get the long video and a vertical cut from a single script.
