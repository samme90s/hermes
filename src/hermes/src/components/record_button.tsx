import { Mic, MicOff } from "lucide-react"
import { FC, useState, useEffect } from "react"
import { cn } from "../lib/utils"

interface RecordButtonProps {
    onChange: (audioBlob: Blob) => void
    disabled?: boolean
    className?: string
}

export const RecordButton: FC<RecordButtonProps> = ({ onChange, disabled = false, className }) => {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [isRecording, setIsRecording] = useState<boolean>(false)
    const [isDisabled, setDisabled] = useState<boolean>(disabled)

    useEffect(() => void setupMediaRecorder(), [])
    useEffect(() => setDisabled(disabled || !mediaRecorder), [disabled, mediaRecorder])

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

                const audioBlob = new Blob(audioChunks, { type: mime })
                onChange(audioBlob)

                // Reset chunks for the next recording session
                audioChunks = []
            }

            setMediaRecorder(mediaRecorder)
        } catch (err) {
            console.error(`Recording error: ${err}`)
        }
    }

    function record(): void {
        if (!mediaRecorder) {
            console.error("MediaRecorder not set")
            return
        }

        mediaRecorder.start()
        setIsRecording(true)
    }

    function stopRecording(): void {
        if (!mediaRecorder) {
            console.error("MediaRecorder not set")
            return
        }

        mediaRecorder.stop()
        setIsRecording(false)
    }

    return (
        <button
            onClick={isRecording ? stopRecording : record}
            disabled={isDisabled}
            className={
                cn(
                    "p-2 rounded text-gray-700 focus:outline-none hover:bg-gray-200",
                    isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : isRecording
                            ? "text-red-600"
                            : "text-blue-600",
                    className
                )}
            title={isRecording ? "Stop" : "Read"}
        >
            {
                isDisabled
                    ? <MicOff className="h-6 w-6 opacity-50" /> // Disabled
                    : isRecording
                        ? <Mic className="h-6 w-6" /> // Reading
                        : <Mic className="h-6 w-6" /> // Idle
            }
        </button >
    )
}

