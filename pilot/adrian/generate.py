
import json
import os
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

CONFIG = Path("pilot/adrian/clips.json")
OUTPUT = Path("pilot-output")

def main():
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        sys.exit("ERROR: ELEVENLABS_API_KEY secret is missing.")

    if not CONFIG.is_file():
        sys.exit(f"ERROR: Config file not found: {CONFIG}")

    with CONFIG.open("r", encoding="utf-8") as f:
        config = json.load(f)

    voice_id = config["voice_id"]
    model_id = config.get("model_id", "eleven_flash_v2")
    settings = config.get("voice_settings", {})
    clips = config["clips"]

    if not clips:
        sys.exit("ERROR: No clips found in clips.json")

    OUTPUT.mkdir(parents=True, exist_ok=True)

    for clip in clips:
        clip_id = clip["id"]
        text = clip["text"]
        output_file = OUTPUT / f"{clip_id}.mp3"

        if output_file.exists():
            sys.exit(
                f"ERROR: {output_file} already exists. "
                "Refusing to overwrite files."
            )

        # IPA is retained for review, but not sent as unsupported SSML.
        # We will verify pronunciation before adding IPA-specific handling.
        payload = {
            "text": text,
            "model_id": model_id,
            "voice_settings": settings,
            "output_format": "mp3_44100_128",
        }

        request = Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "xi-api-key": api_key,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            method="POST",
        )

        print(f"Generating {clip_id}: {text!r}")

        try:
            with urlopen(request, timeout=90) as response:
                audio = response.read()

            if not audio:
                sys.exit(f"ERROR: Empty audio response for {clip_id}")

            output_file.write_bytes(audio)
            print(f"Saved: {output_file} ({len(audio)} bytes)")
            time.sleep(1)

        except HTTPError as e:
            detail = e.read().decode("utf-8", errors="replace")
            sys.exit(f"ElevenLabs API error {e.code}: {detail}")
        except (URLError, TimeoutError) as e:
            sys.exit(f"Network error while generating {clip_id}: {e}")

    print(f"SUCCESS: Generated {len(clips)} audio clips in {OUTPUT}")

if __name__ == "__main__":
    main()
