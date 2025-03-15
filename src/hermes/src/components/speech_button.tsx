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
                "p-2 rounded text-white focus:outline-none",
                disabled
                    ? "opacity-50 cursor-not-allowed bg-gray-400"
                    : isSpeaking
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-blue-500 hover:bg-blue-600",
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
