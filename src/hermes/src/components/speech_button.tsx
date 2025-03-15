import { FC } from "react"
import { Volume2, VolumeX, Square } from "lucide-react"
import { cn } from "../lib/utils"

interface SpeechButtonProps {
    onClick: () => void
    isSpeaking: boolean
    disabled?: boolean
    className?: string
}

export const SpeechButton: FC<SpeechButtonProps> = ({ onClick, disabled, isSpeaking, className }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "p-2 rounded text-gray-700 focus:outline-none hover:bg-gray-200",
                disabled
                    ? "opacity-50 cursor-not-allowed"
                    : isSpeaking
                        ? "text-red-600"
                        : "text-blue-600",
                className
            )}
            title={isSpeaking ? "Stop" : "Read"}
        >
            {disabled
                ? <VolumeX className="h-6 w-6 opacity-50" /> // Disabled
                : isSpeaking
                    ? <Square className="h-6 w-6" /> // Reading
                    : <Volume2 className="h-6 w-6" /> // Idle
            }
        </button >
    )
}
