import asyncio
import json
import sys
from pathlib import Path

import edge_tts

CONFIG = Path("pilot/adrian/clips.json")
OUTPUT = Path("pilot-output")

# Free test voice; this is not the OpenAI Cedar voice.
VOICE = "en-US-AndrewNeural"


async def generate_clip(clip, index, total):
    clip_id = clip["id"]
    text = clip["text"]
    output_file = OUTPUT / f"{clip_id}.mp3"

    if output_file.exists():
        sys.exit(
            f"ERROR: {output_file} already exists. "
            "Refusing to overwrite files."
        )

    print(f"Generating {index}/{total}: {clip_id}: {text!r}")

    try:
        communicate = edge_tts.Communicate(
            text=text,
            voice=VOICE,
            rate="+0%",
            pitch="+0Hz",
        )
        await communicate.save(str(output_file))

        if not output_file.exists() or output_file.stat().st_size == 0:
            sys.exit(f"ERROR: Empty audio file for {clip_id}")

        print(f"Saved: {output_file} ({output_file.stat().st_size} bytes)")

    except Exception as exc:
        sys.exit(f"ERROR generating {clip_id}: {exc}")


async def main():
    if not CONFIG.is_file():
        sys.exit(f"ERROR: Config file not found: {CONFIG}")

    with CONFIG.open("r", encoding="utf-8") as file:
        config = json.load(file)

    clips = config.get("clips", [])

    if not clips:
        sys.exit("ERROR: No clips found in clips.json")

    OUTPUT.mkdir(parents=True, exist_ok=True)

    for index, clip in enumerate(clips, start=1):
        await generate_clip(clip, index, len(clips))

    print(f"SUCCESS: Generated {len(clips)} MP3 files in {OUTPUT}")


if __name__ == "__main__":
    asyncio.run(main())
