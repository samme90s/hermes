import { AudioWaveform } from "lucide-react"
import { cn } from "../lib/utils"

interface AudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    anim: boolean
    size: number
}

export default function AudioButton({ anim, size, ...props }: AudioButtonProps) {
    // Ensures that the button can never be smaller than 16 pixels.
    if (size < 16) {
        size = 16
    }

    return (
        <div className="flex items-center justify-center h-full">
            <button
                {...props}
                className={cn(
                    anim && "animate-pulse shadow-border-red",
                    "bg-black text-white",
                    "hover:border-red-500",
                    "p-4",
                    "border-2 border-transparent transition-border duration-200 rounded-full",
                    "flex items-center justify-center",
                    "group"
                )}
            >
                <AudioWaveform className={"group-hover:scale-90 transition-transform duration-200"} size={size} />
            </button>
        </div>
    )
}
