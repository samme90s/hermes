// Defines a ReadButton component for initiating text-to-speech using the browser API.

import { FC, useState, useEffect, useRef } from "react"
// Import icons for different button states.
import { Volume2, VolumeX, Square } from "lucide-react"
// Utility for merging CSS classes.
import { cn } from "../lib/utils"

// Defines the props accepted by the ReadButton component.
interface ReadButtonProps {
    // The text content to be read aloud. Required.
    text: string
    // Optional boolean to disable the button externally.
    disabled?: boolean
    // Optional CSS class names for custom styling of the button.
    className?: string
}

// The ReadButton component provides a toggle button to read the provided text
// using the browser's Speech Synthesis API or stop the current playback.
// It adapts its appearance based on whether it's idle, reading, or disabled.
export const ReadButton: FC<ReadButtonProps> = ({ text, disabled, className }) => {
    // State to track if speech synthesis is currently active.
    const [isReading, setIsReading] = useState(false)
    // Derived state combining external disabled prop, text content, and browser support.
    const [isDisabled, setIsDisabled] = useState(disabled)
    // Ref to store the current SpeechSynthesisUtterance instance for cancellation.
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

    // Effect to update the derived disabled state based on props, text, and browser capability.
    useEffect(() => {
        // Disable if externally disabled, text is empty/whitespace, or speech synthesis is unsupported.
        setIsDisabled(disabled || !text.trim() || !window.speechSynthesis)
    }, [disabled, text]) // Re-run when external disabled prop or text changes.

    // Removes common Markdown characters from text for clearer speech synthesis.
    const sanitizeText = (input: string): string => {
        // Logic to strip markdown formatting.
        return input
            .replace(/#+\s*/g, "") // Remove markdown headers
            .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1") // Remove bold/italic
            .replace(/`([^`]+)`/g, "$1") // Remove inline code
            .replace(/^\s*[-*]\s+/gm, "") // Remove list prefixes
            .replace(/```[\s\S]*?```/g, "") // Remove code blocks
            .replace(/\n{2,}/g, ". ") // Convert paragraphs to pauses
            .trim()
    }

    // Initiates speech synthesis for the provided text.
    const read = () => {
        // Check for browser support.
        if (!window.speechSynthesis) {
            console.error("SpeechSynthesis is not supported")
            return
        }
        // Cancel any previously ongoing speech.
        if (utteranceRef.current) {
            window.speechSynthesis.cancel()
        }
        // Do nothing if text is empty.
        if (!text.trim()) {
            return
        }
        // Clean the text before speaking.
        const sanitizedText = sanitizeText(text)
        // Create a new speech utterance instance.
        const utterance = new SpeechSynthesisUtterance(sanitizedText)
        utteranceRef.current = utterance
        // Set event listeners to update the reading state.
        utterance.onstart = () => setIsReading(true)
        utterance.onend = () => setIsReading(false) // Also handles cancellation via stopReading.
        utterance.onerror = () => {
            console.error("Speech synthesis error occurred")
            setIsReading(false)
        }
        // Start speaking.
        window.speechSynthesis.speak(utterance)
    }

    // Stops any currently active speech synthesis.
    const stopReading = () => {
        if (utteranceRef.current) {
            // Cancel the speech. This will also trigger the 'onend' event.
            window.speechSynthesis.cancel()
            // We can also set state immediately for faster UI response if needed,
            // though onend handles it too.
            // setIsReading(false);
        }
    }

    // Renders the button element.
    return (
        <button
            // Toggles between read and stop functions based on reading state.
            onClick={isReading ? stopReading : read}
            // Uses the derived isDisabled state.
            disabled={isDisabled}
            className={cn(
                // Base styles: padding, focus outline reset, flexbox centering.
                "p-2 rounded focus:outline-none",
                "flex items-center justify-center",
                // Interaction styles: hover background.
                "hover:bg-gray-200",
                // Conditional styles based on state.
                isDisabled
                    ? "opacity-50 cursor-not-allowed text-gray-700" // Disabled appearance.
                    : isReading
                      ? "text-red-600" // Appearance when reading (stop action).
                      : "text-blue-600", // Appearance when idle (read action).
                // Merge external classes for layout (e.g., height, width).
                className,
            )}
            // Sets tooltip based on the action the button will perform.
            title={isReading ? "Stop" : "Read"}
        >
            {/* Conditionally renders the appropriate icon based on state. */}
            {isDisabled ? (
                // Muted/unavailable icon when disabled. Sized to fill button height.
                <VolumeX className="h-full w-auto" />
            ) : isReading ? (
                // Stop icon when reading. Sized to fill button height.
                <Square className="h-full w-auto" />
            ) : (
                // Read/play icon when idle. Sized to fill button height.
                <Volume2 className="h-full w-auto" />
            )}
        </button>
    )
}
