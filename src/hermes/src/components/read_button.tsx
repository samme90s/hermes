import { FC, useState, useEffect, useRef } from "react"
import { Volume2, VolumeX, Square } from "lucide-react"
import { cn } from "../lib/utils"

interface ReadButtonProps {
    text: string
    disabled?: boolean
    className?: string
}

export const ReadButton: FC<ReadButtonProps> = ({ text, disabled, className }) => {
    const [isReading, setIsReading] = useState(false)
    const [isDisabled, setIsDisabled] = useState(disabled)

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

    useEffect(() => setIsDisabled(disabled || !text.trim() || !window.speechSynthesis), [disabled, text])

    // Function to clean up Markdown for speech synthesis while keeping structure
    const sanitizeText = (input: string) => {
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
                "p-2 rounded text-gray-700 focus:outline-none hover:bg-gray-200",
                isDisabled ? "opacity-50 cursor-not-allowed" : isReading ? "text-red-600" : "text-blue-600",
                className,
            )}
            title={isReading ? "Stop" : "Read"}
        >
            {isDisabled ? (
                <VolumeX className="h-6 w-6 opacity-50" /> // Disabled
            ) : isReading ? (
                <Square className="h-6 w-6" /> // Reading
            ) : (
                <Volume2 className="h-6 w-6" /> // Idle
            )}
        </button>
    )
}
