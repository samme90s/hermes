import { FC } from "react"
import { Mic, MessageCircle } from "lucide-react"
import { cn } from "../lib/utils"

interface ToggleInputProps {
    onSwitch: () => void
    toggled: boolean
    className?: string
}

export const ToggleInput: FC<ToggleInputProps> = ({ onSwitch, toggled, className }) => (
    <button
        onClick={onSwitch}
        className={cn("p-2 rounded hover:bg-gray-200 focus:outline-none", className)}
        title={toggled ? "Chat" : "Voice"}
    >
        {
            toggled
                ? <MessageCircle className="h-6 w-6 text-gray-700" />
                : <Mic className="h-6 w-6 text-gray-700" />
        }
    </button >
)
