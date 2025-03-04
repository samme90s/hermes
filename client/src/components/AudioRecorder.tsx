import { useEffect, useState } from "react"
import AudioButton from "./AudioButton"

interface AudioRecorderProps {
    onChange: (audioBlob: Blob) => void
    onError: (error: string) => void
    disabled?: boolean
    className?: string
}

export default function AudioRecorder({ onChange, disabled, onError, className }: AudioRecorderProps) {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [recording, setRecording] = useState<boolean>(false)

    useEffect(() => void setupMediaRecorder(), [])

    async function setupMediaRecorder(): Promise<void> {
        try {
            if (!navigator?.mediaDevices) {
                onError("MediaDevices not supported")
                return
            }

            const mime = "audio/webm;codecs=opus"
            if (!MediaRecorder.isTypeSupported(mime)) {
                onError(`Mime: ${mime} is not supported`)
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

                const audioBlob = new Blob(audioChunks, { type: mime })
                onChange(audioBlob)

                // Reset chunks for the next recording session
                audioChunks = []
            }

            setMediaRecorder(mediaRecorder)
            onError("")
        } catch (err) {
            onError(`Recording error: ${err}`)
        }
    }

    function toggleRecording(): boolean {
        if (!mediaRecorder) {
            onError("MediaRecorder not set")
            return false
        }

        if (!recording) {
            mediaRecorder.start()
            setRecording(true)
            onError("")
            return true
        }
        mediaRecorder.stop()
        setRecording(false)
        return false
    }

    return (
        <AudioButton disabled={disabled} pulse={recording} onClick={toggleRecording} className={className}></AudioButton>
    )
}
