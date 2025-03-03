import { useEffect, useRef, useState } from "react"
import AudioRecorder from "./components/AudioRecorder"
import { requestAudioTranscription } from "./services/api"
import Loading from "./components/Loading"
import { HexColors } from "./lib/colors"
import Dialog from "./components/Dialog"
import Container from "./components/Container"

enum DialogAlignment {
    START = "self-start",
    END = "self-end"
}

interface DialogItem {
    text: string
    alignment: DialogAlignment
}

export default function App() {
    const [blob, setBlob] = useState<Blob | null>(null)
    const [answerLoading, setAnswerLoading] = useState<boolean>(false)
    const [promptLoading, setPromptLoading] = useState<boolean>(false)
    const [dialogs, setDialogs] = useState<DialogItem[]>([])

    // Create a ref for the Container to control its scrolling
    const containerRef = useRef<HTMLDivElement>(null)
    // Auto-scroll the Container to the bottom when new dialogs or loading states update
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
    }, [dialogs, promptLoading, answerLoading])

    function createDialogElement(dialog: DialogItem) {
        return (
            <Dialog
                key={crypto.randomUUID()}
                className={dialog.alignment}
            >
                {dialog.text}
            </Dialog>
        )
    }

    async function handlePrompt(): Promise<void> {
        try {
            if (!blob) return
            setPromptLoading(true)
            const res = await requestAudioTranscription(blob)
            setDialogs(prev => [...prev, {text: res.transcription, alignment: DialogAlignment.END}])
            setPromptLoading(false)
            await handleAnswer()
        } catch (err: any) {
            const errorMessage = err?.message || "Something went wrong..."
            setDialogs(prev => [...prev, {text: errorMessage, alignment: DialogAlignment.END}])
        } finally {
            setPromptLoading(false)
        }
    }

    async function handleAnswer(): Promise<void> {
        try {
            if (!prompt) return
            setAnswerLoading(true)
            // Simulate wait time
            await new Promise(resolve => setTimeout(resolve, 1000))
            setDialogs(prev => [...prev, {text: "...", alignment: DialogAlignment.START}])
        } catch (err: any) {
            const errorMessage = err?.message || "Something went wrong..."
            setDialogs(prev => [...prev, {text: errorMessage, alignment: DialogAlignment.START}])
        } finally {
            setAnswerLoading(false)
        }
    }

    useEffect(() => void handlePrompt(), [blob])

    return (
        <div className="max-w-lg h-screen mx-auto flex flex-col items-center justify-center space-y-4">
            <Container ref={containerRef} className="max-h-screen flex-1 flex flex-col space-y-4">
                {dialogs.map(createDialogElement)}
                {promptLoading && <Dialog className={DialogAlignment.END}><Loading color={HexColors.RED} /></Dialog>}
                {answerLoading && <Dialog className={DialogAlignment.START}><Loading color={HexColors.RED} /></Dialog>}
                <AudioRecorder
                    disabled={(promptLoading || answerLoading)}
                    onChange={setBlob}
                    className="mx-auto"
                />
            </Container>
        </div>
    )
}
