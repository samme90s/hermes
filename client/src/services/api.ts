export interface AudioTranscriptionResponse {
    transcription: string
}

export async function requestAudioTranscription(audioBlob: Blob): Promise<AudioTranscriptionResponse> {
    const formData = new FormData()
    // Adding the file.webm ensures that most/all web browsers
    // can interpret the expected file extension.
    // This is a known compatibility issue in FireFox.
    //
    // "audio_file" argument here must match with the backend!
    formData.append("audio_file", audioBlob, "file.webm")
    const res = await fetch("http://localhost:8000/transcribe", {
        method: "POST",
        body: formData,
    })

    if (!res.ok) {
        throw new Error(`Request error: ${res.status} - ${res.statusText}`)
    }

    return res.json()
}
