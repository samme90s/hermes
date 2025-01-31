from librosa import load
from transformers import pipeline


def transcribe(audio_file: str, speech_recognizer: pipeline) -> str:
    # Preprocess audio
    # Ensure audio is mono and 16kHz
    audio_array, sampling_rate = load(
        path=audio_file,
        sr=16000,
        mono=True,
        dtype="float32"
    )

    # Run speech recognition
    transcription = speech_recognizer(
        {
            "raw": audio_array,
            "sampling_rate": sampling_rate
        },
    )
    return transcription["text"]


def main():
    # Load speech recognition pipeline
    #
    # https://huggingface.co/openai
    # Note: The first run will download the ~1.5GB Whisper model.
    # You can use smaller models by changing "openai/whisper-small" to:
    # "openai/whisper-tiny" (smallest)
    # "openai/whisper-small"
    # "openai/whisper-base"
    # "openai/whisper-medium"
    # "openai/whisper-large-v3" (best quality)
    speech_recognizer = pipeline(
        task="automatic-speech-recognition",
        model="openai/whisper-tiny"
    )
    transcription = transcribe(
        "./assets/bat.wav",
        speech_recognizer
    )
    print(f"Transcription: {transcription}")


if __name__ == "__main__":
    main()
