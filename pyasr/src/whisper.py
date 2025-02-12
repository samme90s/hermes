# https://huggingface.co/openai/whisper-small
# https://huggingface.co/docs/transformers/en/model_doc/whisper
import io

# librosa:
# A library for audio processing (loading/resampling audio files).
import librosa
# torch:
# Provides PyTorch utilities for deep learning (e.g., tensor creation).
import torch
# WhisperProcessor:
# Prepares raw audio input into the format expected by the model.
#
# WhisperForConditionalGeneration:
# The Whisper model adapted for sequence (text) generation.
from transformers import WhisperForConditionalGeneration, WhisperProcessor

# Load the pretrained Whisper processor and model from Hugging Face.
#
# "openai/whisper-small" model expects:
# Audio sampled at 16 kHz.
# Input features in a log-Mel spectrogram format.
processor = WhisperProcessor.from_pretrained("openai/whisper-small")
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small")


def transcribe_audio_base64(audio_base64: bytes, language: str = "en") -> str:
    """
    Transcribes an audio file provided using the Whisper model.

    `audio_base64` here is a Base64-encoded audio content-that is,
    an ASCII representation of binary audio data
    (typically produced by encoding the raw bytes of your audio file).

    For testing purposes, you can let https://base64.guru or similar tools
    encode your audio files.
    """
    if not isinstance(audio_base64, bytes):
        raise ValueError("audio_base64 must be a bytes object as Base64")
    if not isinstance(language, str):
        raise ValueError("language must be a string")
    if len(language) != 2:
        raise ValueError("language must be a two-letter language code")

    # Wrap the bytes in a BytesIO object for librosa to read,
    # since we are passing a base64-encoded audio string.
    # This replaces commonly used file paths.
    audio_buffer = io.BytesIO(audio_base64)

    # Load the audio file and resample to 16 kHz as required by Whisper.
    # librosa.load returns a tuple (audio_array, sample_rate).
    audio_array, sr = librosa.load(audio_buffer, sr=16000)

    # The processor converts raw audio (numpy array) to model input features.
    # The "return_tensors" argument specifies the format as a PyTorch tensor.
    # The returned object is a dictionary that typically contains keys like:
    #
    # input_features:
    # This key contains the processed version of your audio that the model
    # understands. It encodes theessential information, like frequency content
    # and time distribution (in the form of a log-Mel spectrogram, for example).
    #
    # attention_mask:
    # While not always provided by default, when it is available, the attention
    # mask is a binary tensor (usually composed of ones and zeros).
    # It tells the model which parts of the input are valid (usually ones) and
    # which parts are padding (usually zeros). Padding is sometimes added to
    # ensure that all input sequences have a uniform length. Without the mask,
    # the model might treat padded (empty) sections as meaningful data,
    # potentially leading to unexpected behavior.
    encoding = processor(audio_array, sampling_rate=sr, return_tensors="pt")
    input_features = encoding.input_features

    # Models like Whisper require an attention mask to differentiate between
    # actual data and padded areas. If the processor did not return an
    # attention mask, we create one manually with all ones
    # (i.e., mark every position as valid).
    if "attention_mask" in encoding:
        attention_mask = encoding["attention_mask"]
    else:
        attention_mask = torch.ones(input_features.shape, dtype=torch.long)

    # Get the forced decoder prompt IDs (which incorporate language & task)

    # These IDs embed instructions (such as language and task) into the
    # decoder's initial state. The processor's get_decoder_prompt_ids method is
    # used to get these IDs. Here we specify task="transcribe", so the model
    # transcribes rather than translates.
    forced_decoder_ids = processor.get_decoder_prompt_ids(language=language, task="transcribe")

    # The model.generate() method creates output-text tokens based on the input
    # features.
    # We pass:
    #
    # input_features:
    # The processed audio.
    #
    # forced_decoder_ids:
    # To set language and task for the decoder.
    #
    # attention_mask:
    # Ensures that the model properly focuses on the valid inputs.
    predicted_ids = model.generate(
        input_features,
        forced_decoder_ids=forced_decoder_ids,
        attention_mask=attention_mask
    )

    # Decode the token IDs back into human-readable text.
    # processor.decode converts the first generated sequence of token IDs to a
    # string
    transcription = processor.decode(predicted_ids[0])
    if not isinstance(transcription, str):
        raise ValueError("transcription must be a string")

    return transcription.strip()