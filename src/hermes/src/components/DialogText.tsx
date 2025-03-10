import { cn } from "../lib/utils"

interface DialogTextProps {
    text: string
    className?: string
}

export default function DialogText({ text, className }: DialogTextProps) {
    return (
        <p className={cn(
            "whitespace-pre-wrap leading-relaxed overflow-clip overflow-ellipsis",
            className
        )}>
            {text}
        </p>
    )
}
