import { AudioWaveform } from "lucide-react"
import { cn } from "../lib/utils"

interface AudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    anim: boolean
}

export default function AudioButton({ anim, ...props }: AudioButtonProps) {
    return (
        <div className="flex items-center justify-center h-full">
            <button
                {...props}
                className={cn(
                    anim && "animate-spin",
                    anim && "shadow-red-500",
                    "bg-black",
                    "text-white",
                    "hover:border-red-500",
                    "font-bold",
                    "p-4",
                    "rounded-full",
                    "border-2",
                    "border-transparent",
                    "transition-border",
                    "duration-200",
                    "flex",
                    "items-center",
                    "justify-center",
                    "group" // add this to make children aware of the parent's hover state
                )}
                // Custom
                style={{
                    boxShadow: anim ? "0 0 15px 5px rgba(255, 0, 0, 0.5)" : "0 0 10px rgba(0, 0, 0, 0.5)"
                }}
            >
                <AudioWaveform
                    className={cn(
                        "group-hover:scale-90", // this applies scale-90 when parent is hovered
                        "duration-200",
                        "transition-transform"
                    )}
                    size={128}
                />
            </button>
        </div>
    )
}
