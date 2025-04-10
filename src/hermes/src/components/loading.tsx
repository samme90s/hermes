// Defines color constants and a reusable loading spinner component.

import { FC } from "react"

// Enum defining a set of named color constants with their hex values.
export enum Hex {
    BLACK = "#000000",
    BLUE = "#3b82f6",
    GREEN = "#10b981",
    RED = "#ef4444",
    WHITE = "#ffffff",
    YELLOW = "#f59e0b",
}

// Defines the props accepted by the Loading component.
interface LoadingProps {
    // The color of the spinner, selected from the Hex enum. Required.
    color: Hex
    // The size (width and height) of the spinner in pixels. Optional, default 24.
    size?: number
    // Optional CSS class names for custom styling of the container div.
    className?: string
}

// The Loading component renders an animated SVG spinner icon.
// Used to indicate ongoing processes or loading states.
export const Loading: FC<LoadingProps> = ({ color, size = 24, className }) => {
    // Renders a container div wrapping the SVG spinner.
    return (
        <div className={className}>
            {/* SVG element for the spinner graphic. */}
            <svg
                // Applies Tailwind CSS spinning animation.
                className="animate-spin"
                // Sets width and height dynamically based on the size prop.
                style={{ width: size, height: size }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24" // Defines the coordinate system for the SVG content.
            >
                {/* Background track of the spinner (static, semi-transparent circle). */}
                <circle
                    className="opacity-25" // Makes the track semi-transparent.
                    cx="12"
                    cy="12"
                    r="10" // Defines circle center and radius.
                    stroke={color} // Sets the track color.
                    strokeWidth="4" // Sets the track thickness.
                />
                {/* The moving segment of the spinner (opaque arc/wedge). */}
                <path
                    className="opacity-75" // Makes the segment more opaque than the track.
                    fill={color} // Sets the segment color.
                    // Defines the shape of the spinning segment (an arc/wedge).
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
            </svg>
        </div>
    )
}
