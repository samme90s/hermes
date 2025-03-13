import { FC } from "react"
import { cn } from "../lib/utils"

interface DialogBoxProps {
    text: string
    label?: string
    className?: string
}

export const DialogBox: FC<DialogBoxProps> = ({ text, label, className }) => {
    return (
        <div className={cn("p-1 text-gray-700", className)}>
            <p className="w-full whitespace-normal break-all leading-relaxed">
                {label && <span className="mr-2 whitespace-nowrap text-md font-semibold overflow-clip overflow-ellipsis">{label}</span>}
                {text}
            </p>
        </div>
    )
}
