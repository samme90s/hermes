from io import open

from src.whisper import transcribe_audio_bytes

# Open the file in binary mode and read its contents
with open("./bat.wav", "rb") as f:
    audio_data = f.read()

res = transcribe_audio_bytes(
    audio_bytes=audio_data,
    language="en"
)

print(res)
