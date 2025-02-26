import { cn } from "../lib/utils"

interface SectionProps {
    label: string
    text: string
    className?: string
}

export default function Section({ label, text, className }: SectionProps) {
    return (
        <div className={cn("w-full max-w-lg mx-auto bg-white shadow-md rounded-lg border border-gray-200 p-4", className)}>
            <h2 className="text-xl font-semibold text-gray-800">{label}</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {text}
            </p>
        </div>
    )
}
