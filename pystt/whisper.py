# https://huggingface.co/openai/whisper-tiny.en
# https://huggingface.co/docs/transformers/en/model_doc/whisper

from typing import cast

import subprocess
import numpy as np
# Provides PyTorch utilities for deep learning (e.g., tensor creation).
import torch
# Prepares raw audio input into the format expected by the model.
# WhisperForConditionalGeneration: The Whisper model adapted for sequence (text) generation.
from transformers import WhisperProcessor, WhisperForConditionalGeneration

from logger import get_logger

logger = get_logger()

# Load the Whisper processor and model (ensure you have the correct model checkpoint)
# processor = WhisperProcessor.from_pretrained("openai/whisper-tiny.en")
# Fixes the Pyright error when getting the encoder, and serves the same functionality as the commented above:
processor = cast(WhisperProcessor, WhisperProcessor.from_pretrained("openai/whisper-small"))
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small")
# This enables ALL neurons ensuring consistent predictions,
# but potentially makes the model run slower!
model.eval()

def transcribe(audio_bytes: bytes, language: str = "en") -> str:
    """
    Transcribes an audio file provided using the Whisper model.
    """
    # Use FFmpeg to decode and resample to 16 kHz
    process = subprocess.run(
        [
            "ffmpeg", "-i", "pipe:0",
            "-vn",                      # Ignore any video stream
            "-ar", "16000",             # Resample to 16 kHz
            "-ac", "1",                 # Convert to mono
            "-f", "wav",                # Output format as WAV bytes
            "pipe:1"                    # Output to stdout (WAV bytes)
        ],
        input=audio_bytes,              # Provide bytes as input
        stdout=subprocess.PIPE,         # Capture output bytes
        stderr=subprocess.PIPE,         # Capture errors for debugging
        check=True                      # Raise exception on failure
    )

    # Log FFmpeg errors for debugging purposes
    # if process.stderr:
    #     logger.debug("FFmpeg stderr: " + process.stderr.decode())

    # Extract bytes from FFmpeg output
    audio_data = process.stdout
    # Convert bytes into a NumPy array for Whisper processing
    # Define the maximum value for 16-bit signed integers
    int16_max = np.iinfo(np.int16).max  # This will give 32767
    # Normalize the audio data to the range [-1.0, 1.0]
    audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / int16_max

    # Preprocess audio using the processor (convert raw audio to input features)
    encoding = processor(audio_array, sampling_rate=16000, return_tensors="pt")
    input_features = encoding.input_features

    # Create an attention mask if not provided by default
    attention_mask = encoding.get("attention_mask", torch.ones(input_features.shape, dtype=torch.long))

    # Get forced decoder prompt IDs (to set language and task for transcription)
    forced_decoder_ids = processor.get_decoder_prompt_ids(language=language, task="transcribe")

    # Generate predictions using the Whisper model
    predicted_ids = model.generate(
        input_features,
        forced_decoder_ids=forced_decoder_ids,
        attention_mask=attention_mask
    )
    # Fixes the Pyright error when trying to retrieve the first index:
    predicted_ids = cast(torch.Tensor, predicted_ids)

    # Decode the token IDs back into human-readable text
    transcription = processor.decode(predicted_ids[0], skip_special_tokens=True)

    if not isinstance(transcription, str):
        raise ValueError("Transcription must be a string")

    return transcription.strip()
