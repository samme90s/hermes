import librosa.display
import matplotlib.pyplot as plt
import librosa
import gradio as gr
from datasets import load_dataset

minds = load_dataset("PolyAI/minds14", name="en-US", split="train")
columns_to_remove = ["lang_id", "english_transcription"]
minds = minds.remove_columns(columns_to_remove)
print(minds)

example = minds[0]
# print(example)

# Sets the id2label as a function to get the label from the id
id2label = minds.features["intent_class"].int2str
# print(id2label(example["intent_class"]))



def generate_audio(ix: int):
    example = minds.shuffle()[0]
    audio = example["audio"]
    array = example["audio"]["array"]
    sampling_rate = example["audio"]["sampling_rate"]

    plt.figure().set_figwidth(12)
    librosa.display.waveshow(array, sr=sampling_rate)
    plt.savefig(f"./out/{ix}.png")
    plt.close()

    return (audio["sampling_rate"], audio["array"]), id2label(example["intent_class"])


with gr.Blocks() as demo:
    with gr.Column():
        for ix in range(4):
            audio, label = generate_audio(ix)
            output = gr.Audio(audio, label=label)

demo.launch(debug=True)
