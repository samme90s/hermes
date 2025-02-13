import { useEffect, useState } from "react"
import AudioButton from "./AudioButton"
import AudioControls from "./AudioControls"

interface AudioTranscriptionResponse {
    transcription: string
}

export default function AudioRecorder() {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [recording, setRecording] = useState<boolean>(false)
    const [audioURL, setAudioURL] = useState<string | null>(null)
    const [transcription, setTranscription] = useState<string | null>(null)

    async function requestAudioTranscription(audioBase64: string): Promise<AudioTranscriptionResponse> {
       const res = await fetch("http://localhost:8000/transcribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                audio_base64: audioBase64,
                language: "en"
            }),
        })

        if (!res.ok) {
            throw new Error(`Request error: ${res.status} - ${res.statusText}`)
        }

        return res.json()
    }

    function audioBlobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                // reader.result contains the base64 string as a Data URL,
                // e.g., "data:audio/ogg;base64,..."
                const base64data = reader.result as string
                const pure64data = base64data.split(",")[1]
                resolve(pure64data)
            }

            reader.onerror = (error) => {
                reject(error)
            }

            reader.readAsDataURL(blob);
        })
    }

    async function setupMediaRecorder(): Promise<void> {
        try {
            if (!navigator?.mediaDevices) {
                console.error("mediaDevices not supported")
                return
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" })
            if (!MediaRecorder.isTypeSupported(mediaRecorder.mimeType)) {
                console.error(`mimeType ${mediaRecorder.mimeType} is not supported`)
                return
            }

            let audioChunks: Blob[] = []
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data)
                }
            }
            mediaRecorder.onstop = async () => {
                if (audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType })
                    // Request the REST API here!
                    setAudioURL(URL.createObjectURL(audioBlob))
                    const audioBase64 = await audioBlobToBase64(audioBlob)
                    console.log(audioBase64)
                    const res = await requestAudioTranscription(audioBase64)
                    setTranscription(res.transcription)
                    // Reset chunks for the next recording session
                    audioChunks = []
                }
            }

            setMediaRecorder(mediaRecorder)
        } catch (err) {
            console.error(`recording error: ${err}`)
        }
    }

    function toggleRecording(): void {
        if (!mediaRecorder) {
            console.error("MediaRecorder not set")
            return
        }

        if (!recording) {
            mediaRecorder.start()
            setRecording(true)
            console.log("recording started")
            return
        }

        if (recording) {
            mediaRecorder.stop()
            setRecording(false)
            console.log("recording stopped")
        }
    }

    useEffect(() => {
        setupMediaRecorder()
    }, [])

    useEffect(() => {
        console.log("recorder set")
    }, [mediaRecorder])

    return (
        <div>
            <AudioButton anim={recording} size={128} onClick={toggleRecording}></AudioButton>
            {audioURL && <AudioControls src={audioURL} />}
            {transcription && <div>{transcription}</div>}
        </div>
    )
}
