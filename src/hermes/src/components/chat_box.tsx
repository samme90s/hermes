import { FC, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react"
import { cn } from "../lib/utils"

interface ChatBoxProps
    extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
    onChange: (value: string) => void
    onSubmit?: () => void
    onError?: (error: unknown) => void
    className?: string
}

export const ChatBox: FC<ChatBoxProps> = ({
    value,
    onChange,
    onSubmit,
    onError,
    className,
    ...props
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize the textarea based on its content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [value])

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        try {
            onChange(e.target.value)
        } catch (error) {
            if (onError) {
                onError(error)
            }
        }
    }

    // Handle keydown event to submit on "Enter" (without Shift)
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault() // Prevent newline
            onSubmit?.() // Call submit function
        }
    }

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={cn(
                "w-full p-2 bg-white text-black border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all duration-200",
                className
            )}
            {...props}
        />
    )
}
