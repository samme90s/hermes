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

    async function requestAudioTranscription(audioBlob: Blob): Promise<AudioTranscriptionResponse> {
        const formData = new FormData()
        formData.append("file", audioBlob, "file.webm")
        const res = await fetch("http://localhost:8000/transcribe", {
            method: "POST",
            body: formData,
        })

        if (!res.ok) {
            throw new Error(`Request error: ${res.status} - ${res.statusText}`)
        }

        return res.json()
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

                    console.log("Audio Blob:", audioBlob)
                    console.log("Audio Blob Size:", audioBlob.size)
                    console.log("Audio Blob Type:", audioBlob.type)

                    setAudioURL(URL.createObjectURL(audioBlob))
                    const res = await requestAudioTranscription(audioBlob)
                    console.log(res)

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
            {transcription && <p className="text-white">Transcription: {transcription}</p>}
        </div>
    )
}
