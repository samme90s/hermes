import { forwardRef } from "react"
import { cn } from "../lib/utils"

interface BoxProps {
    children: React.ReactNode
    className?: string
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(({ children, className }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "w-full",
                "p-2",
                "bg-neutral-100",
                "box-border border-neutral-300 border rounded-lg",
                "overflow-y-auto",
                className,
            )}
        >
            {children}
        </div>
    )
})
