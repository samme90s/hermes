import { forwardRef } from "react"
import { cn } from "../lib/utils"

interface ContainerProps {
    children: React.ReactNode
    className?: string
}

function Container({ children, className }: ContainerProps, ref: React.Ref<HTMLDivElement>) {
    return (
        <div
            ref={ref}
            className={cn(
                "w-full",
                "max-h-screen",
                "p-2",
                "bg-neutral-200",
                "box-border border-neutral-300 border rounded-lg",
                "overflow-y-auto",
                className
            )}
        >
            {children}
        </div>
    )
}

export default forwardRef(Container)
