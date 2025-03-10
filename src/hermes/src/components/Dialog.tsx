import { cn } from "../lib/utils"

interface DialogProps {
    children: React.ReactNode
    label?: string
    className?: string
}

export default function Dialog({ children, label, className }: DialogProps) {
    return (
        <div className={cn("max-w-[80%] bg-white shadow-md rounded-xl border border-gray-200 p-4 text-gray-700", className)}>
            {label && <h2 className="text-xl font-semibold overflow-clip overflow-ellipsis">{label}</h2>}
            {children}
        </div>
    )
}
