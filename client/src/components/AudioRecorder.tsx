import { useEffect, useState } from "react"
import AudioButton from "./AudioButton"
import { AudioTranscriptionResponse } from "../services/api"

interface AudioRecorderProps {
    errorCallback?: (error: string | null) => void
    requestAudioTranscription: (audioBlob: Blob) => Promise<AudioTranscriptionResponse>
    requestCallback: (response: AudioTranscriptionResponse) => void
}

export default function AudioRecorder({ errorCallback, requestAudioTranscription, requestCallback }: AudioRecorderProps) {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [recording, setRecording] = useState<boolean>(false)

    useEffect(() => {
        setupMediaRecorder()
    }, [])

    async function setupMediaRecorder(): Promise<void> {
        try {
            if (!navigator?.mediaDevices) {
                const message = "MediaDevices not supported"
                errorCallback && errorCallback(message)
                console.error(message)
                return
            }

            const mime = "audio/webm;codecs=opus"
            if (!MediaRecorder.isTypeSupported(mime)) {
                const message = `Mime: ${mime} is not supported`
                errorCallback && errorCallback(message)
                console.error(message)
                return
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream, { mimeType: mime })

            // Callbacks
            let audioChunks: Blob[] = []
            mediaRecorder.ondataavailable = (event) => {
                // Return if no data
                if (!event?.data || event.data.size <= 0) {
                    return
                }
                audioChunks.push(event.data)
            }
            mediaRecorder.onstop = async () => {
                // Return if no chunks are present
                if (audioChunks.length <= 0) {
                    return
                }

                const audioBlob = new Blob(
                    audioChunks,
                    { type: mime },
                )
                // Reset chunks for the next recording session
                audioChunks = []

                requestCallback(await requestAudioTranscription(audioBlob))
            }

            setMediaRecorder(mediaRecorder)
            console.info("MediaRecorder available")
        } catch (err) {
            const message = `Recording error: ${err}`
            errorCallback && errorCallback(message)
            console.error(message)
        }
    }

    function toggleRecording(): boolean {
        if (!mediaRecorder) {
            const message = "MediaRecorder not set"
            errorCallback && errorCallback(message)
            console.error(message)
            return false
        }

        if (!recording) {
            mediaRecorder.start()
            setRecording(true)
            return true
        }
        mediaRecorder.stop()
        setRecording(false)
        return false
    }

    return (
        <div>
            <AudioButton anim={recording} size={128} onClick={toggleRecording}></AudioButton>
        </div>
    )
}
