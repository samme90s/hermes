import { Mic, MicOff } from "lucide-react"
import { FC, useState, useEffect, useRef } from "react"
import { cn } from "../lib/utils"

interface RecordButtonProps {
    onChange: (audioBlob: Blob) => void
    disabled?: boolean
    className?: string
}

export const RecordButton: FC<RecordButtonProps> = ({ onChange, disabled = false, className }) => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [isDisabled, setDisabled] = useState(disabled)

    useEffect(() => void setupMediaRecorder(), [])
    useEffect(() => setDisabled(disabled || !mediaRecorderRef.current), [disabled])

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

            let audioChunks: Blob[] = []
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data)
                }
            }
            mediaRecorder.onstop = () => {
                if (audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, { type: mime })
                    onChange(audioBlob)
                }
                audioChunks = [] // Clear chunks for the next session
            }

            mediaRecorderRef.current = mediaRecorder // Store in ref
            setDisabled(disabled || !mediaRecorder)
        } catch (err) {
            console.error(`Recording error: ${err}`)
        }
    }

    function record(): void {
        if (!mediaRecorderRef.current) {
            console.error("MediaRecorder not set")
            return
        }

        mediaRecorderRef.current.start()
        setIsRecording(true)
    }

    function stopRecording(): void {
        if (!mediaRecorderRef.current) {
            console.error("MediaRecorder not set")
            return
        }

        mediaRecorderRef.current.stop()
        setIsRecording(false)
    }

    return (
        <button
            onClick={isRecording ? stopRecording : record}
            disabled={isDisabled}
            className={cn(
                "p-2 rounded text-gray-700 focus:outline-none hover:bg-gray-200",
                isDisabled ? "opacity-50 cursor-not-allowed" : isRecording ? "text-red-600" : "text-blue-600",
                className,
            )}
            title={isRecording ? "Stop" : "Record"}
        >
            {isDisabled ? (
                <MicOff className="h-6 w-6 opacity-50" /> // Disabled
            ) : isRecording ? (
                <Mic className="h-6 w-6" /> // Recording
            ) : (
                <Mic className="h-6 w-6" /> // Idle
            )}
        </button>
    )
}
