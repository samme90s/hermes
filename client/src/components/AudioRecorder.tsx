import { useEffect, useState } from "react"
import AudioButton from "./AudioButton"
import AudioControls from "./AudioControls"
import { requestAudioTranscription } from "../services/api"
import TranscriptBox from "./TranscriptBox"

export default function AudioRecorder() {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [recording, setRecording] = useState<boolean>(false)
    const [audioURL, setAudioURL] = useState<string | null>(null)
    const [transcription, setTranscription] = useState<string | null>(null)

    async function setupMediaRecorder(): Promise<void> {
        try {
            if (!navigator?.mediaDevices) {
                console.error("MediaDevices not supported")
                return
            }

            const mime = "audio/webm;codecs=opus"
            if (!MediaRecorder.isTypeSupported(mime)) {
                console.error(`Mime: ${mime} is not supported`)
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
                    {type: mime},
                )
                // Reset chunks for the next recording session
                audioChunks = []

                // Set states
                setAudioURL(URL.createObjectURL(audioBlob))
                const res = await requestAudioTranscription(audioBlob)
                setTranscription(res.transcription)
            }

            setMediaRecorder(mediaRecorder)
            console.info("MediaRecorder available")
        } catch (err) {
            console.error(`Recording error: ${err}`)
        }
    }

    function toggleRecording(): boolean {
        if (!mediaRecorder) {
            throw new Error("MediaRecorder not set")
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

    useEffect(() => {
        setupMediaRecorder()
    }, [])

    return (
        <div>
            <AudioButton anim={recording} size={128} onClick={toggleRecording}></AudioButton>
            {audioURL && <AudioControls src={audioURL} />}
            {transcription && <TranscriptBox transcription={transcription} />}
        </div>
    )
}
