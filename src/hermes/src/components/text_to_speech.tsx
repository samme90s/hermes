import { FC, ReactNode, useState, useRef } from "react"
import { SpeechButton } from "./speech_button"

interface TextToSpeechProps {
    text: string
    voice?: SpeechSynthesisVoice
    children?: ReactNode
}

export const TextToSpeech: FC<TextToSpeechProps> = ({ text, voice, children }) => {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

    // Disable the button if there is no text, speech synthesis is not supported.
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

    const speak = () => {
        if (!window.speechSynthesis) {
            console.error("SpeechSynthesis is not supported")
            return
        }

        if (utteranceRef.current) {
            window.speechSynthesis.cancel()
        }

        if (!text.trim()) {
            return
        }

        const sanitizedText = sanitizeText(text)

        const utterance = new SpeechSynthesisUtterance(sanitizedText)
        if (voice) {
            utterance.voice = voice
        }
        utteranceRef.current = utterance

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        window.speechSynthesis.speak(utterance)
    }

    const stopSpeaking = () => {
        if (utteranceRef.current) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
        }
    }

    return (
        <div className="w-full">
            <div>{children}</div>
            <SpeechButton
                onClick={isSpeaking ? stopSpeaking : speak}
                isSpeaking={isSpeaking}
                disabled={disabled}
            />
        </div>
    )
}
