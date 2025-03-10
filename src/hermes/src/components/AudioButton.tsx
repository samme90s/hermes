import { AudioWaveform } from "lucide-react"
import { cn } from "../lib/utils"

interface AudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pulse: boolean
    className?: string
}

export default function AudioButton({ pulse, className, ...props }: AudioButtonProps) {
    return (
        <button
            {...props}
            className={cn(
                "bg-neutral-900 text-white",
                "hover:border-red-500",
                "p-2 sm:p-3 md:p-4",
                "border-2 border-transparent transition-border duration-200 rounded-full",
                "group", // Group Elements to scale on button hover
                pulse ? "animate-pulse shadow-border-red" : "shadow-xl",
                className
            )}
        >
            <AudioWaveform
                // Adjust the icon size with responsive utility classes.
                className={cn(
                    "group-hover:scale-80 transition-transform duration-200",
                    "w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26 scale-70",
                    pulse && "scale-80"
                )}
            />
        </button>
    )
}
