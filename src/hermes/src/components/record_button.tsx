// Defines a RecordButton component for capturing audio using the browser's MediaRecorder API.

import { Mic, MicOff } from "lucide-react" // Import microphone icons.
import { FC, useState, useEffect, useRef } from "react"
// Utility for merging CSS classes.
import { cn } from "../lib/utils"

// Defines the props accepted by the RecordButton component.
interface RecordButtonProps {
    // Callback function executed when recording stops, providing the recorded audio Blob. Required.
    onChange: (audioBlob: Blob) => void
    // Optional boolean to disable the button externally. Defaults to false.
    disabled?: boolean
    // Optional CSS class names for custom styling of the button.
    className?: string
}

// The RecordButton component provides a toggle button to start and stop audio recording.
// It handles microphone access, recording state, browser compatibility checks,
// and delivers the final audio recording via the onChange callback.
export const RecordButton: FC<RecordButtonProps> = ({ onChange, disabled = false, className }) => {
    // Ref to hold the MediaRecorder instance.
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    // State to track if audio recording is currently active.
    const [isRecording, setIsRecording] = useState(false)
    // Derived state combining external disabled prop and recorder readiness/support.
    const [isDisabled, setDisabled] = useState(disabled)

    // Effect hook to set up the MediaRecorder instance once on component mount.
    useEffect(() => {
        // Initialize the recorder.
        setupMediaRecorder()
        // Cleanup function: Stop media tracks when the component unmounts.
        return () => mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop())
        // Empty dependency array ensures setup runs only once.
    }, [])

    // Effect hook to update the derived disabled state based on props or recorder readiness.
    useEffect(() => {
        // Disable if externally disabled or if the recorder setup hasn't completed successfully.
        setDisabled(disabled || !mediaRecorderRef.current)
        // Re-run if the external disabled prop changes.
    }, [disabled])

    // Asynchronously sets up the MediaRecorder, requesting permissions and configuring handlers.
    async function setupMediaRecorder(): Promise<void> {
        try {
            // Check if necessary browser APIs are available.
            if (!navigator?.mediaDevices) {
                console.error("MediaDevices API not supported.")
                setDisabled(true) // Disable if API is missing.
                return
            }

            // Preferred audio format. Consider fallbacks for broader compatibility.
            const mime = "audio/webm;codecs=opus"
            if (!MediaRecorder.isTypeSupported(mime)) {
                console.error(`Mime type ${mime} is not supported.`)
                setDisabled(true) // Disable if format is unsupported.
                return
            }

            // Request microphone access. This triggers a browser permission prompt.
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            // Create a new MediaRecorder instance.
            const mediaRecorder = new MediaRecorder(stream, { mimeType: mime })

            // Array to store recorded audio data chunks.
            let audioChunks: Blob[] = []
            // Event handler for when audio data becomes available during recording.
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data) // Collect the chunk.
                }
            }
            // Event handler for when recording stops.
            mediaRecorder.onstop = () => {
                if (audioChunks.length > 0) {
                    // Combine chunks into a single Blob.
                    const audioBlob = new Blob(audioChunks, { type: mime })
                    // Call the parent component's callback with the final Blob.
                    onChange(audioBlob)
                }
                audioChunks = [] // Clear chunks for the next recording session.
                setIsRecording(false) // Update recording state.
            }
            // Event handler for errors during recording.
            mediaRecorder.onerror = (event) => {
                console.error("MediaRecorder error:", event)
                setIsRecording(false) // Ensure recording state is updated on error.
            }

            // Store the configured recorder instance in the ref.
            mediaRecorderRef.current = mediaRecorder
            // Update disabled state based on initial prop now that setup is done.
            setDisabled(disabled)
        } catch (err) {
            // Handle errors during setup (e.g., permission denied).
            console.error(`Error setting up MediaRecorder: ${err}`)
            setDisabled(true) // Disable the button if setup fails.
        }
    }

    // Starts the audio recording process.
    function record(): void {
        // Check if recorder is ready and not already recording.
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "inactive") {
            console.warn("Recorder not ready or already recording.")
            return
        }
        mediaRecorderRef.current.start() // Begin recording.
        setIsRecording(true) // Update state.
    }

    // Stops the audio recording process.
    function stopRecording(): void {
        // Check if recorder is ready and currently recording.
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
            console.warn("Recorder not ready or not recording.")
            return
        }
        mediaRecorderRef.current.stop() // Stop recording (triggers 'onstop' handler).
        // setIsRecording(false) is handled in 'onstop'.
    }

    // Renders the button element.
    return (
        <button
            // Toggles between record and stop functions based on recording state.
            onClick={isRecording ? stopRecording : record}
            // Uses the derived isDisabled state.
            disabled={isDisabled}
            className={cn(
                // Base styles: padding, focus outline reset, flex centering.
                "p-2 rounded focus:outline-none",
                "flex items-center justify-center",
                // Interaction styles: hover background (only when not disabled).
                !isDisabled ? "hover:bg-gray-200" : "",
                // Conditional styles based on state.
                isDisabled
                    ? "opacity-50 cursor-not-allowed text-gray-700" // Disabled appearance.
                    : isRecording
                      ? "text-red-600" // Recording appearance.
                      : "text-blue-600", // Idle appearance.
                // Merge external classes for layout (e.g., height, width).
                className,
            )}
            // Sets tooltip based on the action the button will perform.
            title={isRecording ? "Stop Recording" : "Start Recording"}
        >
            {/* Conditionally renders the appropriate icon based on state. */}
            {isDisabled ? (
                // Muted mic icon when disabled. Sized to fill button height.
                <MicOff className="h-full w-auto opacity-50" />
            ) : (
                // Active mic icon when enabled (idle or recording). Sized to fill button height.
                // Color change is handled by text color classes on the button.
                <Mic className="h-full w-auto" />
            )}
        </button>
    )
}
