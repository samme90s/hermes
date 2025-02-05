import { AudioWaveform } from "lucide-react"
import { cn } from "../lib/utils"

interface AudioButtonProps {
    processing: boolean
    setProcessing: (processing: boolean) => void
}

export default function AudioButton({
    processing,
    setProcessing
}: AudioButtonProps) {
    return (
        <div>
            <button
                className={cn(
                    processing && "animate-spin",
                    "bg-black",
                    "text-white",
                    "hover:border-red-500",
                    "font-bold",
                    "p-4",
                    "rounded-full",
                    "border-2",
                    "border-transparent",
                    "transition-border",
                    "duration-200"
                )}
                onClick={() => setProcessing(!processing)}
            >
                <AudioWaveform
                    className="hover:scale-90 duration-200 transition-transform"
                    size={64}
                />
            </button>
        </div>
    )
}
