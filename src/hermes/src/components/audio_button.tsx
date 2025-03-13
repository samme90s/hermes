import { AudioLines } from "lucide-react"
import { cn } from "../lib/utils"
import { FC } from "react"

interface AudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pulse: boolean
    className?: string
}

export const AudioButton: FC<AudioButtonProps> = ({ pulse, className, ...props }) => {
    return (
        <button
            {...props}
            className={cn(
                "flex items-center justify-center",
                "group", // Group Elements to scale on button hover
                className
            )}
        >
            <AudioLines
                className={cn(
                    "h-full w-full",
                    "group-hover:scale-y-110",
                    "hover:text-blue-500",
                    "transition-all duration-200",
                    pulse && "text-red-500 animate-pulse"
                )}
            />
        </button>
    )
}
