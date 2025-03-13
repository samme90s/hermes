import { FC } from "react"
import { cn } from "../lib/utils"
import { marked } from "marked"
import { useQuery } from "@tanstack/react-query"
import DOMPurify from "dompurify"

interface DialogBoxProps {
    text: string
    label?: string
    className?: string
}

export const DialogBox: FC<DialogBoxProps> = ({ text, label, className }) => {
    // Convert the markdown text to HTML
    const { data: rawHtml } = useQuery({
        queryKey: ["markdown", text],
        queryFn: async () => {
            return marked(text)
        },
        enabled: !!text // Only run if the text is not empty
    })

    // Sanitize the HTML output
    // States that it is a "uber-tolerant XSS sanitizer for HTML, ..."
    // Should help when using the dangerouslySetInnerHTML attribute
    const sanitizedHtml = rawHtml ? DOMPurify.sanitize(rawHtml) : ""

    return (
        <div className={cn("p-1 text-gray-700", className)}>
            {label && (
                <span className="mr-2 text-md font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                    {label}
                </span>
            )}
            {/* markdown-content is a custom styling set in the css file and ensures content wraps */}
            <div
                className="p-0 m-0 w-full markdown-content"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
        </div>
    )
}
