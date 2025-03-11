import { FC } from "react"
import { cn } from "../lib/utils"

interface DialogTextProps {
    text: string
    className?: string
}

export const DialogText: FC<DialogTextProps> = ({ text, className }) => {
    return (
        <p className={cn(
            "whitespace-pre-wrap leading-relaxed overflow-clip overflow-ellipsis",
            className
        )}>
            {text}
        </p>
    )
}
