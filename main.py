# https://huggingface.co/learn/audio-course/en/chapter1/audio_data
import numpy as np
import librosa.display
import matplotlib.pyplot as plt

# array, sampling_rate = librosa.load(librosa.ex("trumpet"))
array, sampling_rate = librosa.load("./assets/wav/bat.wav")

plt.figure(figsize=(12, 4))
# Display the waveform
librosa.display.waveshow(array, sr=sampling_rate)

# Use this to generate a waveform image
plt.savefig('./out/waveform.png')
plt.close()

# #################################
# Generate a spectrum image
#
# Get the first 4096 samples
dft_input = array[:4096]

# Calculate the DFT (Discrete Fourier Transform)
window = np.hanning(len(dft_input))
windowed_input = dft_input * window
dft = np.fft.rfft(windowed_input)

# Get the amplitude spectrum in decibels
amplitude = np.abs(dft)
amplitude_db = librosa.amplitude_to_db(amplitude, ref=np.max)

# Get the frequency bins
frequency = librosa.fft_frequencies(sr=sampling_rate, n_fft=len(dft_input))

plt.figure().set_figwidth(12)
plt.plot(frequency, amplitude_db)
plt.xlabel("Frequency (Hz)")
plt.ylabel("Amplitude (dB)")
plt.xscale("log")

# Use this to generate a spectrum image
plt.savefig('./out/spectrum.png')
plt.close()

# #################################
# Generate a spectrogram image

# Calculate the STFT (Short-Time Fourier Transform)
D = librosa.stft(array)
S_db = librosa.amplitude_to_db(np.abs(D), ref=np.max)

plt.figure().set_figwidth(12)
librosa.display.specshow(S_db, x_axis="time", y_axis="hz")
plt.colorbar()

# Use this to generate a spectrogram image
plt.savefig('./out/spectrogram.png')
plt.close()

# #################################
# Generate a MEL spectrogram image

# Calculate the MEL spectrogram
#
# n_mels stands for the number of MEL bands to generate.
# The mel bands define a set of frequency ranges that divide the spectrum into
# perceptually meaningful components, using a set of filters whose shape and
# spacing are chosen to mimic the way the human ear responds to different
# frequencies.
# Common values for n_mels are 40 or 80.
#
# fmax indicates the highest frequency (in Hz) we care about.
S = librosa.feature.melspectrogram(
    y=array, sr=sampling_rate, n_mels=128, fmax=8000)
# Convert the power mel spectogram to a log mel spectogram
S_dB = librosa.power_to_db(S, ref=np.max)

plt.figure().set_figwidth(12)
librosa.display.specshow(
    S_dB, x_axis="time", y_axis="mel", sr=sampling_rate, fmax=8000)
plt.colorbar()

# Use this to generate a MEL spectrogram image
plt.savefig('./out/mel_spectrogram.png')
plt.close()
