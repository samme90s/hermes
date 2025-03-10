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
                "p-2",
                "bg-neutral-100",
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
