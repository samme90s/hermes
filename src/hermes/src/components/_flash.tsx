import { FC } from "react"
import { cn } from "../lib/utils"

interface FlashProps {
    message: string
    className?: string
}

export const Flash: FC<FlashProps> = ({ message, className }) => {
    return (
        <div
            className={cn(
                "bg-neutral-800",
                "border border-neutral-500 rounded-md",
                "p-2",
                "text-white",
                "overflow-auto",
                className
            )}
        >
            {message}
        </div>
    )
}
