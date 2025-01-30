import numpy as np
import librosa.display
import matplotlib.pyplot as plt

array, sampling_rate = librosa.load(librosa.ex("trumpet"))

plt.figure(figsize=(12, 4))
# Display the waveform
librosa.display.waveshow(array, sr=sampling_rate)

# Use this to generate a waveform image
plt.savefig('waveform.png')
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
plt.savefig('spectrum.png')
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
plt.savefig('spectrogram.png')
plt.close()
