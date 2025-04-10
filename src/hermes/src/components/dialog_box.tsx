// Defines a DialogBox component capable of rendering Markdown formatted text safely.

import { FC } from "react"
// Utility for merging CSS classes.
import { cn } from "../lib/utils"
// Library for parsing Markdown to HTML.
import { marked } from "marked"
// Hook for managing asynchronous operations like parsing.
import { useQuery } from "@tanstack/react-query"
// Library for sanitizing HTML to prevent XSS attacks.
import DOMPurify from "dompurify"

// Defines the props accepted by the DialogBox component.
interface DialogBoxProps {
    // The main text content, potentially containing Markdown. Required.
    text: string
    // An optional label displayed before the text content.
    label?: string
    // Optional CSS class names for custom styling of the container.
    className?: string
}

// The DialogBox component displays text content, optionally preceded by a label.
// It interprets the input text as Markdown, converts it to HTML, sanitizes it,
// and renders the final HTML content.
export const DialogBox: FC<DialogBoxProps> = ({ text, label, className }) => {
    // Use React Query to parse Markdown text to raw HTML asynchronously.
    // Caches the result based on the input text.
    const { data: rawHtml } = useQuery({
        // Query key includes text, so it re-runs only when text changes.
        queryKey: ["markdown", text],
        // The function that performs the Markdown parsing.
        queryFn: async () => {
            // Note: marked might return a Promise or string depending on options/version.
            // Assuming it returns a string or Promise resolving to string here.
            return marked(text) as string | Promise<string> // Adjust type assertion if needed
        },
        // Ensures the query only runs if text has content.
        enabled: !!text,
    })

    // Sanitize the generated HTML using DOMPurify to prevent XSS vulnerabilities
    // before rendering it with dangerouslySetInnerHTML.
    // Uses an empty string if rawHtml is not yet available.
    const sanitizedHtml = rawHtml ? DOMPurify.sanitize(rawHtml as string) : "" // Cast rawHtml if needed

    // Renders the dialog box container and its content.
    return (
        // Main container div with default padding and text color.
        <div className={cn("p-1 text-gray-700", className)}>
            {/* Conditionally renders the label if provided, with styling. */}
            {label && <span className="mr-2 text-md font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
            {/* Renders the sanitized HTML content. */}
            {/* The 'markdown-content' class (defined elsewhere in CSS) provides specific styling for rendered Markdown. */}
            {/* dangerouslySetInnerHTML is used to render the HTML string; requires careful sanitization beforehand. */}
            <div className="p-0 m-0 w-full markdown-content" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        </div>
    )
}
