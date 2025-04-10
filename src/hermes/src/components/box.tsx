// Defines a reusable Box component for creating styled content containers.

import { forwardRef, ReactNode } from "react"
// Utility for merging CSS classes.
import { cn } from "../lib/utils"

// Defines the props accepted by the Box component.
interface BoxProps {
    // Content to be rendered inside the box. Required.
    children: ReactNode
    // Optional CSS class names for custom styling of the box container.
    className?: string
}

// The Box component renders a styled container div.
// It provides default styling like padding, background, border, rounded corners,
// and handles vertical overflow with scrolling. It supports ref forwarding.
export const Box = forwardRef<HTMLDivElement, BoxProps>(({ children, className }, ref) => {
    // Renders a div element with specific box styling.
    return (
        <div
            // Attaches the forwarded ref to the underlying div element.
            ref={ref}
            className={cn(
                // Default styles: full width, padding, background, border, rounded corners, vertical scroll on overflow.
                "w-full",
                "p-2",
                "bg-neutral-100",
                "box-border border-neutral-300 border rounded-lg",
                "overflow-y-auto",
                // Merges optional custom classes passed via props.
                className,
            )}
        >
            {/* Renders the content passed as children props inside the styled div. */}
            {children}
        </div>
    )
})
