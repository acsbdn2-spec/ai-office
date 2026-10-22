# Whiteboard Studio

Turns a short JSON script into a hand-drawn **whiteboard** or **scribble** explainer video. A marker writes the headings and points, draws the doodles, and slides to a new board for each scene. A voiceover and captions are added automatically.

- **Long-form videos:** 1920×1080 landscape.
- **YouTube Shorts:** 1080×1920 vertical, with large captions burned in.
- **Two looks:** `whiteboard` (clean marker on a white board) and `scribble` (ink on notebook paper with highlighter and hatched shading).
- **English and Bangla:** Bengali text switches to Hind Siliguri automatically, and `"voice": "bn"` narrates in Bangla.
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

**Requirements:** Python 3 with Pillow (built with libraqm for Bangla), `ffmpeg`, and `espeak-ng` for the built-in voice (`apt-get install espeak-ng`).

## Script format

```json
{
  "format": "short",              // "landscape" or "short"
  "style": "scribble",            // "whiteboard" or "scribble"
  "voice": "en-us+f3",            // espeak-ng voice: en-us+m3, en-gb+f2, bn, hi ... or "none"
  "rate": 165,                    // speaking speed (words per minute)
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

A scene needs only one of `heading`, `doodle` or `points`. A scene with only a heading becomes a big title card. Each scene lasts as long as its narration, and the drawing finishes just before the narration does.

### Doodles

`arrow_down` `arrow_right` `bar_chart` `battery` `battery_low` `book` `brain` `calendar` `check` `clock` `coin` `cross` `decline_chart` `exclamation` `gear` `globe` `growth_chart` `heart` `hourglass` `house` `lightbulb` `like` `magnifier` `money` `mountain` `people` `person` `phone` `plant` `question` `rocket` `snowball` `speech` `star` `subscribe` `target` `trophy` `warning`

To add your own, write a function in `doodles.py` that returns strokes in a 0–1 square. It is picked up automatically.

## Better voice

The built-in `espeak-ng` voice works offline, but it sounds robotic. For a channel, record each scene's line yourself or export it from a TTS tool such as ElevenLabs or CapCut. Then point `"audio"` at the file. The scene's timing will follow your recording.

## Upload tips

- **Shorts:** keep them under 60 seconds (YouTube accepts up to 3 minutes). Put the hook in scene 1 and the follow call-to-action in the last scene (`subscribe` / `like` doodles).
- **Long-form:** upload `*_thumbnail.png` as the custom thumbnail, or use it as a base for one.
- **Both formats from one idea:** use `--format both` to get the long video and a vertical cut from a single script.
