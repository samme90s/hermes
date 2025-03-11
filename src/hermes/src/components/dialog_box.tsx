import { FC } from "react"
import { cn } from "../lib/utils"

interface DialogBoxProps {
    children: React.ReactNode
    label?: string
    className?: string
}

export const DialogBox: FC<DialogBoxProps> = ({ children, label, className }) => {
    return (
        <div className={cn("flex flex-row items-center bg-white shadow-md rounded-xl border border-gray-200 p-1 text-gray-700", className)}>
            {label && <h3 className="mr-2 text-md font-semibold overflow-clip overflow-ellipsis">{label}</h3>}
            {children}
        </div>
    )
}
