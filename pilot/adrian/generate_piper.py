import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

CONFIG = Path("pilot/adrian/clips.json")
OUTPUT = Path("pilot-output")
MODEL = os.environ.get("PIPER_MODEL", "")

# Piper reads plain text (no phoneme tags), so letters/sounds are spelled
# the way they should be spoken. Words are read as written.
SPOKEN = {
    "01-name-a": "ay",
    "02-name-b": "bee",
    "03-name-c": "see",
    "04-sound-a": "ah",
    "05-sound-b": "buh",
    "06-sound-c": "kuh",
}


def main():
    if not MODEL or not Path(MODEL).is_file():
        sys.exit("ERROR: PIPER_MODEL voice file not found: " + MODEL)
    if not CONFIG.is_file():
        sys.exit("ERROR: Config file not found: " + str(CONFIG))

    clips = json.loads(CONFIG.read_text(encoding="utf-8")).get("clips", [])
    if not clips:
        sys.exit("ERROR: No clips found in clips.json")

    OUTPUT.mkdir(parents=True, exist_ok=True)

    for i, clip in enumerate(clips, start=1):
        cid = clip["id"]
        target = OUTPUT / (cid + ".mp3")
        if target.exists():
            sys.exit("ERROR: {} already exists. Refusing to overwrite.".format(target))

        spoken = SPOKEN.get(cid, clip["text"]) + "."
        print("Generating {}/{}: {} -> {!r}".format(i, len(clips), cid, spoken))

        with tempfile.TemporaryDirectory() as tmp:
            wav = Path(tmp) / "clip.wav"
            r = subprocess.run(
                [sys.executable, "-m", "piper", "-m", MODEL, "-f", str(wav)],
                input=spoken.encode("utf-8"),
                capture_output=True,
            )
            if r.returncode != 0 or not wav.exists():
                sys.exit("ERROR piper {}: {}".format(cid, r.stderr.decode("utf-8", "replace")[-500:]))
            r = subprocess.run(
                ["ffmpeg", "-n", "-loglevel", "error", "-i", str(wav),
                 "-codec:a", "libmp3lame", "-q:a", "2", str(target)],
                capture_output=True,
            )
            if r.returncode != 0 or not target.exists() or target.stat().st_size == 0:
                sys.exit("ERROR ffmpeg {}: {}".format(cid, r.stderr.decode("utf-8", "replace")[-500:]))
        print("Saved {} ({} bytes)".format(target, target.stat().st_size))

    print("SUCCESS: Generated {} MP3 files in {}".format(len(clips), OUTPUT))


if __name__ == "__main__":
    main()
