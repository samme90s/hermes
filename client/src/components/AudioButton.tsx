import { AudioWaveform } from "lucide-react"
import { cn } from "../lib/utils"

interface AudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pulse: boolean
    className?: string
}

export default function AudioButton({ pulse, className, ...props }: AudioButtonProps) {
    return (
        <div className="flex justify-center">
            <button
                {...props}
                className={cn(
                    "bg-black text-white",
                    "hover:border-red-500",
                    "p-2 sm:p-3 md:p-4",
                    "border-2 border-transparent transition-border duration-200 rounded-full",
                    "group", // Group Elements to scale on button hover
                    pulse ? "animate-pulse shadow-border-red" : "shadow-xl"
                )}
            >
                <AudioWaveform
                    // Adjust the icon size with responsive utility classes.
                    className={cn(
                        "group-hover:scale-80 transition-transform duration-200",
                        "w-20 h-20 sm:w-26 sm:h-26 md:w-32 md:h-32 scale-70",
                        pulse && "scale-80",
                        className
                    )}
                />
            </button>
        </div>
    )
}
