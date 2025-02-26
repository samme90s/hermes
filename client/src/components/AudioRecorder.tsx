import { useEffect, useState } from "react"
import AudioButton from "./AudioButton"

interface AudioRecorderProps {
    blobCallback: (audioBlob: Blob) => void
    errorCallback?: (error: string | null) => void
}

export default function AudioRecorder({ blobCallback, errorCallback }: AudioRecorderProps) {
    const [error, setError] = useState<string | null>(null)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [recording, setRecording] = useState<boolean>(false)

    useEffect(() => errorCallback && errorCallback(error), [error])
    useEffect(() => {
        setupMediaRecorder()
    }, [])

    async function setupMediaRecorder(): Promise<void> {
        try {
            if (!navigator?.mediaDevices) {
                setError("MediaDevices not supported")
                return
            }

            const mime = "audio/webm;codecs=opus"
            if (!MediaRecorder.isTypeSupported(mime)) {
                setError(`Mime: ${mime} is not supported`)
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
                blobCallback(audioBlob)

                // Reset chunks for the next recording session
                audioChunks = []
            }

            setMediaRecorder(mediaRecorder)
            setError(null)
        } catch (err) {
            setError(`Recording error: ${err}`)
        }
    }

    function toggleRecording(): boolean {
        if (!mediaRecorder) {
            setError("MediaRecorder not set")
            return false
        }

        if (!recording) {
            mediaRecorder.start()
            setRecording(true)
            setError(null)
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
