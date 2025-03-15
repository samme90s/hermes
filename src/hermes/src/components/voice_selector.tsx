import { FC } from "react"
import { useQuery } from "@tanstack/react-query"

interface VoiceSelectorProps {
    onChange: (voice: SpeechSynthesisVoice) => void
    className?: string
}

const fetchVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
            return resolve(voices)
        }

        const handleVoicesChanged = () => {
            const updatedVoices = window.speechSynthesis.getVoices()
            if (updatedVoices.length > 0) {
                // Clean up the event listener to prevent memory leaks
                window.speechSynthesis.onvoiceschanged = null
                resolve(updatedVoices)
            }
        }

        window.speechSynthesis.onvoiceschanged = handleVoicesChanged
    })
}

export const VoiceSelector: FC<VoiceSelectorProps> = ({ onChange, className }) => {
    const { data: voices = [], isLoading } = useQuery({
        queryKey: ["voices"],
        queryFn: fetchVoices
    })

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newVoice = voices.find((voice) => voice.name === e.target.value)
        if (newVoice) onChange(newVoice)
    }

    return (
        <div className={className}>
            {isLoading
                ? <span className="text-gray-500">Loading voices...</span>
                : <select onChange={handleChange} className="w-full p-2 rounded border border-gray-300">
                    {voices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                        </option>
                    ))}
                </select>
            }
        </div>
    )
}
