import { FC, useState } from "react"
import { VoiceSelector } from "./voice_selector"
import { SpeechButton } from "./speech_button"

interface TextToSpeechProps {
    text: string
}

export const TextToSpeech: FC<TextToSpeechProps> = ({ text }) => {
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
    const [isSpeaking, setIsSpeaking] = useState(false)

    // Disable the button if there is no text, speech synthesis is not supported,
    // or it is currently speaking.
    const disabled = !text.trim() || !window.speechSynthesis

    // Function to clean up Markdown for speech synthesis while keeping structure
    const sanitizeText = (input: string) => {
        return input
            .replace(/#+\s*/g, "") // Remove markdown headers (e.g., `# Title`, `## Subtitle`)
            .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1") // Remove bold (`**bold**`) and italic (`*italic*`)
            .replace(/`([^`]+)`/g, "$1") // Remove inline code (e.g., `code`)
            .replace(/^\s*[-*]\s+/gm, "") // Remove list prefixes (`- item`, `* item`)
            .replace(/```[\s\S]*?```/g, "") // Remove fenced code blocks
            .replace(/\n{2,}/g, ". ") // Convert double new lines into a pause
            .trim()
    }

    function handleSpeech(): void {
        if (!window.speechSynthesis) {
            console.error("SpeechSynthesis not supported")
            return
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
            return
        }

        const cleanText = sanitizeText(text)

        if (cleanText.length === 0) {
            console.error("No valid text to speak")
            return
        }

        const utterance = new SpeechSynthesisUtterance(cleanText)

        if (selectedVoice) {
            utterance.voice = selectedVoice
        }

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        window.speechSynthesis.speak(utterance)
    }

    return (
        <div className="flex items-center gap-2">
            {/* Voice Selector with Flex Grow */}
            <VoiceSelector
                selectedVoice={selectedVoice}
                onChange={setSelectedVoice}
                className="flex-grow"
            />
            {/* Speech Button with Fixed Size */}
            <SpeechButton
                onClick={handleSpeech}
                isSpeaking={isSpeaking}
                disabled={disabled}
            />
        </div>
    )
}

