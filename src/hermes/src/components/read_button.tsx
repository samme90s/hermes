import { FC, useState, useEffect, useRef } from "react"
import { Volume2, VolumeX, Square } from "lucide-react"
import { cn } from "../lib/utils"

interface ReadButtonProps {
    text: string
    disabled?: boolean
    className?: string
}

export const ReadButton: FC<ReadButtonProps> = ({ text, disabled, className }) => {
    // ... (useState, useEffect, useRef, sanitizeText, read, stopReading hooks/functions remain the same) ...
    const [isReading, setIsReading] = useState(false)
    const [isDisabled, setIsDisabled] = useState(disabled)
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

    useEffect(() => setIsDisabled(disabled || !text.trim() || !window.speechSynthesis), [disabled, text])

    const sanitizeText = (input: string) => {
        // ... sanitizeText logic ...
        return input
            .replace(/#+\s*/g, "") // Remove markdown headers (e.g., `# Title`, `## Subtitle`)
            .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1") // Remove bold (`**bold**`) and italic (`*italic*`)
            .replace(/`([^`]+)`/g, "$1") // Remove inline code (e.g., `code`)
            .replace(/^\s*[-*]\s+/gm, "") // Remove list prefixes (`- item`, `* item`)
            .replace(/```[\s\S]*?```/g, "") // Remove fenced code blocks
            .replace(/\n{2,}/g, ". ") // Convert double new lines into a pause
            .trim()
    }

    const read = () => {
        // ... read logic ...
        if (!window.speechSynthesis) {
            console.error("SpeechSynthesis is not supported")
            return
        }
        if (utteranceRef.current) {
            window.speechSynthesis.cancel()
        }
        if (!text.trim()) {
            return
        }
        const sanitizedText = sanitizeText(text)
        const utterance = new SpeechSynthesisUtterance(sanitizedText)
        utteranceRef.current = utterance
        utterance.onstart = () => setIsReading(true)
        utterance.onend = () => setIsReading(false)
        utterance.onerror = () => setIsReading(false)
        window.speechSynthesis.speak(utterance)
    }

    const stopReading = () => {
        // ... stopReading logic ...
        if (utteranceRef.current) {
            window.speechSynthesis.cancel()
            setIsReading(false)
        }
    }

    return (
        <button
            onClick={isReading ? stopReading : read}
            disabled={isDisabled}
            className={cn(
                // Base styles
                "p-2 rounded focus:outline-none",
                // Add flex properties to control internal layout
                "flex items-center justify-center",
                // Hover/Focus states (add focus state if needed)
                "hover:bg-gray-200",
                // Disabled state
                isDisabled
                    ? "opacity-50 cursor-not-allowed text-gray-700" // Keep base color when disabled but faded
                    : // Active/Idle states
                      isReading
                      ? "text-red-600" // Color when reading
                      : "text-blue-600", // Color when idle
                // Merge external classes (this is where h-10 etc. comes in)
                className,
            )}
            title={isReading ? "Stop" : "Read"}
        >
            {isDisabled ? (
                // Apply h-full to the icon. Consider w-auto to maintain aspect ratio.
                <VolumeX className="h-full w-auto" />
            ) : isReading ? (
                <Square className="h-full w-auto" />
            ) : (
                <Volume2 className="h-full w-auto" />
            )}
        </button>
    )
}
