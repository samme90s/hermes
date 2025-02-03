# https://huggingface.co/openai/whisper-small
# https://huggingface.co/docs/transformers/en/model_doc/whisper

# WhisperProcessor:
# Prepares raw audio input into the format expected by the model.
#
# WhisperForConditionalGeneration:
# The Whisper model adapted for sequence (text) generation.
from transformers import WhisperProcessor, WhisperForConditionalGeneration
# torch:
# Provides PyTorch utilities for deep learning (e.g., tensor creation).
import torch
# librosa:
# A library for audio processing (loading/resampling audio files).
import librosa

# Load the pretrained Whisper processor and model from Hugging Face.
#
# "openai/whisper-small" model expects:
# Audio sampled at 16 kHz.
# Input features in a log-Mel spectrogram format.
processor = WhisperProcessor.from_pretrained("openai/whisper-small")
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small")

def transcribe_audio(audio_path: str, language: str = "en") -> str:
    """
    Transcribes an audio file at the given path using the Whisper model.

    Parameters:
    - audio_path (str): Path to the audio file.
    - language (str): Language code to force transcription into (e.g., "en" for English).

    Returns:
    - str: The transcribed text.
    """
    # Load the audio file and resample to 16 kHz as required by Whisper.
    # librosa.load returns a tuple (audio_array, sample_rate).
    audio_array, sr = librosa.load(audio_path, sr=16000)

    # The processor converts raw audio (numpy array) to model input features.
    # The "return_tensors" argument specifies the format as a PyTorch tensor.
    # The returned object is a dictionary that typically contains keys like:
    #
    # input_features:
    # This key contains the processed version of your audio that the model understands.
    # It encodes theessential information, like frequency content and time distribution
    # (in the form of a log-Mel spectrogram, for example).
    #
    # attention_mask:
    # A mask showing the valid parts of the input.
    encoding = processor(audio_array, sampling_rate=sr, return_tensors="pt")
    input_features = encoding.input_features

    # Models like Whisper require an attention mask to differentiate between
    # actual data and padded areas. If the processor did not return an attention mask,
    # we create one manually with all ones (i.e., mark every position as valid).
    if "attention_mask" in encoding:
        attention_mask = encoding["attention_mask"]
    else:
        attention_mask = torch.ones(input_features.shape, dtype=torch.long)

    # Get the forced decoder prompt IDs (which incorporate language & task)

    # These IDs embed instructions (such as language and task) into the decoder's initial state.
    # The processor's get_decoder_prompt_ids method is used to get these IDs.
    # Here we specify task="transcribe", so the model transcribes rather than translates.
    forced_decoder_ids = processor.get_decoder_prompt_ids(language=language, task="transcribe")

    # The model.generate() method creates output-text tokens based on the input features.
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
    # processor.decode converts the first generated sequence of token IDs to a string
    transcription = processor.decode(predicted_ids[0])
    return transcription

print(transcribe_audio("bat.wav"))
