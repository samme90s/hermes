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

    useEffect(() => {
        setupMediaRecorder() // Consider adding cleanup for the stream/recorder on unmount
        // Example cleanup (might need refinement based on full app structure):
        return () => mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop())
    }, []) // Run setup once

    useEffect(() => {
        // Update disabled state based on prop or if recorder setup failed/pending
        setDisabled(disabled || !mediaRecorderRef.current)
    }, [disabled]) // Also re-run if mediaRecorderRef.current changes (though it's set only once)

    async function setupMediaRecorder(): Promise<void> {
        try {
            if (!navigator?.mediaDevices) {
                console.error("MediaDevices not supported")
                setDisabled(true) // Ensure button is disabled if setup fails early
                return
            }

            const mime = "audio/webm;codecs=opus" // Consider adding fallback mime types
            if (!MediaRecorder.isTypeSupported(mime)) {
                console.error(`Mime: ${mime} is not supported`)
                setDisabled(true)
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
                    onChange(audioBlob) // Send the complete blob
                }
                audioChunks = [] // Clear chunks for the next recording
                setIsRecording(false) // Ensure state is updated on stop
            }
            // Handle potential errors during recording
            mediaRecorder.onerror = (event) => {
                console.error("MediaRecorder error:", event)
                setIsRecording(false)
                // Optionally update UI or notify user
            }

            mediaRecorderRef.current = mediaRecorder // Store the instance
            setDisabled(disabled) // Set disabled based on the initial prop now that recorder exists
        } catch (err) {
            console.error(`Error setting up MediaRecorder: ${err}`)
            setDisabled(true) // Disable button if setup fails
        }
    }

    function record(): void {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "inactive") {
            console.warn("Cannot start recording, recorder not ready or already recording.")
            return
        }
        mediaRecorderRef.current.start()
        setIsRecording(true)
    }

    function stopRecording(): void {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
            console.warn("Cannot stop recording, recorder not ready or not recording.")
            return
        }
        mediaRecorderRef.current.stop()
    }

    return (
        <button
            onClick={isRecording ? stopRecording : record}
            disabled={isDisabled}
            className={cn(
                // Base styles
                "p-2 rounded focus:outline-none",
                // Add flex properties to control internal layout
                "flex items-center justify-center",
                // Hover/Focus states
                "hover:bg-gray-200", // Apply hover effect only when not disabled
                // Disabled state
                isDisabled
                    ? "opacity-50 cursor-not-allowed text-gray-700" // Base color, faded
                    : // Active/Idle states (only apply color if not disabled)
                      isRecording
                      ? "text-red-600" // Recording color
                      : "text-blue-600", // Idle color
                // Merge external classes (where h-10 etc. is applied)
                className,
            )}
            title={isRecording ? "Stop Recording" : "Start Recording"}
        >
            {/* Conditionally render icons */}
            {isDisabled ? (
                // Use h-full to scale icon with button height, w-auto for aspect ratio
                <MicOff className="h-full w-auto opacity-50" />
            ) : isRecording ? (
                <Mic className="h-full w-auto" /> // Recording state icon
            ) : (
                <Mic className="h-full w-auto" /> // Idle state icon
            )}
        </button>
    )
}
