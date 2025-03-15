import { AudioLines } from "lucide-react"
import { cn } from "../lib/utils"
import { FC } from "react"

interface AudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pulse?: boolean
    disabled?: boolean
    className?: string
}

export const AudioButton: FC<AudioButtonProps> = ({ pulse = false, disabled = false, className, ...props }) => {
    return (
        <button
            {...props}
            disabled={disabled}
            className={cn(
                "flex items-center justify-center",
                "group", // Group hover
                "transition-all duration-200",
                disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-blue-500",
                className
            )}
        >
            <AudioLines
                className={cn(
                    "h-16 w-full",
                    "transition-transform duration-200",
                    disabled
                        ? "text-gray-400"
                        : "group-hover:scale-y-110",
                    pulse && !disabled && "text-red-500 animate-pulse"
                )}
            />
        </button>
    )
}

