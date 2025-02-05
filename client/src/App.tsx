import { useState } from "react"
import { AudioWaveform } from "lucide-react"
import { cn } from "./lib/utils"

function App() {
    const [processing, setProcessing] = useState(false)

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <button
                className={cn(
                    processing && "animate-spin",
                    "bg-black",
                    "text-white",
                    "hover:border-red-500",
                    "font-bold",
                    "p-4",
                    "rounded-full",
                    "border-2",
                    "border-transparent",
                    "transition-border",
                    "duration-200"
                )}
                onClick={() => setProcessing(!processing)}
            >
                <AudioWaveform
                    className="hover:scale-90 duration-200 transition-transform"
                    size={64}
                />
            </button>
        </div>
    )
}

export default App
