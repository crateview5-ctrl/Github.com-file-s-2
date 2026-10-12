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
# Letter sounds are repeated three times, the way a teacher drills them.
SPOKEN = {
    "01-name-a": "ay",
    "02-name-b": "bee",
    "03-name-c": "see",
    "04-sound-a": "ah, ah, ah",
    "05-sound-b": "buh, buh, buh",
    "06-sound-c": "kuh, kuh, kuh",
}

# Speed multiplier: smaller = slower. Names and sounds are slowest.
SLOW_LETTER = 0.65
SLOW_WORD = 0.8

LEAD_MS = 300       # silence before the voice (milliseconds)
TAIL_SEC = 0.5      # silence after the voice (seconds)


def speed_for(cid):
    if "-name-" in cid or "-sound-" in cid:
        return SLOW_LETTER
    return SLOW_WORD


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
        speed = speed_for(cid)
        print("Generating {}/{}: {} -> {!r} (speed {})".format(i, len(clips), cid, spoken, speed))

        with tempfile.TemporaryDirectory() as tmp:
            wav = Path(tmp) / "clip.wav"
            r = subprocess.run(
                [sys.executable, "-m", "piper", "-m", MODEL, "-f", str(wav)],
                input=spoken.encode("utf-8"),
                capture_output=True,
            )
            if r.returncode != 0 or not wav.exists():
                sys.exit("ERROR piper {}: {}".format(cid, r.stderr.decode("utf-8", "replace")[-500:]))

            audio_filter = "atempo={},adelay={}:all=1,apad=pad_dur={}".format(
                speed, LEAD_MS, TAIL_SEC
            )
            r = subprocess.run(
                ["ffmpeg", "-n", "-loglevel", "error", "-i", str(wav),
                 "-af", audio_filter,
                 "-codec:a", "libmp3lame", "-q:a", "2", str(target)],
                capture_output=True,
            )
            if r.returncode != 0 or not target.exists() or target.stat().st_size == 0:
                sys.exit("ERROR ffmpeg {}: {}".format(cid, r.stderr.decode("utf-8", "replace")[-500:]))
        print("Saved {} ({} bytes)".format(target, target.stat().st_size))

    print("SUCCESS: Generated {} MP3 files in {}".format(len(clips), OUTPUT))


if __name__ == "__main__":
    main()
