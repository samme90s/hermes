import librosa
import gradio as gr
from transformers import pipeline

# Load speech recognition pipeline
#
# Note: The first run will download the ~1.5GB Whisper model.
# You can use smaller models by changing "openai/whisper-small" to:
# "openai/whisper-tiny" (smallest)
# "openai/whisper-base"
# "openai/whisper-medium"
# "openai/whisper-large-v3" (best quality)
speech_recognizer = pipeline("automatic-speech-recognition", model="openai/whisper-small")


def transcribe_audio(audio_file):
    # Load audio file using librosa (handle resampling if needed)
    audio_array, sampling_rate = librosa.load(audio_file, sr=16000)

    # Run speech recognition
    result = speech_recognizer({"raw": audio_array, "sampling_rate": sampling_rate})
    return result["text"]


with gr.Blocks() as demo:
    gr.Markdown("## WAV to Text Converter")
    with gr.Row():
        audio_input = gr.Audio(sources=["upload"], type="filepath", label="Upload WAV")
        text_output = gr.Textbox(label="Transcription")
    submit_btn = gr.Button("Transcribe")
    submit_btn.click(
        fn=transcribe_audio,
        inputs=audio_input,
        outputs=text_output
    )

demo.launch()
